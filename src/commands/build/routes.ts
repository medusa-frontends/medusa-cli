import { program } from 'commander'
import { Route } from '../../types'
import { BuildScreen } from '../../ui/screens/build'
import { build } from './action'

export const ROUTES: Route[] = [
  {
    name: 'build',
    command: program.command('build'),
    component: BuildScreen,
    action: () =>
      build({
        buildScriptKey: 'build',
        prebuildScriptKey: 'prebuild',
      }),
  },
  {
    name: 'build:dev',
    command: program.command('build:dev'),
    component: BuildScreen,
    action: () =>
      build({
        buildScriptKey: 'build:dev',
        prebuildScriptKey: 'prebuild:dev',
      }),
  },
  {
    name: 'build:prod',
    command: program.command('build:prod'),
    component: BuildScreen,
    action: () =>
      build({
        buildScriptKey: 'build:prod',
        prebuildScriptKey: 'prebuild:prod',
      }),
  },
]
