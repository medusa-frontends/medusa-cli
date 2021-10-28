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

program.parseAsync(process.argv)
