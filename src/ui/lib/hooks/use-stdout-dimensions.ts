import { useStdout } from 'ink'
import { useEffect, useState } from 'react'

export function useStdoutDimensions() {
  const { stdout } = useStdout()
  const [width, setWidth] = useState(stdout?.columns ?? 0)
  const [height, setHeight] = useState(stdout?.rows ?? 0)

  useEffect(() => {
    if (!stdout) return

    const handler = () => {
      setWidth(stdout.columns)
      setHeight(stdout.rows)
    }

    stdout.on('resize', handler)
    return () => {
      stdout.off('resize', handler)
    }
  }, [stdout])

  return { width, height }
}
