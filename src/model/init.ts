import { forward } from 'effector'
import { condition } from 'patronum'
import { executionFailed, executionSucceed } from '.'
import { $commandResultNotSet, showCommandResult } from './command-result'
import { executionFinished, executionStarted } from './lifecycle'
import { runProgramFx } from './run'
import { setupFinished, startSetUp } from './setup'
import { startShutDown } from './shut-down'

forward({
  from: executionStarted,
  to: startSetUp,
})

forward({
  from: setupFinished,
  to: runProgramFx,
})

forward({
  from: executionFinished,
  to: startShutDown,
})

condition({
  source: executionSucceed,
  if: $commandResultNotSet,
  then: showCommandResult.prepend(() => ({
    text: chalk.green('Executed successfully'),
  })),
})

condition({
  source: executionFailed,
  if: $commandResultNotSet,
  then: showCommandResult.prepend(() => ({
    text: chalk.red('Execution failed'),
  })),
})
