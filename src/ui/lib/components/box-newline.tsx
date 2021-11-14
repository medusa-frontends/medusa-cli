import { Box } from 'ink'
import React from 'react'

export const BoxNewline: React.FC<{ count?: number }> = ({ count = 1 }) => {
  return <Box height={count} />
}
