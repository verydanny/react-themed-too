// @flow
import * as React from 'react'

import themed from './themed'
import ThemeProvider from './theme-provider'
import compose from './compose'

function createThemed( context ) {

  return {
    themed: themed( context ),
    ThemeProvider: ThemeProvider( context ),
    compose
  }
}

export default createThemed