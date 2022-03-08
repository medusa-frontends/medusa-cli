import 'zx/globals'
import { readEnvironment } from '@app/configs/environment'
import { foreachApp } from '@app/lib/apps/foreach'
import { appHasScript, runAppScript } from '@app/lib/apps/scripts'
import { readCLIConfig } from '@app/lib/config'
import { EnvironmentNotFoundException } from '@app/lib/exceptions'
import { showStatus } from '@app/model/status'
import { AppMeta, ScriptKey } from '../../types'
import { generate } from '../generate'

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
