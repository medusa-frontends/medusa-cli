import { MESSAGES } from '@medusa-frontends/webpack-plugin'
import { combine, createEvent, createStore, guard, sample } from 'effector'
import { appLogReceived, $appLogs } from './logs'

type AppBaseSummary = {
  app: string
  status: string
}

type AppComputedSummary = {
  infoCount: number
  errorCount: number
}

type AppSummary = AppBaseSummary & AppComputedSummary

const $appBaseSummary = createStore<AppBaseSummary[]>([])

export const appSummaryUpdated = createEvent<AppBaseSummary>()

$appBaseSummary.on(appSummaryUpdated, (current, update) => {
  const appSummary = current.find(({ app }) => app === update.app)
  if (!appSummary) return current.concat(update)

  return current.map((summary) => {
    if (summary.app !== update.app) return summary
    return { ...summary, status: update.status }
  })
})

export const $appSummary = combine({
  baseSummary: $appBaseSummary,
  logs: $appLogs,
}).map<AppSummary[]>(({ baseSummary, logs }) => {
  return baseSummary.map((summary) => ({
    ...summary,
    infoCount: logs.info[summary.app]?.length ?? 0,
    errorCount: logs.error[summary.app]?.length ?? 0,
  }))
})

const statusTriggers = [
  { phrase: 'Project is running at:', status: chalk.green('Ready') },
  { phrase: MESSAGES.BEFORE_COMPILE(), status: chalk.yellow('Compiling..') },
  { phrase: MESSAGES.AFTER_COMPILE(), status: chalk.green('Ready') },
]

for (const { phrase, status } of statusTriggers) {
  sample({
    source: guard({
      source: appLogReceived,
      filter: ({ message }) => message.includes(phrase),
    }),
    fn: ({ app }) => ({ app, status }),
    target: appSummaryUpdated,
  })
}
