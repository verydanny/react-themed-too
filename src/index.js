// @flow
import * as React from 'react'
import { contextSecret } from './const'
import createThemed from './react-themed'
import { default as extractCss } from './extractCritical'
import { default as nodeStream } from './renderToStream'

const Context = React.createContext()
const GlobalContext = typeof global !== 'undefined' ? global : {}
const extractCritical = extractCss( GlobalContext[ contextSecret ] )
const renderToStream = nodeStream( GlobalContext[ contextSecret ] )

export const {
  themed,
  ThemeProvider,
  compose,
  globalCss,
  addGlobalCss,
  webpackIdentity
} = createThemed( Context, GlobalContext )

export { extractCritical, renderToStream }