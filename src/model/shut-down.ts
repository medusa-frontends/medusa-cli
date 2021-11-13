import { createEffect, createEvent, forward } from 'effector'
import { combineEvents } from 'patronum'
import { hideStatus } from './status'

const preparationEvents = [hideStatus]
export const startShutDown = createEvent()

const prepareFinished = combineEvents({
  events: preparationEvents,
})

const shutDownFx = createEffect(async () => {
  setTimeout(process.exit, 0)
})

forward({
  from: startShutDown,
  to: preparationEvents,
})

forward({
  from: prepareFinished,
  to: shutDownFx,
})
