// @flow
import * as React from 'react'

import createThemed from './reactThemed'
import { default as extractCss } from './extractCritical'
import { default as nodeStream } from './renderToStream'

const Context = React.createContext()
const GlobalContext = typeof global !== 'undefined' ? global : {}
const extractCritical = extractCss( GlobalContext )
const renderToStream = nodeStream( GlobalContext )

export const {
  insertedCache,
  themed,
  ThemeProvider,
  compose,
  globalCss,
  addGlobalCss,
  webpackIdentity
} = createThemed( Context, GlobalContext )

export { extractCritical, renderToStream }