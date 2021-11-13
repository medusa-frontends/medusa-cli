import { combine, createEvent, createStore } from 'effector'

const $visible = createStore(false)
const $text = createStore('Loading..')

type ShowResultParams = {
  text: string
}

export const showCommandResult = createEvent<ShowResultParams>()

$visible.on(showCommandResult, () => true)
$text.on(showCommandResult, (_, { text }) => text)

export const $commandResult = combine({
  visible: $visible,
  text: $text,
})

export const $commandResultNotSet = $visible.map((is) => !is)
