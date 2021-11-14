import debounce from 'lodash.debounce'
import 'zx/globals'
import { readEnvironment } from '../../configs/environment'
import { appHasScript, runAppScript } from '../../lib/apps/scripts'
import { readCLIConfig } from '../../lib/config'
import { EnvironmentNotFoundException } from '../../lib/exceptions'
import { foreachApp, mapApps } from '../../lib/apps/foreach'
import { AppMeta, ScriptKey } from '../../types'
import { generate } from '../generate'
import { appLogReceived, appSummaryUpdated, LogLevel } from './model'

type StartOptions = {
  startScriptKey: ScriptKey
  prestartScriptKey: ScriptKey
}

export async function start({ startScriptKey, prestartScriptKey }: StartOptions) {
  await generate()

  const { apps } = await readCLIConfig()

  const restartCounts: Record<string, number> = {}
  const restartResets: Record<string, ReturnType<typeof debounce>> = {}

  const RESTART_INTERVAL_RESET = 2000
  const RESTART_INTERVAL = 5000

  const beforeRestart = async (app: string) => {
    restartCounts[app] += 1
    if (restartCounts[app] > 1) {
      restartResets[app].cancel()
      await sleep(RESTART_INTERVAL)
    }
    restartResets[app]()
  }

  await foreachApp({
    apps,
    deep: true,
    callback: ({ app }) => {
      restartCounts[app] = 0
      const resetRestart = () => (restartCounts[app] = 0)
      restartResets[app] = debounce(resetRestart, RESTART_INTERVAL_RESET)
    },
  })

  const startApp = async (meta: AppMeta, restarting = false): Promise<void> => {
    const { app } = meta

    const environment = await readEnvironment(app)
    if (!environment) throw new EnvironmentNotFoundException(app)

    const { port } = environment

    if (await appHasScript(app, prestartScriptKey)) {
      const wrapped = await runAppScript(app, prestartScriptKey)
      await wrapped.processPromise()
    }

    const wrapped = await runAppScript(app, startScriptKey, { port })
    const process = wrapped.processPromise()
    const status = chalk.yellow(restarting ? 'Restarting..' : 'Starting..')
    appSummaryUpdated({ app, status })

    const handler = (app: string, level: LogLevel) => {
      return (buffer: Buffer) => {
        const message = buffer.toString()
        appLogReceived({ app, level, message })
      }
    }

    process.stdout.removeAllListeners('data')
    process.stderr.removeAllListeners('data')
    process.stdout.on('data', handler(app, 'info'))
    process.stderr.on('data', handler(app, 'error'))

    try {
      await process
    } catch {
      appSummaryUpdated({ app, status: chalk.red('Crashed, waiting..') })
      await beforeRestart(app)
      return startApp(meta, true)
    }
  }

  const promises = await mapApps({
    apps,
    deep: true,
    map: startApp,
  })

  await Promise.all(promises)
}
