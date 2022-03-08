import { Route } from '@app/types'
import { program } from 'commander'
import { BootstrapScreen } from '@app/ui/screens/bootstrap'
import { generate } from '../generate'
import { install } from '../install'
import { pull } from '../pull'
import { start } from '../start'

export const ROUTES: Route[] = [
  {
    name: 'bootstrap',
    command: program.command('bootstrap'),
    component: BootstrapScreen,
    action: async () => {
      await pull()
      await install()
      await generate()
      await start({ startScriptKey: 'start', prestartScriptKey: 'prestart' })
    },
  },
  {
    name: 'bootstrap:dev',
    command: program.command('bootstrap:dev'),
    component: BootstrapScreen,
    action: async () => {
      await pull()
      await install()
      await generate()
      await start({
        startScriptKey: 'start:dev',
        prestartScriptKey: 'prestart:dev',
      })
    },
  },
  {
    name: 'bootstrap:prod',
    command: program.command('bootstrap:prod'),
    component: BootstrapScreen,
    action: async () => {
      await pull()
      await install()
      await generate()
      await start({
        startScriptKey: 'start:prod',
        prestartScriptKey: 'prestart:prod',
      })
    },
  },
]
