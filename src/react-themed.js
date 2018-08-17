// @flow
import * as React from 'react'

import { contextSecret, contextKey, webpackIdentity } from './const'
import { isBrowser, isServer } from './utils'
import themed from './themed'
import ThemeProvider from './theme-provider'
import compose, { compileCssObject } from './compose'
import renderToStream from './renderToStream'
import extractCritical from './extractCritical'

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

  function addGlobalCss( ...cssFile ) {
    GlobalContext[ contextSecret ].globalCss += cssFile.reduce((acc, curr) => {
      if (curr.locals && isServer) {
        let css = compileCssObject.call(curr, false)

        acc += css.content

        return acc
      }
    }, '')
  }

  const reactThemed = {
    themed: themed( context ),
    ThemeProvider: ThemeProvider( context, GlobalContext ),
    compose,
    globalCss: '',
    addGlobalCss,
    styles: {},
    inserted: {},
    classCache: {},
    webpackIdentity,
  }
  GlobalContext[ contextSecret ] = reactThemed

  return reactThemed
}

export default createThemed
