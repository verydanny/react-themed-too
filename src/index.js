// @flow
import * as React from 'react'
import createThemed from './react-themed'

const Context = React.createContext()
const GlobalContext = typeof global !== 'undefined' ? global : {}

export const {
  renderToStream,
  themed,
  ThemeProvider,
  compose
} = createThemed( Context, GlobalContext )