import { $activeLogsApp, $activeLogsLevel, $appLogs } from '@app/commands/start/model'
import { globalLogs } from '@app/model/global-logs'
import { useStore } from 'effector-react'
import { Box, Text } from 'ink'
import * as React from 'react'
import { BoxNewline, ScrollableBox } from '../lib'

export const Logs: React.FC = () => {
  const summary = useStore(globalLogs.registry)
  const appLogs = useStore($appLogs)
  const level = useStore($activeLogsLevel)
  const app = useStore($activeLogsApp)

  const getMessages = () => {
    if (level === 'summary') return summary.all ?? []
    if (!app) return []
    return appLogs[level][app] ?? []
  }

  const messages = getMessages()
  if (messages.length === 0) return null

  return (
    <Box width="100%" flexGrow={1} flexDirection="column">
      <Text color="cyan" underline={true}>
        Logs
      </Text>
      <BoxNewline count={1} />
      <ScrollableBox text={messages.join('\n')} initialScroll="100%" />
    </Box>
  )
}
