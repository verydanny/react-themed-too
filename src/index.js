// @flow
import * as React from 'react'
import createThemed from './react-themed'

const Context = React.createContext()

export const {
  themed,
  ThemeProvider,
  compose
} = createThemed( Context )