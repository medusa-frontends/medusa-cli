import 'zx/globals'
import { AppConfig, AppMeta } from '../types'
import { readFinalConfig } from './config'
import { ROOT } from './fs'

export async function getAppMeta(app: string): Promise<AppMeta | null> {
  const appPath = path.join(ROOT, app)
  const exists = await fs.pathExists(appPath)

  if (!exists) {
    return null
  }

  const stats = await fs.stat(appPath)

  if (!stats.isDirectory()) {
    return null
  }

  const files = await fs.readdir(appPath)

  const config = await readFinalConfig<AppConfig>({
    name: 'mfe-app',
    directory: appPath,
    default: { build: './dist' },
  })

  return {
    app,
    files,
    config,
  }
}

type AppsMeta<T extends string> = {
  [key in T]: AppMeta | null
}

export async function getAppsMeta<T extends string>(
  apps: T[]
): Promise<AppsMeta<T>> {
  const result: Partial<AppsMeta<T>> = {}
  const promises = apps.map(async (app) => {
    const meta = await getAppMeta(app)
    result[app] = meta
  })
  await Promise.all(promises)
  return result as AppsMeta<T>
}