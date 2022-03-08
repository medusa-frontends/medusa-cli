import { foreachApp } from '@app/lib/apps/foreach'
import { readCLIConfig } from '@app/lib/config'
import { hideStatus, showStatus } from '@app/model/status'

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
