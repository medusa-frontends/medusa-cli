import { program } from 'commander'
import { Route } from '../../types'
import { StartScreen } from '../../ui/screens/start'
import { start } from './action'

export const ROUTES: Route[] = [
  {
    name: 'start',
    command: program.command('start'),
    component: StartScreen,
    action: () =>
      start({
        startScriptKey: 'start',
        prestartScriptKey: 'prestart',
      }),
  },
  {
    name: 'start:dev',
    command: program.command('start:dev'),
    component: StartScreen,
    action: () =>
      start({
        startScriptKey: 'start:dev',
        prestartScriptKey: 'prestart:dev',
      }),
  },
  {
    name: 'start:prod',
    command: program.command('start:prod'),
    component: StartScreen,
    action: () =>
      start({
        startScriptKey: 'start:prod',
        prestartScriptKey: 'prestart:prod',
      }),
  },
]
