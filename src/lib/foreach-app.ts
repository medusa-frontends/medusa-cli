import 'zx/globals'
import { AppMeta } from '../types'
import { getAppMeta } from './app-meta'

interface ForeachAppOptions {
  apps: string[]
  throwWhenMissing?: boolean
  callback: (meta: AppMeta) => void | Promise<void>
}

export async function foreachApp(options: ForeachAppOptions) {
  const { apps, throwWhenMissing = true, callback } = options

  for (const app of apps) {
    const meta = await getAppMeta(app)
    if (!meta) {
      if (!throwWhenMissing) continue
      else throw new Error(`The app "${app}" was not found`)
    }
    await callback(meta)
  }
}
