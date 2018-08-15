// @flow
import { contextSecret, contextKey } from './const'

const extractCritical = ( GlobalContext: global ) => (html: String) => {
  const { styles, classCache } = GlobalContext[ contextSecret ]
  let { inserted } = GlobalContext[ contextSecret ]
  let RGX = new RegExp(`${ contextKey }--([a-zA-Z0-9-]+)`, 'gm')
  let o = { html, css: '' }
  let match
  let ids = {}

  while ((match = RGX.exec(html)) !== null) {
    if (ids[match[1]] === undefined) {
      ids[match[1]] = true
    }
  }

  Object.keys(ids).filter(id => {
    if ( ids[id] && typeof inserted[id] === 'undefined' && classCache[id] ) {
      inserted[id] = true
      let currentID = classCache[id]

      if ( styles[currentID] ) {
        let currentCss = styles[currentID].css && styles[currentID].css.css
          ? styles[currentID].css.css
          : false

        let currentMediaQuery = styles[currentID].css && styles[currentID].css.mediaQuery
          ? styles[currentID].css.mediaQuery
          : false

        if ( currentCss ) {
          o.css += currentCss

          return true
        }
      }
    } else {
      return false
    }
  })

  return o
}

export default extractCritical