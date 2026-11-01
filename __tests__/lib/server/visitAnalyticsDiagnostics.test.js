/** @jest-environment node */
import { analyticsStage } from '@/lib/server/visitAnalyticsDiagnostics'

test('records stage timing without logging successful query results', async () => {
  const info = jest.spyOn(console, 'info').mockImplementation(() => {})
  const result = { visitor: 'private-identifier', uri: 'secret-connection' }
  await expect(
    analyticsStage('summary', () => Promise.resolve(result))
  ).resolves.toBe(result)
  expect(info).toHaveBeenCalledWith('[visit-analytics]', {
    stage: 'summary',
    status: 'ok',
    elapsedMs: expect.any(Number)
  })
  expect(JSON.stringify(info.mock.calls)).not.toContain('private-identifier')
  expect(JSON.stringify(info.mock.calls)).not.toContain('secret-connection')
})

test('records MongoDB diagnostic codes but excludes messages, stacks and data', async () => {
  const log = jest.spyOn(console, 'error').mockImplementation(() => {})
  const error = Object.assign(new Error('mongodb://private-credentials'), {
    name: 'MongoServerError',
    code: 292,
    codeName: 'QueryExceededMemoryLimitNoDiskUseAllowed',
    visitor: 'private-visitor'
  })
  await expect(
    analyticsStage('journeys', () => Promise.reject(error))
  ).rejects.toBe(error)
  expect(log).toHaveBeenCalledWith('[visit-analytics]', {
    stage: 'journeys',
    status: 'error',
    elapsedMs: expect.any(Number),
    name: 'MongoServerError',
    code: 292,
    codeName: 'QueryExceededMemoryLimitNoDiskUseAllowed'
  })
  expect(JSON.stringify(log.mock.calls)).not.toMatch(/private-|mongodb|stack/)
})

test('unrecognized error metadata is not copied into logs', async () => {
  const log = jest.spyOn(console, 'error').mockImplementation(() => {})
  const error = {
    name: 'private-name',
    code: 'private-code',
    codeName: 'private-code-name'
  }
  await expect(
    analyticsStage('summary', () => {
      throw error
    })
  ).rejects.toBe(error)
  expect(log.mock.calls[0][1]).toEqual({
    stage: 'summary',
    status: 'error',
    elapsedMs: expect.any(Number),
    name: 'OtherError'
  })
})
