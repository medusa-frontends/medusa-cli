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

export const Status: React.FC = () => {
  const { visible } = useStore($status)
  if (!visible) return null

  return (
    <Box width="100%" flexDirection="column">
      <Text color="cyan" underline={true}>
        Status
      </Text>
      <BoxNewline count={1} />
      <Content />
      <BoxNewline count={1} />
    </Box>
  )
}
