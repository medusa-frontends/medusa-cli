import { snakeCase } from 'snake-case'
import { FileNames } from '../constants'
import { foreachApp } from '../lib/apps/foreach'
import { readCLIConfig } from '../lib/config'
import { bookPort, findFreePort } from '../lib/ports'
import { withTempFolder } from '../lib/temp-folder'

export type Environment = {
  https: boolean
  protocol: 'https' | 'http'
  domain: string
  port: number
  path: string
  fullPath: string
  fileName: string
  remoteName: string
  remoteEndpoint: string
}

export function readEnvironment(app: string): Promise<Environment | null> {
  return withTempFolder(app, async (tempFolderPath) => {
    const environmentPath = path.join(tempFolderPath, FileNames.Environment)
    try {
      const buffer = await fs.readFile(environmentPath)
      return JSON.parse(buffer.toString())
    } catch {
      return null
    }
  })
}

export async function writeEnvironment(app: string, options: Environment) {
  await withTempFolder(app, async (tempFolderPath) => {
    const environmentPath = path.join(tempFolderPath, FileNames.Environment)
    await fs.writeFile(environmentPath, JSON.stringify(options, null, 2))
  })
}

export async function generateEnvironment() {
  const { apps } = await readCLIConfig()

  await foreachApp({
    apps,
    deep: true,
    callback: ({ config }) => {
      const { port } = config.endpoint
      if (port) bookPort(port)
    },
  })

  await foreachApp({
    apps,
    deep: true,
    callback: async ({ app, config, packageJson }) => {
      const name = snakeCase(app)

      const {
        https = false,
        domain = 'localhost',
        port = await findFreePort(),
        path: pathString = '',
        fileName = 'remoteEntry.js',
      } = config.endpoint

      const fullPath = ['/', pathString, '/', fileName]
        .filter(Boolean)
        .join('')
        .replace(/\/+/g, '/')

      const protocol = https ? 'https' : 'http'
      const endpoint = `${name}@${protocol}://${domain}:${port}${fullPath}`

      await writeEnvironment(app, {
        https,
        protocol,
        domain,
        port,
        path: pathString,
        fullPath,
        fileName,
        remoteName: packageJson.name,
        remoteEndpoint: endpoint,
      })
    },
  })
}
