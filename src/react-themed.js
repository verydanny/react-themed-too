// @flow
import * as React from 'react'

import { contextSecret } from './const'
import themed from './themed'
import ThemeProvider from './theme-provider'
import compose from './compose'
import renderToStream from './renderToStream'

function createThemed( context: React.Context<any>, GlobalContext: global ) {
  if ( GlobalContext[ contextSecret ] !== undefined ) {
    return GlobalContext[ contextSecret ]
  }

  const reactThemed = {
    renderToStream: renderToStream( GlobalContext ),
    themed: themed( context ),
    ThemeProvider: ThemeProvider( context, GlobalContext ),
    compose
  }
  GlobalContext[ contextSecret ] = reactThemed

  return reactThemed
}

export default createThemed