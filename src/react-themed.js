// @flow
import * as React from 'react'

import themed from './themed'
import ThemeProvider from './theme-provider'
import compose from './compose'

function createThemed( context ) {

  function flush( Component ) {
    
  }

  const reactThemed = {
    flush,
    themed: themed( context ),
    ThemeProvider: ThemeProvider( context ),
    compose
  }

  return reactThemed
}

export default createThemed