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

type ReadConfigResult<T> =
  | {
      valid: true
      value: T
    }
  | {
      valid: false
    }

async function readConfig<T extends CLIConfig | AppConfig>(
  path: string,
  options: ReadConfigOptions<T> = {}
): Promise<ReadConfigResult<T>> {
  const { defaultValue } = options

  let buffer: Buffer

  try {
    buffer = await fs.readFile(path)
  } catch {
    return defaultValue
      ? { valid: true, value: defaultValue }
      : { valid: false }
  }

  try {
    const json = buffer.toString()
    return { valid: true, value: JSON.parse(json) }
  } catch {
    return { valid: false }
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

  if (atLeastOne && !common.valid && !custom.valid) {
    throw new Error(`At least one valid "${name}" config is required`)
  }

  const commonValue = common.valid ? common.value : {}
  const customValue = custom.valid ? custom.value : {}
  return { ...commonValue, ...customValue } as T
}
