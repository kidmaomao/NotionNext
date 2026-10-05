import { MongoClient } from 'mongodb'

let clientPromise
let clientUri
let indexPromise
let indexDatabase

export async function getStore(uri, database) {
  if (!clientPromise || clientUri !== uri) {
    clientUri = uri
    const client = new MongoClient(uri, {
      maxPoolSize: 5,
      minPoolSize: 0,
      serverSelectionTimeoutMS: 4000,
      connectTimeoutMS: 4000,
      // 批量写入会重复解析继承选项；用 socket 超时避免与事务总超时冲突。
      socketTimeoutMS: 5000
    })
    clientPromise = client.connect().catch(async error => {
      clientPromise = null
      indexPromise = null
      await client.close()
      throw error
    })
    indexPromise = null
  }
  const client = await clientPromise
  const db = client.db(database)
  const counters = db.collection('visit_stats_counters')
  const visitors = db.collection('visit_stats_visitors')
  const windows = db.collection('visit_stats_windows')
  const rates = db.collection('visit_stats_rates')
  if (!indexPromise || indexDatabase !== database) {
    indexDatabase = database
    indexPromise = Promise.all([
      visitors.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
      windows.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
      rates.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
    ]).catch(error => {
      indexPromise = null
      throw error
    })
  }
  await indexPromise
  return { client, db, counters, visitors, windows, rates }
}

export async function closeMongoStatsConnection() {
  if (clientPromise) await (await clientPromise).close()
  clientPromise = null
  indexPromise = null
}

async function ensureCounters(counters, ids) {
  try {
    await counters.bulkWrite(
      [ids.site, ids.today, ids.article].filter(Boolean).map(id => ({
        updateOne: {
          filter: { _id: id },
          update: { $setOnInsert: { pv: 0, uv: 0 } },
          upsert: true
        }
      })),
      { ordered: false }
    )
  } catch (error) {
    // 并发首次访问可能同时创建同一个计数器；唯一 _id 保证只有一份。
    if (
      !error.writeErrors?.length ||
      error.writeErrors.some(item => item.code !== 11000) ||
      error.writeConcernErrors?.length
    )
      throw error
  }
}

export async function checkRate(rates, id, limit, now, ttl = 120000) {
  let result
  try {
    result = await rates.findOneAndUpdate(
      { _id: id },
      {
        $inc: { hits: 1 },
        $setOnInsert: { expiresAt: new Date(now + ttl) }
      },
      { upsert: true, returnDocument: 'after' }
    )
  } catch (error) {
    if (error.code !== 11000) throw error
    result = await rates.findOneAndUpdate(
      { _id: id },
      { $inc: { hits: 1 } },
      { returnDocument: 'after' }
    )
  }
  return result && result.hits <= limit
}

async function readCounters(store, ids, session) {
  const documents = await store.counters
    .find(
      { _id: { $in: [ids.site, ids.today, ids.article].filter(Boolean) } },
      { session }
    )
    .toArray()
  const byId = new Map(documents.map(document => [document._id, document]))
  const site = byId.get(ids.site)
  const today = byId.get(ids.today)
  const article = byId.get(ids.article)
  return [
    site?.pv ?? 0,
    site?.uv ?? 0,
    today?.pv ?? 0,
    today?.uv ?? 0,
    article?.pv ?? 0
  ]
}

export async function readMongoStats(config, ids) {
  const store = await getStore(config.uri, config.database)
  return readCounters(store, ids)
}

export async function recordMongoVisit(
  config,
  ids,
  visitor,
  network,
  identity,
  now
) {
  const store = await getStore(config.uri, config.database)
  const minute = Math.floor(now / 60000)
  // 限流操作在事务外且互相独立，可以同时执行。
  const [allowed, networkAllowed] = await Promise.all([
    checkRate(
      store.rates,
      `${config.prefix}:visitor:${visitor}:${minute}`,
      60,
      now
    ),
    checkRate(
      store.rates,
      `${config.prefix}:network:${network}:${minute}`,
      240,
      now
    )
  ])
  if (!allowed || !networkAllowed) return ['rate_limited']

  const windowId = `${config.prefix}:${ids.day}:${visitor}:${identity}`
  const previous = await store.windows.findOne({ _id: windowId })
  // 已完成的访问无需再次开启事务；首次访问仍在事务中重新检查窗口。
  if (previous && previous.expiresAt.getTime() > now) {
    return readCounters(store, ids)
  }
  await ensureCounters(store.counters, ids)
  const session = store.client.startSession()
  try {
    // 唯一访客的首次并发 upsert 在部分 MongoDB 版本中会返回重复键错误。
    // 重新执行整个事务，不能只重试单条写操作。
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        return await session.withTransaction(
          async () => {
            const recent = await store.windows.findOne(
              { _id: windowId },
              { session }
            )
            if (!recent || recent.expiresAt.getTime() <= now) {
              await store.windows.updateOne(
                { _id: windowId },
                { $set: { expiresAt: new Date(now + 300000) } },
                { upsert: true, session }
              )
              // 事务内用批量操作减少往返，保持顺序和原子性。
              const visitors = await store.visitors.bulkWrite(
                [
                  {
                    updateOne: {
                      filter: { _id: `${config.prefix}:all:${visitor}` },
                      update: { $setOnInsert: { createdAt: new Date(now) } },
                      upsert: true
                    }
                  },
                  {
                    updateOne: {
                      filter: { _id: `${config.prefix}:${ids.day}:${visitor}` },
                      update: {
                        $setOnInsert: { expiresAt: new Date(now + 172800000) }
                      },
                      upsert: true
                    }
                  }
                ],
                { session }
              )
              const increments = [
                {
                  updateOne: {
                    filter: { _id: ids.site },
                    update: {
                      $inc: { pv: 1, uv: Number(0 in visitors.upsertedIds) }
                    }
                  }
                },
                {
                  updateOne: {
                    filter: { _id: ids.today },
                    update: {
                      $inc: { pv: 1, uv: Number(1 in visitors.upsertedIds) }
                    }
                  }
                }
              ]
              if (ids.article)
                increments.push({
                  updateOne: {
                    filter: { _id: ids.article },
                    update: { $inc: { pv: 1 } }
                  }
                })
              await store.counters.bulkWrite(increments, { session })
            }
            return readCounters(store, ids, session)
          },
          {
            readConcern: { level: 'snapshot' },
            writeConcern: { w: 'majority' },
            timeoutMS: 4500
          }
        )
      } catch (error) {
        if (error.code !== 11000 || attempt === 2) throw error
      }
    }
  } finally {
    await session.endSession()
  }
}
