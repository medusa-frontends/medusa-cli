import { program } from 'commander'
import 'zx/globals'
import { generate } from '../actions/generate'
import { install } from '../actions/install'
import { pull } from '../actions/pull'
import { start } from '../actions/start'

program.command('bootstrap:prod').action(async () => {
  await pull()
  await install()
  await generate()
  await start({
    startScriptKey: 'start:prod',
    prestartScriptKey: 'prestart:prod',
  })
})
