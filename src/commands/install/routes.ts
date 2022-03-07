import { program } from 'commander'
import { Route } from '../../types'
import { InstallScreen } from '../../ui/screens/install'
import { install } from './action'

export const ROUTES: Route[] = [
  {
    name: 'install',
    command: program.command('install'),
    component: InstallScreen,
    action: install,
  },
]
