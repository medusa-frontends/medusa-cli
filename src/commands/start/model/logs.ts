import { combine, createEvent, createStore, sample, split } from 'effector'
import { createLogs } from '../../../lib/logs'
import { errorsForAppRequested, infoForAppRequested, summaryRequested } from './commands'

export type LogLevel = 'summary' | 'info' | 'error'

type LogReceive = {
  app: string
  message: string
  level: LogLevel
}

const appInfoLogs = createLogs({ prefix: (key) => `[Info for "${key}"]` })
const appErrorLogs = createLogs({ prefix: (key) => `[Error for "${key}"]` })

export const $appLogs = combine({
  info: appInfoLogs.registry,
  error: appErrorLogs.registry,
})

export const $activeLogsLevel = createStore<LogLevel>('summary')
export const $activeLogsApp = createStore<string | null>(null)

export const appLogReceived = createEvent<LogReceive>()
const appInfoReceived = createEvent<LogReceive>()
const appErrorReceived = createEvent<LogReceive>()

$activeLogsLevel
  .on(summaryRequested, () => 'summary')
  .on(infoForAppRequested, () => 'info')
  .on(errorsForAppRequested, () => 'error')

$activeLogsApp
  .on(summaryRequested, () => null)
  .on(infoForAppRequested, (_, { app }) => app)
  .on(errorsForAppRequested, (_, { app }) => app)

split({
  source: appLogReceived,
  match: {
    info: (log) => log.level === 'info',
    error: (log) => log.level === 'error',
  },
  cases: {
    info: appInfoReceived,
    error: appErrorReceived,
  },
})

sample({
  source: appInfoReceived,
  fn: ({ app, message }) => ({ key: app, message }),
  target: appInfoLogs.write,
})

sample({
  source: appErrorReceived,
  fn: ({ app, message }) => ({ key: app, message }),
  target: appErrorLogs.write,
})
