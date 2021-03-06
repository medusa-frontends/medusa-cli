import mergeDeep from 'merge-deep'
import 'zx/globals'
import { AppConfig, CLIConfig } from '../types'
import { readJson, ROOT } from './fs'

type ReadFinalConfigOptions<T> = {
  name: string
  directory?: string
  default: T
  map?: (defaultConfig: T, commonConfig: T, customConfig: T) => T | Promise<T>
}

async function readFinalConfig<T extends CLIConfig | AppConfig>({
  name,
  directory = ROOT,
  default: defaultConfig,
  map = (defaultConfig, common, custom) => ({
    ...defaultConfig,
    ...common,
    ...custom,
  }),
}: ReadFinalConfigOptions<T>): Promise<T> {
  const commonPath = path.join(directory, `./${name}.common.json`)
  const customPath = path.join(directory, `./${name}.json`)

  const common = await readJson<T>(commonPath)
  const custom = await readJson<T>(customPath)

  const commonValue = common ?? ({} as T)
  const customValue = custom ?? ({} as T)

  return map(defaultConfig, commonValue, customValue)
}

export const readCLIConfig = () =>
  readFinalConfig<CLIConfig>({
    name: 'medusa',
    default: {
      host: 'mfe-app-host',
      apps: [],
      runOnlySpecifiedApps: false,
      branches: {},
      appBase: {},
      appConfigs: {},
    },
  })

export const readAppConfig = (app: string) =>
  readFinalConfig<AppConfig>({
    name: 'app.medusa',
    directory: path.join(ROOT, app),
    default: {
      requires: [],
      buildPath: './dist',
      exposesPath: './src/exposes',
      shared: [],
      env: {},
      endpoint: {
        https: false,
        domain: 'localhost',
        path: '',
        fileName: 'remoteEntry.js',
      },
      scripts: {
        'generate': 'medusa:generate',
        'prestart': 'medusa:prestart',
        'prestart:dev': 'medusa:prestart:dev',
        'prestart:prod': 'medusa:prestart:prod',
        'start': 'medusa:start',
        'start:dev': 'medusa:start:dev',
        'start:prod': 'medusa:start:prod',
        'prebuild': 'medusa:prebuild',
        'prebuild:dev': 'medusa:prebuild:dev',
        'prebuild:prod': 'medusa:prebuild:prod',
        'build': 'medusa:build',
        'build:dev': 'medusa:build:dev',
        'build:prod': 'medusa:build:prod',
      },
    },
    map: async (defaultConfig, commonConfig, customConfig) => {
      const { host, appBase, appConfigs } = await readCLIConfig()

      return mergeDeep(
        defaultConfig,
        { requires: [host] }, // host is always required
        appBase,
        commonConfig,
        appConfigs[app] ?? {},
        customConfig
      )
    },
  })
