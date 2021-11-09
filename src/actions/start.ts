import blessed from 'blessed'
import { ProcessOutput, ProcessPromise } from 'zx'
import 'zx/globals'
import { readEnvironment } from '../configs/environment'
import { readCLIConfig } from '../lib/config'
import { EnvironmentNotFoundException } from '../lib/exceptions'
import { mapApps } from '../lib/foreach-app'
import { appHasScript, runAppScript } from '../lib/terminal'
import { ScriptKey } from '../types'
import { generate } from './generate'

const commands = {
  showSummary: 'show summary',
  showInfoForApp: 'show info for {{app}}',
  showErrorsForApp: 'show errors for {{app}}',
}

function isOption(string: string) {
  return string.startsWith('{{') && string.endsWith('}}')
}

function parseCommand<T extends Record<string, string>>(
  input: string,
  command: string
): T {
  const inputWords = input.split(' ')
  const commandWords = command.split(' ')

  if (inputWords.length !== commandWords.length) {
    throw new Error(`Words count doesn't match`)
  }

  const params: Partial<T> = {}

  // eslint-disable-next-line unicorn/no-for-loop
  for (let i = 0; i < commandWords.length; i++) {
    const inputWord = inputWords[i]
    const commandWord = commandWords[i]

    if (isOption(commandWord)) {
      const key = commandWord.slice(2, -2)
      params[key as keyof T] = inputWord as T[keyof T]
      continue
    }

    if (inputWord !== commandWord) {
      throw new Error(`Words don't equal`)
    }
  }

  return params as T
}

function matchCommand(input: string, command: string): boolean {
  try {
    parseCommand(input, command)
    return true
  } catch {
    return false
  }
}

type LogsRegistry = {
  [key in string]?: string[]
}

function createRegistry(): LogsRegistry {
  return {}
}

type Row = {
  app: string
  status: string
  info: number
  errors: number
}

function createRow(initial: Row): [string[], Row] {
  const { app, status, info, errors } = initial
  const row = [app, status, String(info), String(errors)]

  const api = {
    get app() {
      return row[0]
    },
    set app(value: string) {
      row[0] = value
    },
    get status() {
      return row[1]
    },
    set status(value: string) {
      row[1] = value
    },
    get info() {
      return Number(row[2])
    },
    set info(value: number) {
      row[2] = String(value)
    },
    get errors() {
      return Number(row[3])
    },
    set errors(value: number) {
      row[3] = String(value)
    },
  }

  return [row, api]
}

type StartOptions = {
  startScriptKey: ScriptKey
  prestartScriptKey: ScriptKey
}

export async function start({
  startScriptKey,
  prestartScriptKey,
}: StartOptions) {
  await generate()

  const { apps } = await readCLIConfig()

  const screen = blessed.screen({
    smartCSR: true,
  })

  const rows: string[][] = [['Apps', 'Status', 'Info Count', 'Error Count']]

  const titleColor = (text: string) =>
    chalk.underline(chalk.bold(chalk.cyan(text)))

  const container = (
    title: string,
    options: blessed.Widgets.BoxOptions = {}
  ) => {
    return blessed.box({
      parent: screen,
      content: titleColor(title),
      width: '100%',
      padding: 1,
      align: 'left',
      ...options,
    })
  }

  const tableContainer = container('Summary')
  const logsContainer = container('Logs')
  const terminalContainer = container('Terminal', { height: 5, bottom: 0 })

  const table = blessed.table({
    parent: tableContainer,
    rows,
    tags: true,
    align: 'left',
    width: '100%',
    top: 2,
  })

  const logsBox = blessed.scrollablebox({
    parent: logsContainer,
    align: 'left',
    width: '100%',
    height: '100%',
    top: 2,
  })

  const form = blessed.form({
    parent: terminalContainer,
    keys: true,
    width: '100%',
    height: 1,
    top: 1,
    left: 2,
  })

  const _bashSymbol = blessed.text({
    parent: form,
    width: 1,
    height: 1,
    left: -2,
    top: 1,
    content: chalk.bold('$'),
  })

  const textarea = blessed.textarea({
    parent: form,
    name: 'textarea',
    input: true,
    inputOnFocus: true,
    left: 0,
    top: 1,
    height: 1,
    width: '100%',
    keys: true,
    content: '',
  })

  const processes: ProcessPromise<ProcessOutput>[] = []

  textarea.key('C-c', async () => {
    await Promise.all(processes.map((process) => process.kill()))
    process.exit(0)
  })

  const handleUp = () => {
    if (logsBox.hidden) return
    logsBox.scroll(-1, true)
    render()
  }

  const handleDown = () => {
    if (logsBox.hidden) return
    logsBox.scroll(1, true)
    render()
  }

  screen.on('wheelup', handleUp)
  screen.on('wheeldown', handleDown)
  textarea.key('up', handleUp)
  textarea.key('down', handleDown)

  type LogsType = 'info' | 'errors'

  const registries: Record<LogsType, LogsRegistry> = {
    info: createRegistry(),
    errors: createRegistry(),
  }

  let activeApp: string | null = null
  let activeLogsType: string | null = null

  function syncLogs(app: string, logsType: LogsType) {
    if (!app) return
    if (!activeLogsType) return
    if (app !== activeApp) return
    if (logsType !== activeLogsType) return
    const logs = registries[logsType][app]
    logsContainer.content = titleColor(`Logs for "${app}"`)
    logsBox.content =
      logs && logs.length > 0
        ? logs.join('\n')
        : chalk.red(`No errors found for "${app}"`)
  }

  textarea.key('enter', () => {
    const command = textarea.getContent().slice(0, -1)
    form.reset()

    if (matchCommand(command, commands.showSummary)) {
      activeApp = null
      activeLogsType = null
      return render()
    }

    if (matchCommand(command, commands.showInfoForApp)) {
      const { app } = parseCommand<{ app: string }>(
        command,
        commands.showInfoForApp
      )

      activeApp = app
      activeLogsType = 'info'
      syncLogs(app, 'info')
      logsBox.setScrollPerc(100)

      return render()
    }

    if (matchCommand(command, commands.showErrorsForApp)) {
      const { app } = parseCommand<{ app: string }>(
        command,
        commands.showErrorsForApp
      )

      activeApp = app
      activeLogsType = 'errors'
      syncLogs(app, 'errors')
      logsBox.setScrollPerc(100)

      return render()
    }
  })

  const updateLogsPosition = () => {
    const tableHeight = rows.length * 2 + 2
    // table.height = tableHeight
    logsContainer.top = tableHeight
    logsContainer.height = Number(screen.height) - tableHeight - 4
  }

  const render = () => {
    table.setRows([...rows])
    updateLogsPosition()
    screen.render()
  }

  render()
  textarea.focus()

  const promises = await mapApps({
    apps,
    deep: true,
    map: async ({ app }) => {
      const environment = await readEnvironment(app)
      if (!environment) throw new EnvironmentNotFoundException(app)

      const [row, api] = createRow({
        app,
        status: chalk.blue('Waiting..'),
        info: 0,
        errors: 0,
      })

      rows.push(row)
      render()

      const { port } = environment

      if (await appHasScript(app, prestartScriptKey)) {
        api.status = chalk.yellow('Running prestart..')
        render()
        const wrapped = await runAppScript(app, prestartScriptKey)
        await wrapped.processPromise()
      }

      api.status = chalk.yellow('Starting..')
      render()

      const wrapped = await runAppScript(app, startScriptKey, { port })
      const process = wrapped.processPromise()
      processes.push(process)

      process.stdout.removeAllListeners()
      process.stderr.removeAllListeners()

      const READY_REGEXP = /Project is running at:/

      const handler = (logsType: LogsType) => (buffer: Buffer) => {
        const message = buffer.toString()
        const logs = registries[logsType][app] ?? []
        logs.push(message)
        registries[logsType][app] = logs
        if (message.match(READY_REGEXP)) {
          api.status = chalk.green('Ready')
        }
        api[logsType] += 1
        syncLogs(app, logsType)
        logsBox.setScrollPerc(100)
        render()
      }

      process.stdout.on('data', handler('info'))
      process.stderr.on('data', handler('errors'))

      return process
    },
  })

  await Promise.all(promises)
}
