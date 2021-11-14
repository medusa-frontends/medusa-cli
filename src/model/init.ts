import { forward } from 'effector'
import { condition } from 'patronum'
import { $commandResultNotSet, showCommandResult } from './command-result'
import { executionFailed, executionSucceed, executionFinished, executionStarted } from './lifecycle'
import { runProgramFx } from './run'
import { setupFinished, startSetUp } from './setup'
import { hideStatusOnShutDown, startShutDown } from './shut-down'
import { hideStatus } from './status'

forward({
  from: executionStarted,
  to: startSetUp,
})

forward({
  from: setupFinished,
  to: runProgramFx,
})

forward({
  from: hideStatusOnShutDown,
  to: hideStatus,
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
