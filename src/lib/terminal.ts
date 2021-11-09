import 'zx/globals'
import { ScriptKey } from '../types'
import { getAppMeta } from './app-meta'
import { buildEnvString } from './env'
import { AppNotFoundException } from './exceptions'
import { withoutQuotes, wrapZX } from './zx'

export async function mapScriptKey(app: string, scriptKey: ScriptKey) {
  const meta = await getAppMeta(app)
  if (!meta) throw new AppNotFoundException(app)
  return meta.config.scripts[scriptKey]
}

export async function appHasScript(app: string, scriptKey: ScriptKey) {
  const meta = await getAppMeta(app)
  if (!meta) throw new AppNotFoundException(app)
  const script = await mapScriptKey(app, scriptKey)
  return script in meta.packageJson.scripts
}

type Options = Record<string, string | number>

function stringifyOptions(options: Options) {
  return Object.entries(options)
    .reduce<string[]>((acc, [option, value]) => {
      return acc.concat(`--${option} ${value}`)
    }, [])
    .join(' ')
}

export async function runAppScript(
  app: string,
  scriptKey: ScriptKey,
  options: Options = {}
) {
  const envString = await buildEnvString(app)
  const script = await mapScriptKey(app, scriptKey)
  return withoutQuotes(() => {
    return wrapZX(
      $`${envString} cd ${app}; yarn ${script} ${stringifyOptions(options)}`
    )
  })
}

export async function runAppScriptIfPresent(app: string, scriptKey: ScriptKey) {
  const meta = await getAppMeta(app)
  if (!meta) throw new AppNotFoundException(app)

  const hasScript = await appHasScript(app, scriptKey)
  if (!hasScript) return

  return runAppScript(app, scriptKey)
}
