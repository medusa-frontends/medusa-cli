/* eslint-disable @typescript-eslint/no-explicit-any */
type Fn<TArgs extends unknown[], TReturn> = (...args: TArgs) => TReturn
type Cache<TReturn extends unknown = unknown> = { [key in string]?: TReturn }

const cacheMap = new Map<Fn<any[], any>, Cache>()

function getCache<TArgs extends unknown[], TReturn>(fn: Fn<TArgs, TReturn>) {
  return (cacheMap.get(fn) ?? {}) as Cache<TReturn>
}

export function withCache<T extends (...args: any[]) => any>({
  fn,
  getKey = (...args) => JSON.stringify(args),
}: {
  fn: T
  getKey?: (...args: Parameters<T>) => string
}): T {
  const cache = getCache(fn)
  if (!cacheMap.has(fn)) cacheMap.set(fn, cache)

  const cachedFn = (...args: Parameters<T>): ReturnType<T> => {
    const key = getKey(...args)
    const cached = cache[key]
    if (cached) return cached
    const result = fn(...args)
    cache[key] = result
    return result
  }

  return cachedFn as T
}
