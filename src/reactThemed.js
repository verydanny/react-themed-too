// @flow
import * as React from 'react'

import { contextSecret, contextKey, webpackIdentity } from './const'
import { isBrowser, isServer } from './utils'
import themed from './themed'
import ThemeProvider from './themeProvider'
import compose, { compileCssObject } from './compose'

function createThemed( context: React.Context<any>, GlobalContext: global ) {
  if ( GlobalContext[ contextSecret ] !== undefined ) {
    return GlobalContext[ contextSecret ]
  }

  if ( isBrowser ) {
    const chunks = document.querySelectorAll(`[data-${contextKey}]`)
    const tag = document.createElement('style')

    Array.prototype.forEach.call(chunks, node => {
      const id = node.getAttribute(`data-${contextKey}`).split(' ')
      const innerCss = node.innerText

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
