import { program } from 'commander'
import { Route } from '../../types'
import { GenerateScreen } from '../../ui/screens/generate'
import { generate } from './action'

export const ROUTES: Route[] = [
  {
    name: 'generate',
    command: program.command('generate'),
    component: GenerateScreen,
    action: generate,
  },
]
