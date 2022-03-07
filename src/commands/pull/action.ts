import { foreachApp } from '../../lib/apps/foreach'
import { readCLIConfig } from '../../lib/config'
import { hideStatus, showStatus } from '../../model/status'

export async function pull() {
  const { apps } = await readCLIConfig()

  showStatus({ text: 'Pulling the submodules changes from the remote..' })

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

  hideStatus()
}
