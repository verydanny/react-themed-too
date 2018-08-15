// @flow
import * as React from 'react'

import { contextSecret, contextKey } from './const'
import { isBrowser } from './utils'
import themed from './themed'
import ThemeProvider from './theme-provider'
import compose from './compose'
import renderToStream from './renderToStream'

function createThemed( context: React.Context<any>, GlobalContext: global ) {
  if ( GlobalContext[ contextSecret ] !== undefined ) {
    return GlobalContext[ contextSecret ]
  }

  if ( isBrowser ) {
    let chunks = document.querySelectorAll(`[data-${contextKey}]`)
    let tag = document.createElement('style')

    Array.prototype.forEach.call(chunks, node => {
      let id = node.getAttribute(`data-${contextKey}`).split(' ')
      let innerCss = node.innerText

      tag.appendChild(document.createTextNode(innerCss))
      node.remove()
    })

    document.head.appendChild(tag)
  }

  function flush() {

  }

  const reactThemed = {
    renderToStream: renderToStream( GlobalContext ),
    themed: themed( context ),
    ThemeProvider: ThemeProvider( context, GlobalContext ),
    compose,
  }
  GlobalContext[ contextSecret ] = reactThemed

  return reactThemed
}

export default createThemed
