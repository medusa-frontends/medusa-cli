import { program } from 'commander'
import 'zx/globals'
import { start } from '../actions/start'

program
  .command('start:prod')
  .action(() =>
    start({ startScriptKey: 'start:prod', prestartScriptKey: 'prestart:prod' })
  )
