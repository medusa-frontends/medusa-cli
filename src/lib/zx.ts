import { ProcessOutput, ProcessPromise } from 'zx'
import 'zx/globals'

export function withoutQuotes<T = void>(callback: () => T): T {
  const savedQuote = $.quote
  $.quote = (string) => string
  const result = callback()
  $.quote = savedQuote
  return result
}

/*
 * We can't just use ZX in promises chain,
 * since we lose ProcessPromise properties
 *
 * This function wraps ZX promise in special object,
 * that contains the untouched ProcessPromise
 */
export function wrapZX(promise: ProcessPromise<ProcessOutput>) {
  return {
    processPromise: () => promise,
  }
}
