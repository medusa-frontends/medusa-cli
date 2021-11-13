import { createEvent, createStore } from 'effector'

export type Logs<TKey extends string = string> = Partial<Record<TKey, string[]>>
export type LogsRegistry = ReturnType<typeof createLogsRegistry>

function createLogsRegistry<TKey extends string = string>() {
  const registry = createStore<Logs<TKey>>({})
  const write = createEvent<{ key: TKey; message: string }>()
  registry.on(write, (logs, { key, message }) => {
    const current = logs[key] ?? ([] as string[])
    return { ...logs, [key]: current.concat(message) }
  })
  return { registry, write }
}

export const logs = {
  summary: createLogsRegistry<'all'>(),
  info: createLogsRegistry(),
  errors: createLogsRegistry(),
}

export function stringify(value: unknown): string {
  return String(value)
}

export const log = (...messages: unknown[]) => {
  const message = messages.map(stringify).join(' ')
  logs.summary.write({ key: 'all', message })
}
