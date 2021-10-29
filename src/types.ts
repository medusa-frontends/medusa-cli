export interface CLIConfig {
  apps?: string[]
  branches?: Record<string, string>
}

export interface AppConfig {
  build: string
}

export interface AppMeta {
  app: string
  files: string[]
  config: AppConfig
}
