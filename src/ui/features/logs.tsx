import { useStore } from 'effector-react'
import { Box, Text } from 'ink'
import * as React from 'react'
import { logs } from '../../model/logs'
import { BoxNewline, ScrollableBox } from '../lib'

export const Logs: React.FC = () => {
  const summary = useStore(logs.summary.registry)
  const messages = summary.all || []
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
