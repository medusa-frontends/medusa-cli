import { ROUTES as BOOTSTRAP_ROUTES } from './commands/bootstrap'
import { ROUTES as BUILD_ROUTES } from './commands/build'
import { ROUTES as GENERATE_ROUTES } from './commands/generate'
import { ROUTES as INSTALL_ROUTES } from './commands/install'
import { ROUTES as PULL_ROUTES } from './commands/pull'
import { ROUTES as START_ROUTES } from './commands/start'
import { Route } from './types'

export const routes: Route[] = [
  ...PULL_ROUTES,
  ...INSTALL_ROUTES,
  ...GENERATE_ROUTES,
  ...START_ROUTES,
  ...BUILD_ROUTES,
  ...BOOTSTRAP_ROUTES,
]
