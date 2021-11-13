import { MESSAGES } from '@mfe/webpack-plugin'
import { ProcessOutput, ProcessPromise } from 'zx'
import 'zx/globals'
import { readEnvironment } from '../configs/environment'
import { readCLIConfig } from '../lib/config'
import { EnvironmentNotFoundException } from '../lib/exceptions'
import { mapApps } from '../lib/foreach-app'
import { appHasScript, runAppScript } from '../lib/terminal'
import { logs, LogsRegistry } from '../model/logs'
import { ScriptKey } from '../types'
import { generate } from './generate'

const commands = {
  showSummary: 'show summary',
  showInfoForApp: 'show info for {{app}}',
  showErrorsForApp: 'show errors for {{app}}',
}

function isOption(string: string) {
  return string.startsWith('{{') && string.endsWith('}}')
}

function parseCommand<T extends Record<string, string>>(
  input: string,
  command: string
): T {
  const inputWords = input.split(' ')
  const commandWords = command.split(' ')

  if (inputWords.length !== commandWords.length) {
    throw new Error(`Words count doesn't match`)
  }

  const params: Partial<T> = {}

  // eslint-disable-next-line unicorn/no-for-loop
  for (let i = 0; i < commandWords.length; i++) {
    const inputWord = inputWords[i]
    const commandWord = commandWords[i]

    if (isOption(commandWord)) {
      const key = commandWord.slice(2, -2)
      params[key as keyof T] = inputWord as T[keyof T]
      continue
    }

    if (inputWord !== commandWord) {
      throw new Error(`Words don't equal`)
    }
  }

  return params as T
}

function matchCommand(input: string, command: string): boolean {
  try {
    parseCommand(input, command)
    return true
  } catch {
    return false
  }
}

type Row = {
  app: string
  status: string
  info: number
  errors: number
}

type StartOptions = {
  startScriptKey: ScriptKey
  prestartScriptKey: ScriptKey
}

export async function start({
  startScriptKey,
  prestartScriptKey,
}: StartOptions) {
  await generate()

  const { apps } = await readCLIConfig()

  const promises = await mapApps({
    apps,
    deep: true,
    map: async ({ app }) => {
      const environment = await readEnvironment(app)
      if (!environment) throw new EnvironmentNotFoundException(app)

      const { port } = environment

      if (await appHasScript(app, prestartScriptKey)) {
        const wrapped = await runAppScript(app, prestartScriptKey)
        await wrapped.processPromise()
      }

      const wrapped = await runAppScript(app, startScriptKey, { port })
      const process = wrapped.processPromise()

      const handler = (app: string, registry: LogsRegistry) => {
        return (buffer: Buffer) => {
          const message = buffer.toString()
          registry.write({ key: app, message })
        }
      }

      process.stdout.removeAllListeners('data')
      process.stderr.removeAllListeners('data')
      process.stdout.on('data', handler(app, logs.info))
      process.stderr.on('data', handler(app, logs.errors))

      return process
    },
  })

  await Promise.all(promises)
}
