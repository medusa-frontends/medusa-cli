import { program } from 'commander'
import { render } from 'ink'
import React from 'react'
import 'zx/globals'
import { getCommandOptions } from './lib/command-options'
import { executionStarted, prepareRoutes } from './model'
import { routes } from './routes'
import { View } from './view'

program
  .option('-i, --interactive [value]', 'Render interactive output', true)
  .parseOptions(process.argv)

export async function bootstrap() {
  prepareRoutes(routes)
  executionStarted()
  const { interactive } = getCommandOptions()
  if (interactive) {
    $.verbose = false
    render(<View />, { exitOnCtrlC: true })
  }
}
