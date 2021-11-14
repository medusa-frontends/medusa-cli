import { ExtendedShared, Shared } from '../types'
import { getAppMeta } from './apps/meta'
import { AppNotFoundException } from './exceptions'

function toExtended(shared: Shared): ExtendedShared {
  if (!Array.isArray(shared)) return shared
  return shared.reduce<ExtendedShared>((acc, name) => {
    acc[name] = {}
    return acc
  }, {})
}

export async function buildFinalShared(app: string) {
  const meta = await getAppMeta(app)
  if (!meta) throw new AppNotFoundException(app)

  const { config, packageJson } = meta
  const shared: ExtendedShared = toExtended(config.shared)
  const { dependencies } = packageJson

  return Object.entries(shared).reduce<ExtendedShared>((acc, [name, options]) => {
    const hasPackageLocally = name in dependencies
    if (!hasPackageLocally) return acc
    acc[name] = {
      requiredVersion: options.requiredVersion ?? dependencies[name],
      eager: options.eager ?? true,
      singleton: options.singleton ?? true,
    }
    return acc
  }, {})
}
