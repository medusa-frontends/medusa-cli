import { readCLIConfig } from '../lib/config'
import { foreachApp } from '../lib/foreach-app'

export async function install() {
  const { apps } = await readCLIConfig()

  await foreachApp({
    apps,
    deep: true,
    callback: async ({ app }) => {
      await $`cd ${app}; yarn install`
    },
  })
}
