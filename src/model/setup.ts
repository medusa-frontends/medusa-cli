import { createEvent, forward } from 'effector'

export const startSetUp = createEvent()
export const setupFinished = createEvent()

forward({
  from: startSetUp,
  to: setupFinished,
})
