import { program } from 'commander'
import 'zx/globals'
import { CLIConfig, readFinalConfig } from './lib/config'
import { foreachApp } from './lib/foreach-app'

program.command('test').action(async () => {
  const config = await readFinalConfig<CLIConfig>({ name: 'mfe-cli' })
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
