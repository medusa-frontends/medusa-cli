import { createEvent, restore } from 'effector'
import { Route } from '../types'
import { executionSucceed } from './lifecycle'

const routeChanged = createEvent<string>()
export const $activeRoute = restore(routeChanged, null)

export function prepareRoutes(routes: Route[]) {
  for (const route of routes) {
    route.command.action(async () => {
      routeChanged(route.name)
      await route.action()
      executionSucceed()
    })
  }
}
