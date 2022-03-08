import { getCommandOptions } from '@app/lib/command-options'
import { createLogs } from '@app/lib/logs'

export const globalLogs = createLogs<'all'>()

export function stringify(value: unknown): string {
  return String(value)
}

export const log = (...messages: unknown[]) => {
  const { interactive } = getCommandOptions()
  if (!interactive) return console.log(...messages)
  const message = messages.map(stringify).join(' ')
  globalLogs.write({ key: 'all', message })
}
