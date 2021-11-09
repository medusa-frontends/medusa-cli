import { generateEnvironment } from '../configs/environment'
import { generateExposesTypes } from '../configs/exposes'
import { generatePluginOptions } from '../configs/plugin-options'
import { readCLIConfig } from '../lib/config'
import { foreachApp } from '../lib/foreach-app'
import { runAppScriptIfPresent } from '../lib/terminal'

async function runGenerateScripts() {
  const { apps } = await readCLIConfig()

  await foreachApp({
    apps,
    deep: true,
    callback: async ({ app }) => {
      const wrapped = await runAppScriptIfPresent(app, 'generate')
      if (!wrapped) return
      await wrapped.processPromise()
    },
  })
}

export async function generate() {
  await generateEnvironment()
  await generatePluginOptions()
  await generateExposesTypes()
  await runGenerateScripts()
}
