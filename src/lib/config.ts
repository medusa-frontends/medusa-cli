import 'zx/globals'
import { ROOT } from './fs'

export interface CLIConfig {
  apps?: string[]
  branches?: Record<string, string>
}

export interface AppConfig {
  build: string
}

interface ReadConfigOptions<T> {
  defaultValue?: T
}

type ReadConfigResult<T> = T | null

async function readConfig<T extends CLIConfig | AppConfig>(
  path: string,
  options: ReadConfigOptions<T> = {}
): Promise<ReadConfigResult<T>> {
  const { defaultValue } = options

  let buffer: Buffer

  try {
    buffer = await fs.readFile(path)
  } catch {
    return defaultValue ?? null
  }

  try {
    const json = buffer.toString()
    return JSON.parse(json)
  } catch {
    return null
  }
}

interface ReadFinalConfigOptions {
  name: string
  directory?: string
  atLeastOne?: boolean
}

export async function readFinalConfig<T extends CLIConfig | AppConfig>(
  options: ReadFinalConfigOptions
): Promise<T> {
  const { name, directory = ROOT, atLeastOne = true } = options

  const commonPath = path.join(directory, `./${name}.common.json`)
  const customPath = path.join(directory, `./${name}.json`)

  const common = await readConfig<T>(commonPath)
  const custom = await readConfig<T>(customPath)

  if (atLeastOne && !common && !custom) {
    throw new Error(`At least one valid "${name}" config is required`)
  }

  const commonValue = common ?? {}
  const customValue = custom ?? {}
  return { ...commonValue, ...customValue } as T
}
