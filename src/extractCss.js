// @flow
import { contextKey, contextSecret } from './const'

const extractCss = ( GlobalContext ) => {
  const { styles, globalCss } = GlobalContext[ contextSecret ]
  let target = {
    css: '',
    mediaQueries: ''
  }
  
  const css = Object.keys(styles).reduce((acc, curr) => {
    const currentCss = styles[curr].css && styles[curr].css.css
      ? styles[curr].css.css
      : false
    const currentMediaQuery = styles[curr].css && styles[curr].css.mediaQuery
      ? styles[curr].css.mediaQuery
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