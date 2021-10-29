import { program } from 'commander'
import 'zx/globals'
import { readFinalConfig } from './lib/config'
import { foreachApp } from './lib/foreach-app'
import { CLIConfig } from './types'

program.command('test').action(async () => {
  const config = await readFinalConfig<CLIConfig>({
    name: 'mfe-cli',
    default: {},
  })

  const { apps = [] } = config

  console.log(config)

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
