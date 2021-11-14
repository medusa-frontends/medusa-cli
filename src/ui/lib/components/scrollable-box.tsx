import { Box, DOMElement, Text, useInput } from 'ink'
import React, { useEffect, useRef, useState } from 'react'
import { useStdoutDimensions } from '../hooks'

type Scroll = number | '100%'

type CutOptions = {
  text: string
  width: number
  height: number
  scroll: Scroll
}

function createFingerprint(options: CutOptions) {
  return JSON.stringify(options)
}

function cutText(options: CutOptions) {
  const { text, width, height } = options
  let { scroll } = options

  const lines = text.split('\n')
  const wrappedLines: string[] = []

  for (const line of lines) {
    let offset = 0
    let substring: string
    while ((substring = line.slice(offset, offset + width))) {
      wrappedLines.push(substring)
      offset += width
    }
  }

  const minScroll = 0
  const maxScroll = Math.max(0, wrappedLines.length - height)
  if (scroll === '100%') scroll = maxScroll
  if (scroll < minScroll) scroll = minScroll
  if (scroll > maxScroll) scroll = maxScroll
  const cutted = wrappedLines.slice(scroll, scroll + height).join('\n')

  return { cutted, minScroll, maxScroll }
}

type BaseProps = Parameters<typeof Box>[0]

type Props = {
  text: string
  initialScroll?: Scroll
} & BaseProps

export const ScrollableBox: React.FC<Props> = ({ text, initialScroll = 0, ...rest }) => {
  const yogaRef = useRef<DOMElement | null>(null)
  const [scroll, setScroll] = useState<Scroll>(initialScroll)
  const [maxScroll, setMaxScroll] = useState<number>(Number.POSITIVE_INFINITY)
  const [cutted, setCutted] = useState('')
  const [fingerprint, setFingerprint] = useState(() =>
    createFingerprint({
      text: '',
      width: 0,
      height: 0,
      scroll: 0,
    })
  )
  const { width, height } = useStdoutDimensions()

  useEffect(() => {
    const yogaNode = yogaRef.current?.yogaNode
    if (!yogaNode) return

    const width = yogaNode.getComputedWidth()
    const height = yogaNode.getComputedHeight()

    const nextFingerprint = createFingerprint({
      text,
      width,
      height,
      scroll,
    })

    if (nextFingerprint === fingerprint) {
      return
    }

    const { cutted, minScroll, maxScroll } = cutText({
      text,
      scroll,
      width,
      height,
    })

    setCutted(cutted)
    setMaxScroll(maxScroll)
    if (scroll < minScroll) setScroll(minScroll)
    if (scroll > maxScroll) setScroll(maxScroll)
    if (scroll === maxScroll) setScroll('100%')
    setFingerprint(nextFingerprint)
  }, [text, scroll, width, height])

  useInput((_, key) => {
    if (!key.upArrow) return
    setScroll((scroll) => {
      if (scroll === '100%') return maxScroll - 1
      return scroll - 1
    })
  })

  useInput((_, key) => {
    if (!key.downArrow) return
    setScroll((scroll) => {
      if (scroll === '100%') return '100%'
      if (scroll + 1 === maxScroll) return '100%'
      return scroll + 1
    })
  })

  return (
    <Box ref={yogaRef} width="100%" height="100%" {...rest}>
      <Text>{cutted}</Text>
    </Box>
  )
}
