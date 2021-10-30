import { program } from 'commander'
import 'zx/globals'
import { readCLIConfig } from './lib/config'
import { foreachApp } from './lib/foreach-app'

program.command('pull').action(async () => {
  const { apps, branches } = await readCLIConfig()

  for (const app of apps) {
    const branch = branches[app]

    if (branch) {
      await $`git config submodule.${app}.branch ${branch}`
    }

    await $`git submodule update --remote ${app}`
  }
})

program.command('install').action(async () => {
  const { apps } = await readCLIConfig()

  await foreachApp({
    apps,
    callback: async ({ app }) => {
      await $`cd ${app}; yarn install`
    },
  })
})

program.command('start').action(async () => {
  const { apps } = await readCLIConfig()

  await Promise.all([
    apps.map((app) => $`cd ${app}; yarn prestart; yarn start`),
  ])
})

program.command('start:prod').action(async () => {
  const { apps } = await readCLIConfig()

  await Promise.all([
    apps.map((app) => $`cd ${app}; yarn prestart:prod; yarn start:prod`),
  ])
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
