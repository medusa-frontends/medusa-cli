import 'zx/globals'
import { readEnvironment } from '../configs/environment'
import { foreachApp } from '../lib/apps/foreach'
import { appHasScript, runAppScript } from '../lib/apps/scripts'
import { readCLIConfig } from '../lib/config'
import { EnvironmentNotFoundException } from '../lib/exceptions'
import { showStatus } from '../model/status'
import { AppMeta, ScriptKey } from '../types'
import { generate } from './generate'

type BuildOptions = {
  buildScriptKey: ScriptKey
  prebuildScriptKey: ScriptKey
}

export async function build({ buildScriptKey, prebuildScriptKey }: BuildOptions) {
  await generate()

  const { apps } = await readCLIConfig()

  const buildApp = async ({ app }: AppMeta) => {
    const environment = await readEnvironment(app)
    if (!environment) throw new EnvironmentNotFoundException(app)

    if (await appHasScript(app, prebuildScriptKey)) {
      showStatus({ text: `Running prebuild for "${app}"..` })
      const wrapped = await runAppScript(app, prebuildScriptKey)
      await wrapped.processPromise()
    }

    showStatus({ text: `Building "${app}"..` })
    const wrapped = await runAppScript(app, buildScriptKey)
    await wrapped.processPromise()
  }

  await foreachApp({
    apps,
    deep: true,
    callback: buildApp,
  })
}
