import { generateEnvironment } from '@app/configs/environment'
import { generateExposesTypes } from '@app/configs/exposes'
import { generatePluginOptions } from '@app/configs/plugin-options'
import { foreachApp } from '@app/lib/apps/foreach'
import { appHasScript, getAppScript, runAppScript } from '@app/lib/apps/scripts'
import { readCLIConfig } from '@app/lib/config'
import { hideStatus, showStatus } from '@app/model/status'

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
