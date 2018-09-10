// @flow
import * as React from "react"

import createThemed from "./reactThemed"
import { default as extractCriticalCSS } from "./extractCritical"
import { default as nodeStream } from "./renderToStream"
import { default as extractAll } from "./extractCss"

const Context = React.createContext()
const GlobalContext = typeof global !== "undefined" ? global : {}

const extractCritical = extractCriticalCSS(GlobalContext)
const renderToStream = nodeStream(GlobalContext)
const extractCss = extractAll(GlobalContext)

export const {
  themed,
  ThemeProvider,
  compose,
  globalCss,
  addGlobalCss,
  webpackIdentity,
  webpackDevIdentity
} = createThemed(Context, GlobalContext)

export { extractCritical, renderToStream, extractCss }
