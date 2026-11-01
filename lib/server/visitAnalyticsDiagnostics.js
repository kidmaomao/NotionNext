const errorNames = new Set([
  'Error',
  'TypeError',
  'RangeError',
  'MongoServerError',
  'MongoNetworkError',
  'MongoNetworkTimeoutError',
  'MongoServerSelectionError',
  'MongoWaitQueueTimeoutError',
  'MongoOperationTimeoutError'
])
const codeNames = new Set([
  'QueryExceededMemoryLimitNoDiskUseAllowed',
  'ExceededMemoryLimit',
  'MaxTimeMSExpired',
  'BSONObjectTooLarge',
  'SortOperationUsedMoreThan32MB'
])

// Only fixed stage names, timing and allowlisted error metadata reach logs.
// Never log the error object/message, query, visitor records or connection URI.
export async function analyticsStage(stage, run) {
  const started = Date.now()
  try {
    const result = await run()
    console.info('[visit-analytics]', {
      stage,
      status: 'ok',
      elapsedMs: Date.now() - started
    })
    return result
  } catch (error) {
    console.error('[visit-analytics]', {
      stage,
      status: 'error',
      elapsedMs: Date.now() - started,
      name: errorNames.has(error?.name) ? error.name : 'OtherError',
      ...(Number.isSafeInteger(error?.code) ? { code: error.code } : {}),
      ...(codeNames.has(error?.codeName) ? { codeName: error.codeName } : {})
    })
    throw error
  }
}
