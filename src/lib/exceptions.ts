import { FileNames } from '../constants'

export class EnvironmentNotFoundException extends Error {
  constructor(app: string) {
    super(
      `No "${FileNames.Environment}" found for app "${app}".\n` +
        `Run "generate" command and try again.`
    )
  }
}

export class AppNotFoundException extends Error {
  constructor(app: string) {
    super(`The app "${app}" was not found.\n` + `Run "pull" command and try again.`)
  }
}
