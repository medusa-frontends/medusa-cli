import { Json } from '../types'
import { withCache } from './cache'

export const ROOT = process.cwd()

type ReadConfigOptions<T> = {
  defaultValue?: T
}

type ReadConfigResult<T> = T | null

export const readJson = withCache({
  getKey: (path) => path,
  fn: async <T extends Json>(
    path: string,
    options: ReadConfigOptions<T> = {}
  ): Promise<ReadConfigResult<T>> => {
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
  },
})
