import { OutputAsset, OutputChunk, rollup } from 'rollup'
import dts from 'rollup-plugin-dts'
import 'zx/globals'
import { getAppMeta } from '../lib/app-meta'
import { readCLIConfig } from '../lib/config'
import { AppNotFoundException } from '../lib/exceptions'
import { foreachApp } from '../lib/foreach-app'
import { readJson, ROOT } from '../lib/fs'
import { withTempFolder } from '../lib/temp-folder'
import { log } from '../model/logs'
import { TSConfig } from '../types'

async function generateRequiresMap() {
  const { apps } = await readCLIConfig()

  const map: Partial<Record<string, string[]>> = {}

  await foreachApp({
    apps,
    deep: true,
    once: false,
    callback: ({ app, requiredFor }) => {
      if (!requiredFor) return
      const value = map[app] ?? []
      value.push(requiredFor)
      map[app] = value
    },
  })

  return map
}

async function writeTypings(app: string, chunk: OutputChunk) {
  await withTempFolder(app, async (tempFolderPath) => {
    const typingsPath = path.join(tempFolderPath, chunk.fileName)
    await fs.writeFile(typingsPath, chunk.code)
  })
}

type Cache = {
  [key in string]?: OutputChunk[]
}

async function bundleTypes(
  app: string,
  exposesPath: string,
  cache: Cache = {}
): Promise<OutputChunk[]> {
  const cachedOutput = cache[app]
  if (cachedOutput) return cachedOutput

  const bundle = await rollup({
    input: exposesPath,
    plugins: [dts()],
  })

  const { output } = await bundle.generate({
    file: `${app}.exposes.d.ts`,
    format: 'es',
  })

  const isChunk = (
    artifact: OutputChunk | OutputAsset
  ): artifact is OutputChunk => {
    return artifact.type === 'chunk'
  }

  const chunks = output.filter(isChunk)
  // eslint-disable-next-line require-atomic-updates
  cache[app] = chunks
  return chunks
}

async function getExposesPaths(app: string): Promise<string[]> {
  const meta = await getAppMeta(app)
  if (!meta) throw new AppNotFoundException(app)
  const extensions = ['.ts', '.tsx']
  const { exposesPath } = meta.config
  const hasExtension = extensions.some((extension) =>
    exposesPath.endsWith(extension)
  )
  const full = (end: string) => path.join(ROOT, app, end)
  if (hasExtension) return [full(exposesPath)]
  return extensions.map((extension) => full(exposesPath + extension))
}

async function getExposesPath(app: string): Promise<string | null> {
  const paths = await getExposesPaths(app)
  for (const path of paths) {
    const exists = await fs.pathExists(path)
    if (exists) return path
  }
  return null
}

const warnedApps = new Set<string>()

async function assertTypeRoots(app: string) {
  const alreadyWarned = warnedApps.has(app)
  if (alreadyWarned) return
  const tsconfigPath = path.join(ROOT, app, 'tsconfig.json')
  const tsconfig = await readJson<TSConfig>(tsconfigPath)
  if (!tsconfig) return
  const expected = ['./.mfe', '.mfe', '/.mfe']
  const shouldWarn =
    !tsconfig.compilerOptions?.typeRoots ||
    !tsconfig.compilerOptions.typeRoots.some((typeRoot) =>
      expected.includes(typeRoot)
    )
  if (!shouldWarn) return
  log(
    `[Warning] The app "${app}" tsconfig "typeRoots" field doesn't include ".mfe" directory`
  )
  warnedApps.add(app)
}

export async function appHasExposes(app: string): Promise<boolean> {
  const exposesPath = await getExposesPath(app)
  return Boolean(exposesPath)
}

export async function generateExposesTypes() {
  const requiresMap = await generateRequiresMap()

  for (const [app, dependentApps] of Object.entries(requiresMap)) {
    if (!dependentApps) continue
    if (dependentApps.length === 0) continue

    const exposesPath = await getExposesPath(app)
    if (!exposesPath) continue

    const chunks = await bundleTypes(app, exposesPath)

    for (const chunk of chunks) {
      for (const app of dependentApps) {
        await writeTypings(app, chunk)
        assertTypeRoots(app)
      }
    }
  }
}
