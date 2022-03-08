import { $commandResult } from '@app/model/command-result'
import { $status } from '@app/model/status'
import { useStore } from 'effector-react'
import { Box, Text } from 'ink'
import ProgressBar from 'ink-progress-bar'
import Spinner from 'ink-spinner'
import React from 'react'
import { BoxNewline } from '../lib'

export const Content: React.FC = () => {
  const { kind, text, progress } = useStore($status)

  if (kind === 'spinner')
    return (
      <Text>
        <Spinner type="growVertical" />
        {' ' + text}
      </Text>
    )

  return (
    <Box width="100%" flexDirection="row">
      <Text>{text} </Text>
      <ProgressBar percent={progress / 100} left={text.length + 1} />
    </Box>
  )
}

export const CommandResult: React.FC = () => {
  const { visible, text } = useStore($commandResult)
  if (!visible) return null

  return (
    <Box width="100%" flexDirection="column">
      <Text color="cyan" underline={true}>
        Result
      </Text>
      <BoxNewline count={1} />
      <Text color="green">{text}</Text>
      <BoxNewline count={1} />
    </Box>
  )
}
