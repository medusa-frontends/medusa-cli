import React from 'react'
import { CommandResult } from '../features/command-result'
import { Logs } from '../features/logs'
import { Status } from '../features/status'

export const DefaultTemplate: React.FC = ({ children }) => {
  return (
    <>
      <CommandResult />
      <Status />
      {children}
      <Logs />
    </>
  )
}
