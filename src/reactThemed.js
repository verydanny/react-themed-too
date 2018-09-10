// @flow
import * as React from "react"

import { contextSecret, contextKey, webpackIdentity, webpackDevIdentity } from "./const"
import { isBrowser } from "./utils"
import themed from "./themed"
import ThemeProvider from "./themeProvider"
import compose, { compileCssObject } from "./compose"

function createThemed(context: React.Context<any>, GlobalContext: global) {
  if (GlobalContext[contextSecret] !== undefined) {
    return GlobalContext[contextSecret]
  }

  if (isBrowser) {
    const chunks = document.querySelectorAll(`[data-${contextKey}]`)
    const tag = document.createElement("style")

    Array.prototype.forEach.call(chunks, node => {
      const id = node.getAttribute(`data-${contextKey}`).split(" ")
      const innerCss = node.innerText

      tag.appendChild(document.createTextNode(innerCss))
      node.remove()
    })

    document.head.appendChild(tag)
  }

  function addGlobalCss(...cssFile) {
    const globalCss = cssFile.reduce((acc, curr) => {
      if (!isBrowser) {
        const css = compileCssObject.call(curr, false)

        try {
          if (curr.locals) {
            compose(
              GlobalContext[contextSecret].globalLocals,
              curr.locals
            )
          }
        } catch(e) {

        }

        return (acc += css.content ? css.content : "")
      } else if (isBrowser) {
        compose(
          GlobalContext[contextSecret].globalLocals,
          curr
        )
      }

      return acc
    }, "")

    GlobalContext[contextSecret].globalCss += globalCss
  }

  const reactThemed = {
    themed: themed(context),
    ThemeProvider: ThemeProvider(context, GlobalContext),
    compose,
    globalCss: "",
    globalLocals: {},
    addGlobalCss,
    theme: {},
    styles: {},
    inserted: {},
    classCache: {},
    webpackIdentity,
    webpackDevIdentity
  }
  GlobalContext[contextSecret] = reactThemed

  return reactThemed
}

export default createThemed
