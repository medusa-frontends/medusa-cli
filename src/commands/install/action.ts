import { foreachApp } from '../../lib/apps/foreach'
import { readCLIConfig } from '../../lib/config'
import { hideStatus, showStatus } from '../../model/status'

export async function install() {
  const { apps } = await readCLIConfig()

  await foreachApp({
    apps,
    deep: true,
    callback: async ({ app }) => {
      showStatus({ text: `Installing dependencies for "${app}"` })
      await $`cd ${app}; yarn install`
    },
  })

  hideStatus()
}
