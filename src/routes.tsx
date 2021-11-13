import { Command, program } from 'commander'
import React, { useEffect, useState } from 'react'
import { generate } from './actions/generate'
import { install } from './actions/install'
import { pull } from './actions/pull'
import { start } from './actions/start'
import { executionSucceed } from './model'
import { routesSetUp } from './model/setup'
import { BootstrapScreen } from './screens/bootstrap'
import { BootstrapProdScreen } from './screens/bootstrap:prod'
import { GenerateScreen } from './screens/generate'
import { InstallScreen } from './screens/install'
import { PullScreen } from './screens/pull'
import { StartScreen } from './screens/start'
import { StartProdScreen } from './screens/start:prod'

type Route = {
  name: string
  command: Command
  component: () => JSX.Element
  action: () => void | Promise<void>
}

const routes: Route[] = [
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
    name: 'start:prod',
    command: program.command('start:prod'),
    component: StartProdScreen,
    action: () =>
      start({
        startScriptKey: 'start:prod',
        prestartScriptKey: 'prestart:prod',
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
    name: 'bootstrap:prod',
    command: program.command('bootstrap:prod'),
    component: BootstrapProdScreen,
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

const Route: React.FC<{ route: Route }> = ({ route }) => {
  const { command, component: Component, action } = route
  const [matched, setMatched] = useState(false)

  useEffect(() => {
    command.action(async () => {
      setMatched(true)
      await action()
      executionSucceed()
    })
  }, [command])

  if (!matched) return null
  return <Component />
}

export function renderRoutes() {
  useEffect(routesSetUp, [])
  return routes.map((route) => <Route key={route.name} route={route} />)
}
