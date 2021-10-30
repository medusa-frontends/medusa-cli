import { program } from 'commander'
import 'zx/globals'
import { readCLIConfig } from './lib/config'
import { foreachApp } from './lib/foreach-app'

program.command('fetch').action(async () => {
  const { apps, branches } = await readCLIConfig()

  for (const app of apps) {
    const branch = branches[app]

    if (branch) {
      await $`git config submodule.${app}.branch ${branch}`
    }

    await $`git submodule update --remote ${app}`
  }
})

program.command('test').action(async () => {
  const { apps } = await readCLIConfig()

  console.log({ apps })

  await foreachApp({
    apps,
    callback: console.log,
  })
})

export async function bootstrap() {
  try {
    await program.parseAsync(process.argv)
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message)
    }
  }
}
