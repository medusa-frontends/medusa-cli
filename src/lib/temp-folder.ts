import { ROOT } from './fs'

export async function withTempFolder<T = void>(
  app: string,
  callback: (tempFolderPath: string) => T | Promise<T>
): Promise<T> {
  const tempFolderPath = path.join(ROOT, app, '.mfe')
  const exists = await fs.pathExists(tempFolderPath)
  if (!exists) await fs.mkdir(tempFolderPath)
  return callback(tempFolderPath)
}
