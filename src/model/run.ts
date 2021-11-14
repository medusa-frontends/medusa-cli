import { program } from 'commander'
import { createEffect, forward } from 'effector'
import { log } from './global-logs'
import { executionFailed } from './lifecycle'

export const runProgramFx = createEffect(() => program.parseAsync(process.argv))

type LogParams = { error: Error }

const logErrorFx = createEffect(async ({ error }: LogParams) => {
  log(error.message)
  log(error.stack)
})

forward({
  from: runProgramFx.fail,
  to: logErrorFx,
})

forward({
  from: logErrorFx.done,
  to: executionFailed,
})
