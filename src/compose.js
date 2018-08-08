// @flow
import * as React from 'react'
export type CssLoaderT = {
  locals: {
    [x: string]: string
  },
  toCSS?: ( useSourceMap: boolean ) => Array<string>,
  i?: ( modules: string | Object, mediaQuery: string ) => Array<string>,
}

const mapCssToSource = (item, useSourceMap) => {
  const content = item[1] || ''
  const cssMap = item[3]

  if (!cssMap) {
    return content
  }

  if (useSourceMap && typeof btoa === 'function') {
    const sourceMapping = toComment(cssMap)
    const sourceUrls = cssMap.sources.map(source => `/*# sourceURL=${cssMap.sourceRoot + source}*/`)

    return [content].concat(sourceUrls).concat([sourceMapping]).join('\n')
  }

  return [content].join('\n')
}

const toComment = (sourceMap) => {
  const base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))))
  const data = `sourceMappingURL=data:application/json;charset=utf-8;base64,${base64}`

  return `/*# ${data} */`
}

const composeCssTheme = (target, mixin) => {
  if (!mixin) return target

  return Object.keys(mixin).reduce((acc, key) => {

    if (mixin.locals) {
      // my own CSS maker, ignores scoping issues
      mixin.toCSS = function( useSourceMap ) {
        return this.map(item => {
          const content = mapCssToSource(item, useSourceMap)

          if ( item[2] ) {
            return `@media ${ item[2] } { ${ content } }`
          }

          return content
        }).join("")
      }

      acc.css = !acc.css ? `${ mixin.toCSS() }` :  `${ acc.css += mixin.toCSS() }`
    }

    switch (typeof acc[key]) {
      case 'undefined':
        if (mixin[key] !== null && !Array.isArray(mixin[key]) && typeof mixin[key] !== 'function') {
          acc[key] = mixin[key]
        }
        break
      case 'string':
        if (typeof mixin[key] === 'string') {
          acc[key] = [target[key], mixin[key]].filter(x => x).join(' ')
        }
        break
      case 'object':
        if (typeof mixin[key] === 'object') {
          composeCssTheme(acc[key], mixin[key])
        }
        break
      default:
    }

    return acc
  }, target)
}

export default (target: Object = {}, ...themes: Array<CssLoaderT>) => {
  return {
    ...themes.reduce((acc, curr) => composeCssTheme(acc, curr), target)
  }
}