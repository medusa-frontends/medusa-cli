import { $appSummary, commandReceived } from '@app/commands/start/model'
import { useStore } from 'effector-react'
import { Box, Text } from 'ink'
import TextInput from 'ink-text-input'
import React, { useState } from 'react'
import { BoxNewline, Table } from '../lib'
import { DefaultTemplate } from '../templates'

const $formattedSummary = $appSummary.map((summary) => {
  return summary.map((raw) => ({
    'App': raw.app,
    'Status': raw.status,
    'Info Count': raw.infoCount,
    'Error Count': raw.errorCount,
  }))
})

const Summary = () => {
  const summary = useStore($formattedSummary)
  if (summary.length === 0) return null

  return (
    <Box width="100%" flexDirection="column">
      <Text color="cyan" underline={true}>
        Summary
      </Text>
      <BoxNewline count={1} />
      <Table data={summary} />
      <BoxNewline count={1} />
    </Box>
  )
}

const Terminal = () => {
  const [text, setText] = useState('')

  return (
    <Box width="100%" flexDirection="column">
      <Text color="cyan" underline={true}>
        Terminal
      </Text>
      <BoxNewline count={1} />
      <Box width="100%" flexDirection="row">
        <Text bold>$</Text>
        <Text> </Text>
        <TextInput
          value={text}
          onChange={setText}
          onSubmit={(text) => {
            commandReceived(text)
            setText('')
          }}
        />
      </Box>
      <BoxNewline count={1} />
    </Box>
  )
}

export const StartScreen = () => (
  <DefaultTemplate
    children={
      <>
        <Summary />
        <Terminal />
      </>
    }
  />
)
