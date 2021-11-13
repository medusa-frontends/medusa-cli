import { createEvent, forward } from 'effector'

export const executionStarted = createEvent()
export const executionSucceed = createEvent()
export const executionFailed = createEvent()
export const executionFinished = createEvent()

forward({
  from: [executionSucceed, executionFailed],
  to: executionFinished,
})
