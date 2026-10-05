import { MongoClient } from 'mongodb'

let clientPromise
let clientUri
let indexPromise
let indexDatabase

async function getStore(uri, database) {
  if (!clientPromise || clientUri !== uri) {
    clientUri = uri
    const client = new MongoClient(uri, {
      maxPoolSize: 5,
      minPoolSize: 0,
      serverSelectionTimeoutMS: 4000,
      connectTimeoutMS: 4000,
      timeoutMS: 5000
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
  return { client, counters, visitors, windows, rates }
}

export async function closeMongoStatsConnection() {
  if (clientPromise) await (await clientPromise).close()
  clientPromise = null
  indexPromise = null
}

async function ensureCounter(counters, id) {
  try {
    await counters.updateOne(
      { _id: id },
      { $setOnInsert: { pv: 0, uv: 0 } },
      { upsert: true }
    )
  } catch (error) {
    // 并发首次访问可能同时创建同一个计数器；唯一 _id 保证只有一份。
    if (error.code !== 11000) throw error
  }
}

async function checkRate(rates, id, limit, now) {
  let result
  try {
    result = await rates.findOneAndUpdate(
      { _id: id },
      {
        $inc: { hits: 1 },
        $setOnInsert: { expiresAt: new Date(now + 120000) }
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
  // 事务中的操作必须串行执行。
  const site = await store.counters.findOne({ _id: ids.site }, { session })
  const today = await store.counters.findOne({ _id: ids.today }, { session })
  const article = ids.article
    ? await store.counters.findOne({ _id: ids.article }, { session })
    : null
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
  const allowed = await checkRate(
    store.rates,
    `${config.prefix}:visitor:${visitor}:${minute}`,
    60,
    now
  )
  const networkAllowed = await checkRate(
    store.rates,
    `${config.prefix}:network:${network}:${minute}`,
    240,
    now
  )
  if (!allowed || !networkAllowed) return ['rate_limited']

  await ensureCounter(store.counters, ids.site)
  await ensureCounter(store.counters, ids.today)
  if (ids.article) await ensureCounter(store.counters, ids.article)

  const windowId = `${config.prefix}:${ids.day}:${visitor}:${identity}`
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
              const siteVisitor = await store.visitors.updateOne(
                { _id: `${config.prefix}:all:${visitor}` },
                { $setOnInsert: { createdAt: new Date(now) } },
                { upsert: true, session }
              )
              const dayVisitor = await store.visitors.updateOne(
                { _id: `${config.prefix}:${ids.day}:${visitor}` },
                { $setOnInsert: { expiresAt: new Date(now + 172800000) } },
                { upsert: true, session }
              )
              await store.counters.updateOne(
                { _id: ids.site },
                { $inc: { pv: 1, uv: siteVisitor.upsertedCount } },
                { session }
              )
              await store.counters.updateOne(
                { _id: ids.today },
                { $inc: { pv: 1, uv: dayVisitor.upsertedCount } },
                { session }
              )
              if (ids.article)
                await store.counters.updateOne(
                  { _id: ids.article },
                  { $inc: { pv: 1 } },
                  { session }
                )
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
