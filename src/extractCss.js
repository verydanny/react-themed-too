// @flow
import { contextKey, contextSecret } from './const'

const extractCss = ( GlobalContext ) => {
  const { styles, globalCss } = GlobalContext[ contextSecret ]
  let target = {
    css: '',
    mediaQueries: ''
  }
  
  const css = Object.keys(styles).reduce((acc, curr) => {
    const currentCss = styles[curr].body && styles[curr].body.css
      ? styles[curr].body.css
      : false
    const currentMediaQuery = styles[curr].body && styles[curr].body.mediaQuery
      ? styles[curr].body.mediaQuery
      : false

    if (currentCss) {
      acc.css += currentCss
    } else if (currentMediaQuery) {
      acc.mediaQueries += currentMediaQuery
    }

    return acc
    
  }, target)

  return {
    globalCss: globalCss,
    css: target
  }
}

export default extractCss