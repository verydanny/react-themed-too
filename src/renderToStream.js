import through from "through"
import pipe from "multipipe"
import tokenize from "html-tokenize"

import { contextSecret, contextKey } from "./const"

const createRenderToStream = GlobalContext => () => {
  const tokenStream = tokenize()
  let globalCssInjected = false
  let insed = {}

  const inlineStream = through(
    function write(thing) {
      const { styles, classCache, inserted, globalCss } = GlobalContext[
        contextSecret
      ]
      let [type, data] = thing
      let css = ""
      let mediaQueries = ""
      let ids = {}

      if (globalCss !== "" && !globalCssInjected) {
        this.queue(
          `<style data-${contextKey}="globalCss">
            ${globalCss}
          </style>`
        )

        globalCssInjected = true
      }

      if (type === "open") {
        let match
        let fragment = data.toString()
        let regex = new RegExp(`${contextKey}-([a-zA-Z0-9-]+)`, "gm")


        while ((match = regex.exec(fragment)) !== null) {
          if (match !== null && typeof ids[match[1]] === "undefined") {
            ids[match[0]] = true
          }
        }

        Object.keys(styles).forEach(id => {
          if (
            styles[id] !== true &&
            insed[id] === undefined &&
            ids[id] === true
          ) {
            insed[id] = true

            const currentCss =
              styles[id] && styles[id].body && styles[id].body.css
                ? styles[id].body.css
                : ""

            const currentMediaQuery =
              styles[id] && styles[id].body && styles[id].body.mediaQuery
                ? styles[id].body.mediaQuery
                : ""

            css +=
              currentCss !== "" || currentMediaQuery !== ""
                ? currentCss + currentMediaQuery
                : ""
          }
        })

        if (css !== "") {
          this.queue(
            `<style data-${contextKey}="${Object.keys(ids).join(" ")}">
              ${css}
            </style>`
          )
        }
      }

      this.queue(data)
    },
    function end() {
      this.queue(null)
    }
  )

  return pipe(
    tokenStream,
    inlineStream
  )
}

export default createRenderToStream
