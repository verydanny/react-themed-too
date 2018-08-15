// @flow
import * as React from 'react'
import createThemed from './react-themed'

const Context = React.createContext()
const GlobalContext = typeof global !== 'undefined' ? global : {}

export const {
  renderToStream,
  extractCritical,
  themed,
  ThemeProvider,
  compose,
  globalCss,
  addGlobalCss,
  webpackIdentity
} = createThemed( Context, GlobalContext )
