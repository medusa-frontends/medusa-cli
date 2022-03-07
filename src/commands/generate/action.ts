import { generateEnvironment } from '../../configs/environment'
import { generateExposesTypes } from '../../configs/exposes'
import { generatePluginOptions } from '../../configs/plugin-options'
import { foreachApp } from '../../lib/apps/foreach'
import { appHasScript, getAppScript, runAppScript } from '../../lib/apps/scripts'
import { readCLIConfig } from '../../lib/config'
import { hideStatus, showStatus } from '../../model/status'

async function runGenerateScripts() {
  const { apps } = await readCLIConfig()

  await foreachApp({
    apps,
    deep: true,
    callback: async ({ app }) => {
      const hasScript = await appHasScript(app, 'generate')
      if (!hasScript) return
      const script = await getAppScript(app, 'generate')
      showStatus({ text: `Running script "${script}" for "${app}"` })
      const wrapped = await runAppScript(app, 'generate')
      await wrapped.processPromise()
    },
  })
}

export async function generate() {
  showStatus({ text: 'Creating environment..' })
  await generateEnvironment()
  showStatus({ text: 'Creating plugin options..' })
  await generatePluginOptions()
  showStatus({ text: 'Generating types..' })
  await generateExposesTypes()
  showStatus({ text: 'Running scripts..' })
  await runGenerateScripts()
  hideStatus()
}
