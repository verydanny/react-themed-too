// @flow
import simpleTokenizer from "simple-tokenizer"
import { isBrowser } from "./utils"
import { contextKey } from "./const"

const tokenizer = new simpleTokenizer()
let btoa;

if (!isBrowser) {
  btoa = require('btoa')
} else if (isBrowser) {
  btoa = window && window.btoa ? window.btoa : {}
}

export type CssLoaderT = {
  locals: {
    [x: string]: string
  },
  toCSS?: (useSourceMap: boolean) => Array<string>,
  i?: (modules: string | Object, mediaQuery: string) => Array<string>
}

const mapCssToSource = (item, useSourceMap) => {
  const content = item[1] || ""
  const cssMap = item[3]

  if (!cssMap) {
    return content
  }

  if (useSourceMap && typeof btoa === "function") {
    const sourceMapping = toComment(cssMap)
    const sourceUrls = cssMap.sources.map(source => `/*# sourceURL=${cssMap.sourceRoot + source}*/`)

    return {
      src: content,
      srcUrl: sourceUrls.join("\n"),
      srcMapping: sourceMapping,
    }
  }

  return [content].join("\n")
}

const toComment = sourceMap => {
  const base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))))
  const data = `sourceMappingURL=data:application/json;charset=utf-8;base64,${base64}`

  return `/*# ${data} */`
}

const combineFunctions = (fn1, fn2) => () => {
  const res1 = fn1()
  const res2 = fn2()

  return typeof res1 === "string" && typeof res2 === "string"
    ? `${res1}${res2}`
    : undefined
}

const composeThemes = (target, mixin) => {
  if (!mixin) return target

  return Object.keys(mixin).reduce((acc, key) => {
    switch (typeof acc[key]) {
      case "undefined":
        if (mixin[key] !== null) {
          acc[key] = mixin[key]
        }
        break
      case "string":
        if (typeof mixin[key] === "string") {
          if (target[key] === mixin[key]) {
            acc[key] = mixin[key]
          } else {
            acc[key] = [target[key], mixin[key]].filter(x => x).join(" ")
          }
        }
        break
      case "object":
        if (typeof mixin[key] === "object") {
          composeThemes(acc[key], mixin[key])
        }
        break
      case "function":
        if (typeof mixin[key] === "function") {
          acc[key] = combineFunctions(acc[key], mixin[key])
        }
        break
      default:
      // no default
    }
    return acc
  }, target)
}

export function compileCssObject(useSourceMap: boolean) {
  let cssObject = {}

  for (let i = 0; i < this.length; ++i) {
    const content = mapCssToSource(this[i], useSourceMap)
    //
    // @NOTE: This mediaQuery might be an issue in the future
    //
    if (this[i][2]) {
      cssObject.mediaQuery = `@media ${this[i][2]} { ${content} }`
    }

    cssObject.content = content.src ? content.src : content

    if (useSourceMap) {
      cssObject.sourceUrls = content.srcUrl ? content.srcUrl : '',
      cssObject.sourceMapping = content.srcMapping ? content.srcMapping : ''
    }
  }

  return cssObject
}

function isEmpty(obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) return false
  }
  return true
}

function compose(theme, target) {
  try {
    if (theme.locals) {
      const locals: Object = theme.locals
      const sourceMap = process.env.NODE_ENV === 'development' ? true : false
      const css = compileCssObject.call(theme, sourceMap)
      const tokenizedCssArray =
        css.content && css.content !== "" ? tokenizer.tree(css.content) : []
      const cssRulesSelectorsObject = tokenizedCssArray.length > 0 ? cssDingus({
        cssTokenizedArray: tokenizedCssArray,
        options: { minify: true }
      }) : {}

      return Object.keys(locals).reduce((acc, curr) => {
        acc.mediaQueries = {}
        const localName = locals[curr]
        const match = new RegExp(
          `\\.?${localName}(?!\\s?\\..*${contextKey}-[A-Za-z0-9+/-]{2,6}).*$`
        )

        if (css.content && css.content !== "") {
          const matchArr =
            cssRulesSelectorsObject.cache &&
            cssRulesSelectorsObject.cache.length > 0
              ? cssRulesSelectorsObject.cache.reduce((cssAcc, cssSelector) => {
                  const cssRule = cssRulesSelectorsObject[cssSelector]

                  const cssProp = cssRule && cssRule.css ? cssRule.css : false

                  if (match.test(cssSelector)) {
                    if (!cssAcc[localName]) {
                      cssAcc[localName] = {
                        css: cssProp
                      }
                    } else if (cssAcc[localName]) {
                      cssAcc[localName] = {
                        css: cssAcc[localName].css === cssProp
                          ? cssAcc[localName].css
                          : cssAcc[localName].css + cssProp
                      }
                    }
                  }

                  return cssAcc
                }, {})
              : {}

          if (cssRulesSelectorsObject.mediaQueries.length > 0) {
            cssRulesSelectorsObject.mediaQueries.forEach(
              query => (acc.mediaQueries[query] = true)
            )
          }

          let styleObject
          if (!isEmpty(matchArr)) {
            const keyReg = new RegExp(`${contextKey}-([a-zA-Z0-9-+/]+)`, "g")
            const ids = localName.split(keyReg)
            const name = localName
            const id = ids[1]

            if (!acc.classCache) {
              acc.classCache = {
                [id]: name
              }
            } else {
              acc.classCache = {
                ...acc.classCache,
                [id]: name
              }
            }

            styleObject = {
              [id]: {
                type: "css",
                body: matchArr[localName] || false,
                local: curr
              }
            }
          } else {
            styleObject = {
              [curr]: {
                type: "variable",
                body: localName,
                local: false
              }
            }
          }

          if (!acc.styles) {
            acc.styles = styleObject
          } else {
            acc.styles = {
              ...acc.styles,
              ...styleObject
            }
          }
        }

        if (!acc.theme) {
          acc.theme = {
            ...locals
          }
        } else {
          if (acc.theme[curr]) {
            if (acc.theme[curr] === localName) {
              acc.theme[curr] = target.theme[curr]
            } else {
              acc.theme[curr] = [target.theme[curr], localName].join(" ")
            }
          } else if (!acc.theme[curr]) {
            acc.theme[curr] = localName
          }
        }

        return acc
      }, target)
    } else {
      return composeThemes(target, theme)
    }
  } catch (e) {
    console.log(
      "\x1b[33m",
      "Info >>> If you're getting a property 'locals' TypeError, this usually means improper file imports",
      "\x1b[0m"
    )
    console.log(
      "\x1b[33m",
      "Please check how you're importing the css file, named imports when they're default will result in this error.",
      "\x1b[0m"
    )
    console.log(e)
  }
}

let cssDefaultOutput = {
  mediaQueries: [],
  cache: []
}

type cssDingusT = {
  target?: {
    [x: string]: {
      css?: string,
      mediaQuery?: string,
      misc?: string
    },
    cache: Array<string>,
    mediaQueries: Array<string>
  },
  cssTokenizedArray: Array<cssRulesArrayT> & Array<any>,
  options?: {
    minify?: boolean,
    query?: string | boolean
  }
}

type cssRulesArrayT = {
  token: string,
  code: string,
  index: number,
  children?: Array<cssRulesArrayT>,
  selectors?: Array<string>,
  atRule?: string,
  atValues?: Array<string>
}

function cssDingus(
  {
    target = cssDefaultOutput,
    cssTokenizedArray,
    options = { minify: true, query: false }
  }: cssDingusT = {
    target: cssDefaultOutput,
    cssTokenizedArray: [],
    options: { minify: true }
  }
) {
  let currentSelector = false,
    currentMediaSelector = false,
    currentOtherSelector = false

  return cssTokenizedArray.reduce((acc, curr) => {
    const children = curr.children
      ? simpleTokenizer.build(curr.children, { minify: options.minify })
      : false

    switch (curr.token) {
      case "{":
        if (curr.selectors !== void 0 && children) {
          currentSelector =
            curr.selectors.length === 1 ? curr.selectors[0] : curr.code
          acc.cache.push(currentSelector)

          if (!acc[currentSelector]) {
            acc[currentSelector] = {
              css: `${currentSelector}{${children}}`
            }
          } else if (acc[currentSelector] && options.query) {
            acc[
              currentSelector
            ].css += `${options.query.toString()}{${currentSelector}{${children}}}`
          }
        } else if (curr.atRule !== void 0) {
          if (curr.atRule === "media" && children) {
            currentMediaSelector =
              curr.atValues.length === 1
                ? `@media ${curr.atValues[0]}`
                : curr.code
            !acc.cache.includes(currentMediaSelector.toString())
              && acc.cache.push(currentMediaSelector.toString())

            return cssDingus({
              target: target,
              cssTokenizedArray: curr.children,
              options: {
                minify: true,
                query: currentMediaSelector
              }
            })
          }
        } else if (children) {
          // basically everything else
        }
      default:
    }

    return acc
  }, target)
}

export default (target: Object = {}, ...themes: Array<CssLoaderT>) => {
  if (!isBrowser) {
    return themes.reduce((acc, curr) => {
      if (!acc) {
        acc = compose(
          curr,
          target
        )
      }

      return {
        ...acc,
        ...compose(
          curr,
          target
        )
      }
    }, target)
  } else {
    return themes.reduce((acc, curr) => composeThemes(target, curr), target)
  }
}
