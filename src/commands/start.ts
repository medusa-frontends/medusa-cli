import { program } from 'commander'
import 'zx/globals'
import { start } from '../actions/start'

program
  .command('start')
  .action(() =>
    start({ startScriptKey: 'start', prestartScriptKey: 'prestart' })
  )
