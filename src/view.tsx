import { Box } from 'ink'
import React from 'react'
import { routes } from './routes'
import { renderRoutes } from './ui/features/routing'
import { useStdoutDimensions } from './ui/lib'

export const View: React.FC = () => {
  const { width, height } = useStdoutDimensions()

  return (
    <Box width={width} height={height} padding={1} flexDirection="column">
      {renderRoutes(routes)}
    </Box>
  )
}
