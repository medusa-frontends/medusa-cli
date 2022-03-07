import { createEvent, guard } from 'effector'

function isOption(string: string) {
  return string.startsWith('{{') && string.endsWith('}}')
}

function parseCommand<T extends Record<string, string>>(input: string, command: string): T {
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

function declareCommand<T extends Record<string, string>>(template: string) {
  const match = (input: string) => matchCommand(input, template)
  const parse = (input: string) => parseCommand<T>(input, template)

  return guard({
    source: commandReceived,
    filter: match,
  }).map(parse)
}

export const commandReceived = createEvent<string>()

export const summaryRequested = declareCommand<Record<string, never>>('show summary')
export const infoForAppRequested = declareCommand<{ app: string }>('show info for {{app}}')
export const errorsForAppRequested = declareCommand<{ app: string }>('show errors for {{app}}')
