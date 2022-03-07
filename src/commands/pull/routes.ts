import { program } from 'commander'
import { Route } from '../../types'
import { PullScreen } from '../../ui/screens/pull'
import { pull } from './action'

export const ROUTES: Route[] = [
  {
    name: 'pull',
    command: program.command('pull'),
    component: PullScreen,
    action: pull,
  },
]
