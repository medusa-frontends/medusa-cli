import { getAppMeta } from './apps/meta'
import { AppNotFoundException } from './exceptions'

export async function buildEnvString(app: string) {
  const meta = await getAppMeta(app)
  if (!meta) throw new AppNotFoundException(app)

  return Object.entries(meta.config.env)
    .reduce<string[]>((acc, [key, value]) => {
      acc.push(`${key}='${value}'`)
      return acc
    }, [])
    .join(' ')
}
