import 'zx/globals'
import { AppConfig, readFinalConfig } from './config'
import { ROOT } from './fs'

class SubmoduleException extends Error {
  constructor(submodule: string, message: string) {
    super(`[${submodule}] ${message}`)
  }
}

interface CallbackParams {
  files: string[]
  config: AppConfig
}

interface ForeachAppOptions {
  apps: string[]
  throwWhenMissing?: boolean
  callback: (params: CallbackParams) => void | Promise<void>
}

export async function foreachApp(options: ForeachAppOptions) {
  const { apps, throwWhenMissing = true, callback } = options

  for (const app of apps) {
    const throwAppException = (message: string) => {
      throw new SubmoduleException(app, message)
    }

    const appPath = path.join(ROOT, app)
    const exists = await fs.pathExists(appPath)

    if (!exists) {
      if (!throwWhenMissing) continue
      throwAppException(`The MFE app was not found`)
    }

    const stats = await fs.stat(appPath)

    if (!stats.isDirectory()) {
      throwAppException(`The MFE app is invalid (not a directory)`)
    }

    const files = await fs.readdir(appPath)

    const config = await readFinalConfig<AppConfig>({
      name: 'mfe-app',
      directory: appPath,
      default: { build: './dist' },
    })

    await callback({ files, config })
  }
}
