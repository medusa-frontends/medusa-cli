import { container } from 'webpack'

export type Json = {
  [key: string]:
    | undefined
    | number
    | boolean
    | string
    | Array<number | boolean | string | Json>
    | Json
}

type DependencyOptions = {
  requiredVersion?: string
  eager?: boolean
  singleton?: boolean
}

export type ExtendedShared = Record<string, DependencyOptions>
export type Shared = string[] | ExtendedShared

export type ScriptKey =
  | 'generate'
  | 'prestart'
  | 'prestart:dev'
  | 'prestart:prod'
  | 'start'
  | 'start:dev'
  | 'start:prod'
  | 'prebuild'
  | 'prebuild:dev'
  | 'prebuild:prod'
  | 'build'
  | 'build:dev'
  | 'build:prod'

export type AppConfig = {
  requires: string[]
  buildPath: string
  exposesPath: string
  shared: Shared
  env: Record<string, string>
  endpoint: {
    https: boolean
    domain: string
    port?: number
    path: string
    fileName: string
  }
  scripts: Record<ScriptKey, string>
}

export type CLIConfig = {
  host: string
  apps: string[]
  runOnlySpecifiedApps: boolean
  branches: Record<string, string>
  appBase: Partial<AppConfig>
  appConfigs: Partial<Record<string, AppConfig>>
}

export type ModuleFederationPluginOptions = ConstructorParameters<
  typeof container.ModuleFederationPlugin
>[0]

export type TSConfig = {
  compilerOptions?: {
    typeRoots?: string[]
  }
}

export type PackageJson = {
  name: string
  version: string
  scripts: Record<string, string>
  dependencies: Record<string, string>
  devDependencies: Record<string, string>
}

export type AppMeta = {
  app: string
  files: string[]
  packageJson: PackageJson
  config: AppConfig
  branch?: string
  requiredFor?: string
}
