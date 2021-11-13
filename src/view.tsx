import { Box } from 'ink'
import React from 'react'
import { renderRoutes } from './routes'
import { useStdoutDimensions } from './ui/lib'

export const View: React.FC = () => {
  const { width, height } = useStdoutDimensions()

  return (
    <Box width={width} height={height} padding={1} flexDirection="column">
      {renderRoutes()}
    </Box>
  )
}
