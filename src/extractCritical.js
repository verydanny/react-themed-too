// @flow
import { contextSecret, contextKey } from "./const"

const extractCritical = (GlobalContext: global) => (html: string) => {
  const { styles, classCache, globalCss } = GlobalContext[contextSecret]
  let { inserted, insertedCache } = GlobalContext[contextSecret]
  const RGX = new RegExp(`${contextKey}-([a-zA-Z0-9-+/]+)`, "gm")
  let o = {
    html,
    body: {
      css: ""
    }
  }
  let match
  let ids = {}

  if (globalCss !== "") {
    o.body.css += globalCss
  }

  while ((match = RGX.exec(html)) !== null) {
    if (ids[match[1]] === undefined) {
      ids[match[1]] = true
    }
  }

  Object.keys(ids).filter(id => {
    if (ids[id] && typeof inserted[id] === "undefined" && classCache[id]) {
      inserted[id] = true
      const currentID = classCache[id]

      if (styles[currentID]) {
        inserted[id] = {}

        const currentCss =
          styles[currentID] &&
          styles[currentID].body &&
          styles[currentID].body.css
            ? styles[currentID].body.css
            : false

        if (currentCss) {
          o.body.css += currentCss
          inserted[id].css = currentCss
        }
      }
    } else if (ids[id] && inserted[id] && classCache[id]) {
      o.body.css += inserted[id].css ? inserted[id].css : ""
    }
  })

  return o
}

export default extractCritical
