import { Command } from 'commander'
import { createEvent, restore } from 'effector'
import { executionSucceed } from './lifecycle'

export type RouteConfig = {
  name: string
  command: Command
  component: () => JSX.Element
  action: () => void | Promise<void>
}

const routeChanged = createEvent<string>()
export const $activeRoute = restore(routeChanged, null)

export function prepareRoutes(routes: RouteConfig[]) {
  for (const route of routes) {
    route.command.action(async () => {
      routeChanged(route.name)
      await route.action()
      executionSucceed()
    })
  }
}
