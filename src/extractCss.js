// @flow
import { contextKey, contextSecret } from './const'

const extractCss = ( GlobalContext ) => () => {
  const { styles, globalCss, inserted } = GlobalContext[ contextSecret ]
  let target = {
    css: '',
    mediaQueries: ''
  }
  
  Object.keys(styles).reduce((acc, curr) => {

    const match = new RegExp(`${contextKey}-([a-zA-Z0-9-+/]+)`, "g")
    const ids = curr.split(match)
    const id = ids[1]

    if ( inserted[id] ) {
      return acc
    } else {
      const currentCss = styles[curr].body && styles[curr].body.css
      ? styles[curr].body.css
      : false
      const currentMediaQuery = styles[curr].body && styles[curr].body.mediaQuery
        ? styles[curr].body.mediaQuery
        : false

      if (currentCss) {
        acc.css += currentCss

        if (currentMediaQuery) {
          acc.mediaQueries += currentMediaQuery
        }
      } else if (currentMediaQuery) {
        acc.mediaQueries += currentMediaQuery
      }
    }

    return acc
    
  }, target)

  return {
    globalCss: globalCss,
    body: target
  }
}

export default extractCss