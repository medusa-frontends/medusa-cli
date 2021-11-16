import { program } from 'commander'
import { build } from './actions/build'
import { generate } from './actions/generate'
import { install } from './actions/install'
import { pull } from './actions/pull'
import { start } from './actions/start'
import { RouteConfig } from './model'
import { BootstrapScreen } from './ui/screens/bootstrap'
import { BuildScreen } from './ui/screens/build'
import { GenerateScreen } from './ui/screens/generate'
import { InstallScreen } from './ui/screens/install'
import { PullScreen } from './ui/screens/pull'
import { StartScreen } from './ui/screens/start'

export const routes: RouteConfig[] = [
  {
    name: 'pull',
    command: program.command('pull'),
    component: PullScreen,
    action: pull,
  },
  {
    name: 'install',
    command: program.command('install'),
    component: InstallScreen,
    action: install,
  },
  {
    name: 'generate',
    command: program.command('generate'),
    component: GenerateScreen,
    action: generate,
  },
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
