import { ROOT } from './fs'

export const TEMP_FOLDER_NAME = '.medusa'

export async function withTempFolder<T = void>(
  app: string,
  callback: (tempFolderPath: string) => T | Promise<T>
): Promise<T> {
  const tempFolderPath = path.join(ROOT, app, TEMP_FOLDER_NAME)
  const exists = await fs.pathExists(tempFolderPath)
  if (!exists) await fs.mkdir(tempFolderPath)
  return callback(tempFolderPath)
}
