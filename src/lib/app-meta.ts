import 'zx/globals'
import { AppMeta, PackageJson } from '../types'
import { readAppConfig, readCLIConfig } from './config'
import { readJson, ROOT } from './fs'

type PassedFields = Partial<AppMeta>

export async function getAppMeta(
  app: string,
  passedFields: PassedFields = {}
): Promise<AppMeta | null> {
  const { branches } = await readCLIConfig()

  const branch = branches[app]

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

  if (!files.includes('package.json')) {
    return null
  }

  const packageJson = await readJson<PackageJson>(
    path.join(appPath, 'package.json')
  )

  if (!packageJson) {
    return null
  }

  const config = await readAppConfig(app)

  return {
    app,
    files,
    config,
    packageJson,
    branch,
    ...passedFields,
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
