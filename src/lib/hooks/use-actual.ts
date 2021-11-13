/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useRef } from 'react'

export function useActual<T extends (...args: any[]) => any>(callback: T): T {
  const ref = useRef<T>(callback)
  ref.current = callback
  const stable = (...args: any[]) => ref.current(...args)
  return useCallback(stable as T, [])
}
