import 'zx/globals'
import { AppMeta } from '../../types'
import { getAppMeta } from './meta'
import { AppNotFoundException } from '../exceptions'

type ForeachAppOptions = {
  apps: string[]
  throwWhenMissing?: boolean
  deep?: boolean
  once?: boolean
  callback: (meta: AppMeta) => void | Promise<void>
}

type StackItem = {
  app: string
  requiredFor?: string
}

export async function foreachApp({
  apps,
  throwWhenMissing = true,
  deep = false,
  once = true,
  callback,
}: ForeachAppOptions) {
  const stack: StackItem[] = apps.map((app) => ({ app }))
  const processed = new Set<string>()

  while (stack.length > 0) {
    const item = stack.pop()
    if (!item) return

    const { app, requiredFor } = item

    /*
     * Pair is always processed once
     * It prevents infinity cycle when app is equal to requiredFor
     * (in case of host MFE for example)
     */
    const pair = `${app}+${requiredFor}`

    if (processed.has(pair)) {
      continue
    }

    if (once && processed.has(app)) {
      continue
    }

    const meta = await getAppMeta(app, { requiredFor })

    if (!meta) {
      if (!throwWhenMissing) continue
      else throw new AppNotFoundException(app)
    }

    if (deep) {
      const items = meta.config.requires.map((required) => ({
        app: required,
        requiredFor: app,
      }))

      stack.push(...items)
    }

    await callback(meta)
    processed.add(app)
    processed.add(pair)
  }
}

type MapAppsOptions<TItem> = {
  apps: string[]
  throwWhenMissing?: boolean
  deep?: boolean
  once?: boolean
  map: (meta: AppMeta) => TItem
}

export async function mapApps<TItem>({
  apps,
  throwWhenMissing = true,
  deep = false,
  once = true,
  map,
}: MapAppsOptions<TItem>): Promise<TItem[]> {
  const mapped: TItem[] = []

  await foreachApp({
    apps,
    throwWhenMissing,
    deep,
    once,
    callback: (meta) => {
      mapped.push(map(meta))
    },
  })

  return mapped
}
