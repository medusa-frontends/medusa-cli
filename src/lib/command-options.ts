import { program } from 'commander'

type Options = {
  interactive: boolean
}

export function getCommandOptions(): Options {
  const { interactive } = program.opts()

  return {
    interactive: String(interactive) === 'true',
  }
}
