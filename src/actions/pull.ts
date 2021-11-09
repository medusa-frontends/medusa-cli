import { readCLIConfig } from '../lib/config'
import { foreachApp } from '../lib/foreach-app'

export async function pull() {
  const { apps } = await readCLIConfig()

  await foreachApp({
    apps,
    deep: true,
    callback: async ({ app, branch }) => {
      if (branch) {
        await $`git config submodule.${app}.branch ${branch}`
      }

      await $`git submodule update --remote ${app}`
    },
  })
}
