// @flow
import { contextSecret, contextKey } from './const'

const extractCritical = ( GlobalContext: global ) => (html: string) => {
  const { styles, classCache, globalCss } = GlobalContext[ contextSecret ]
  let { inserted, insertedCache } = GlobalContext[ contextSecret ]
  let RGX = new RegExp(`${ contextKey }--([a-zA-Z0-9-]+)`, 'gm')
  let o = { html, body: {
    css: '',
    mediaQueries: ''
  }}
  let match
  let ids = {}

  if ( globalCss !== '' ) {
    o.body.css += globalCss
  }

  while ((match = RGX.exec(html)) !== null) {
    if (ids[match[1]] === undefined) {
      ids[match[1]] = true
    }
  }

  // 1. create hash on extractCritical
  // 2. if hash exists, serve cache
  // 3. otherwise extract

  Object.keys(ids).filter(id => {
    if ( ids[id] && typeof inserted[id] === 'undefined' && classCache[id] ) {
      inserted[id] = true
      const currentID = classCache[id]

      if ( styles[currentID] ) {
        inserted[id] = {}

        const currentCss = styles[currentID].body && styles[currentID].body.css
          ? styles[currentID].body.css
          : false

        const currentMediaQuery = styles[currentID].body && styles[currentID].body.mediaQuery
          ? styles[currentID].body.mediaQuery
          : false

        if ( currentCss ) {
          o.body.css += currentCss
          inserted[id].css = currentCss

          if ( currentMediaQuery ) {
            o.body.mediaQueries += currentMediaQuery
            inserted[id].mediaQuery = currentMediaQuery
          }

          return true
        } else if ( currentMediaQuery ) {
          o.body.css += currentMediaQuery
          inserted[id].mediaQuery = currentMediaQuery

          return true
        }
      }
    } else if ( ids[id] && inserted[id] && classCache[id] ) {
      o.body.css += inserted[id].css ? inserted[id].css : ''
      o.body.mediaQueries += inserted[id].mediaQuery ? inserted[id].mediaQuery : ''
    }
  })

  return o
}

export default extractCritical
