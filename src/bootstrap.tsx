import { render } from 'ink'
import React from 'react'
import 'zx/globals'
import { executionStarted } from './model'
import { View } from './view'

$.verbose = false

export async function bootstrap() {
  executionStarted()
  render(<View />, { exitOnCtrlC: true })
}
