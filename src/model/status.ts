import { combine, createEvent, createStore, forward } from 'effector'

type Kind = 'spinner' | 'progress'

const $visible = createStore(false)
const $kind = createStore<Kind>('spinner')
const $text = createStore('Loading..')
const $progress = createStore(0)

type UpdateStatusParams = {
  kind?: Kind
  text?: string
  progress?: number
}

export const showStatus = createEvent<UpdateStatusParams>()
export const updateStatus = createEvent<UpdateStatusParams>()
export const hideStatus = createEvent()

forward({
  from: showStatus,
  to: updateStatus,
})

$visible.on(showStatus, () => true).reset(hideStatus)
$kind.on(updateStatus, (_, { kind }) => kind).reset(hideStatus)
$text.on(updateStatus, (_, { text }) => text).reset(hideStatus)
$progress.on(updateStatus, (_, { progress }) => progress).reset(hideStatus)

export const $status = combine({
  visible: $visible,
  kind: $kind,
  text: $text,
  progress: $progress,
})
