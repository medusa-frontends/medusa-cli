import { createEffect, createEvent, forward } from 'effector'
import { combineEvents } from 'patronum'

export const startShutDown = createEvent()
export const hideStatusOnShutDown = createEvent()

const shutDownEvents = [hideStatusOnShutDown]

const prepareFinished = combineEvents({
  events: shutDownEvents,
})

const shutDownFx = createEffect(async () => {
  setTimeout(process.exit, 0)
})

forward({
  from: startShutDown,
  to: shutDownEvents,
})

forward({
  from: prepareFinished,
  to: shutDownFx,
})
