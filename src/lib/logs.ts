import { createEvent, createStore } from 'effector'
import { getCommandOptions } from './command-options'

export type LogsRegistry<TKey extends string = string> = Partial<Record<TKey, string[]>>
export type Logs = ReturnType<typeof createLogs>

type Options<TKey> = {
  prefix?: (key: TKey) => string
}

export function createLogs<TKey extends string = string>({
  prefix = () => '',
}: Options<TKey> = {}) {
  const registry = createStore<LogsRegistry<TKey>>({})
  const write = createEvent<{ key: TKey; message: string }>()
  registry.on(write, (logs, { key, message }) => {
    const current = logs[key] ?? ([] as string[])
    return { ...logs, [key]: current.concat(message) }
  })
  write.watch(({ key, message }) => {
    const { interactive } = getCommandOptions()
    if (interactive) return
    const full = `${prefix(key)} ${message}`
    console.log(full)
  })
  return { registry, write }
}
