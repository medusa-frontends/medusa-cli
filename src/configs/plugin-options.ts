import { snakeCase } from 'snake-case'
import { FileNames } from '../constants/file-names'
import { readCLIConfig } from '../lib/config'
import { EnvironmentNotFoundException } from '../lib/exceptions'
import { foreachApp } from '../lib/foreach-app'
import { buildFinalShared } from '../lib/shared-deps'
import { withTempFolder } from '../lib/temp-folder'
import { ModuleFederationPluginOptions } from '../types'
import { readEnvironment } from './environment'
import { appHasExposes } from './exposes'

type Remotes = ModuleFederationPluginOptions['remotes']

async function generateRemotes(): Promise<Remotes> {
  const { apps } = await readCLIConfig()

  const remotes: Remotes = {}

  await foreachApp({
    apps,
    deep: true,
    callback: async ({ app }) => {
      const environment = await readEnvironment(app)
      if (!environment) throw new EnvironmentNotFoundException(app)

      const { remoteName, remoteEndpoint } = environment
      remotes[remoteName] = remoteEndpoint
    },
  })

  return remotes
}

export async function generatePluginOptions() {
  const { apps } = await readCLIConfig()

  const remotes = await generateRemotes()

  await foreachApp({
    apps,
    callback: async ({ app, config }) => {
      await withTempFolder(app, async (tempFolderPath) => {
        const optionsPath = path.join(tempFolderPath, FileNames.PluginOptions)

        const environment = await readEnvironment(app)
        if (!environment) throw new EnvironmentNotFoundException(app)
        const shared = await buildFinalShared(app)

        const exposes: Record<string, string> = {}

        if (await appHasExposes(app)) {
          exposes['.'] = config.exposesPath
        }

        const options: ModuleFederationPluginOptions = {
          name: snakeCase(app),
          filename: environment.fileName,
          shared,
          remotes,
          exposes,
        }

        await fs.writeFile(optionsPath, JSON.stringify(options, null, 2))
      })
    },
  })
}
