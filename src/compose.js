// @flow
import simpleTokenizer from 'simple-tokenizer';
import { isServer } from './utils'

const tokenizer = new simpleTokenizer()

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

const composeTheme = (target, mixin) => {
  if (!mixin) return target

  return Object.keys(mixin).reduce((acc, key) => {
    switch (typeof acc[key]) {
      case 'undefined':
        if (mixin[key] !== null) {
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
          composeTheme(acc[key], mixin[key])
        }
        break
      default:
    }

    return acc
  }, target)
}

function compileCssObject( useSourceMap ) {
  let cssObject = {}

  for (let i = 0; i < this.length; ++i) {
    const content = mapCssToSource(this[i], useSourceMap)

    if ( this[i][2] ) {
      cssObject = {
        mediaQuery: `@media ${ this[i][2] } { ${ content } }`,
        content: content
      }
    }

    cssObject = { content: content }
  }

  return cssObject
}

function compose( theme, target ) {

  if (theme.locals) {
    const locals: Object = theme.locals
    const css = compileCssObject.call(theme, false)

    if (css.content) {
      const tokenizedCssArray = tokenizer.tree(css.content)
      const cssRulesSelectorsObject = cssRulesGenerate( tokenizedCssArray )

      console.log(cssRulesSelectorsObject)

      return Object.keys(locals).reduce((acc, curr) => {
        const localName = locals[curr]
        const match = new RegExp(localName)
        const css = Object.keys(cssRulesSelectorsObject).reduce(( acc, cssSelector ) => {
          if (match.test(cssSelector)) {
            acc += cssRulesSelectorsObject[ cssSelector ]
          }

          return acc
        }, '')

        const styleObject = {
          [curr]: {
            css: css,
            local: localName
          }
        }

        const themeObject = {
          [curr]: localName
        }

        if (!acc.theme) {
          acc.theme = themeObject
        } else if (acc.theme[curr]) {
          acc.theme[curr] = [acc.theme[curr], target.theme[curr]].filter(x => x).join(" ")
        } else {
          acc.theme = {
            ...acc.theme,
            ...themeObject
          }
        }

        if (acc.styles) {
          acc.styles = {
            ...acc.styles,
            ...styleObject
          }
        } else {
          acc.styles = styleObject
        }

        return acc
      }, target)
    }
  }
  
  return composeTheme(theme, target)
}

function cssRulesGenerate( cssTokenizedArray ) {
  const selectorSeparator = ',',
        ruleSeparator = ':',
        space = ' '

  let currentSelector = false,
      currentMediaSelector = false,
      output = {
        other: ''
      },
      options = { minify: true }

  cssTokenizedArray.forEach(token => {
    switch (token.token) {
      case '{':
        if (token.selectors !== void 0) {
          currentSelector = token.code

          if (!output[currentSelector]) {
            output[currentSelector] = {
              css: `${ currentSelector } { ${ simpleTokenizer.build(token.children, options) } }`
            }
          } else {
            output[currentSelector].css += `${ simpleTokenizer.build(token.children, options) }`
          }

        } else if (token.atRule !== void 0) {

          if (token.atRule === 'media') {
            currentMediaSelector = token.code

            if (output[currentSelector] && !output[currentSelector].mediaQuery && token.children) {
              output[currentSelector].mediaQuery = `${ currentMediaSelector } { ${ simpleTokenizer.build(token.children, options) } }`
            } else if (!output[currentSelector]) {
              output.other += simpleTokenizer.build(token.children,options)
            }
          }
        }
    }
  })

  return output
}

export default (target: Object = {}, ...themes: Array<CssLoaderT>) => {

  if ( isServer() ) {
    return themes.reduce((acc, curr) => {
      if (!acc) {
        acc = compose(curr, target)
      }
  
      return {
        ...acc,
        ...compose(curr, target)
      }
    }, target)
  } else {
    return themes.reduce((acc, curr) => composeTheme(target, curr), target)
  }
}