import { createEvent } from 'effector'
import { combineEvents } from 'patronum'

export const routesSetUp = createEvent()

export const startSetUp = createEvent()

const events = [routesSetUp]
export const setupFinished = combineEvents({ events })
