import { FileNames } from '../constants/file-names'

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
    super(
      `The app "${app}" was not found.\n` + `Run "pull" command and try again.`
    )
  }
}

export class AtLeastOneConfigException extends Error {
  constructor(name: string) {
    super(`At least one valid "${name}" config is required`)
  }
}
