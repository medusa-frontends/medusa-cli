import 'zx/globals'
import { AppConfig, CLIConfig } from '../types'
import { ROOT } from './fs'

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

interface ReadFinalConfigOptions<T> {
  name: string
  directory?: string
  default: T
  atLeastOne?: boolean
}

async function readFinalConfig<T extends CLIConfig | AppConfig>(
  options: ReadFinalConfigOptions<T>
): Promise<T> {
  const {
    name,
    directory = ROOT,
    default: defaultConfig,
    atLeastOne = true,
  } = options

  const commonPath = path.join(directory, `./${name}.common.json`)
  const customPath = path.join(directory, `./${name}.json`)

  const common = await readConfig<T>(commonPath)
  const custom = await readConfig<T>(customPath)

  if (atLeastOne && !common && !custom) {
    throw new Error(`At least one valid "${name}" config is required`)
  }

  const commonValue = common ?? defaultConfig
  const customValue = custom ?? {}
  return { ...commonValue, ...customValue }
}

export const readAppConfig = (app: string) =>
  readFinalConfig<AppConfig>({
    name: 'mfe-app',
    directory: path.join(ROOT, app),
    default: { build: './dist' },
  })

export const readCLIConfig = () =>
  readFinalConfig<CLIConfig>({
    name: 'mfe-cli',
    default: {
      apps: [],
      branches: {},
    },
  })
