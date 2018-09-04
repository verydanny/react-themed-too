// @flow
import simpleTokenizer from "simple-tokenizer"
import { isServer } from "./utils"
import { contextKey } from "./const"

const tokenizer = new simpleTokenizer()

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
    const sourceUrls = cssMap.sources.map(
      source => `/*# sourceURL=${cssMap.sourceRoot + source}*/`
    )

    return [content]
      .concat(sourceUrls)
      .concat([sourceMapping])
      .join("\n")
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

export function compileCssObject(useSourceMap) {
  let cssObject = {}

  for (let i = 0; i < this.length; ++i) {
    const content = mapCssToSource(this[i], useSourceMap)

    if (this[i][2]) {
      cssObject = {
        mediaQuery: `@media ${this[i][2]} { ${content} }`,
        content: content
      }
    }

    cssObject = { content: content }
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
  if (theme.locals) {
    const locals: Object = theme.locals
    const css = compileCssObject.call(theme, false)

    return Object.keys(locals).reduce((acc, curr) => {
      acc.mediaQueries = {}
      const localName = locals[curr]
      const match = new RegExp(`\\.${localName}(?!\\s?\\.rt)`)

      console.log("REGULAR EXP", match)

      if (css.content && css.content !== '') {
        const tokenizedCssArray = tokenizer.tree(css.content)
        const cssRulesSelectorsObject = cssRulesGenerate(tokenizedCssArray)
        const matchArr =
        cssRulesSelectorsObject.cache &&
        cssRulesSelectorsObject.cache.length > 0
          ? cssRulesSelectorsObject.cache.reduce((cssAcc, cssSelector) => {
              const cssRule = cssRulesSelectorsObject[cssSelector]

              const cssProp = cssRule && cssRule.css ? cssRule.css : false

              const mediaProp =
                cssRule && cssRule.mediaQuery ? cssRule.mediaQuery : false

              if (match.test(cssSelector)) {
                if (!cssAcc[localName]) {
                  cssAcc[localName] = {
                    css: cssProp,
                    mediaQuery: mediaProp
                  }
                } else if (cssAcc[localName]) {
                  cssAcc[localName] = {
                    css: cssAcc[localName].css ?
                      cssAcc[localName].css + cssProp
                      : cssProp,
                    mediaQuery: cssAcc[localName].mediaQuery ?
                      cssAcc[localName].mediaQuery + mediaProp
                      : mediaProp
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
          const keyReg = new RegExp(`${contextKey}-([a-zA-Z0-9-]+)`, "g")
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
            [localName]: {
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
}

function cssRulesGenerate(cssTokenizedArray) {
  const selectorSeparator = ",",
    ruleSeparator = ":",
    space = " "

  let currentSelector = false,
    currentMediaSelector = false,
    output = {
      other: "",
      mediaQueries: [],
      cache: []
    },
    options = { minify: true }

  cssTokenizedArray.forEach(token => {
    const hasChildren = token.children ? true : false

    switch (token.token) {
      case "{":
        //
        // @NOTE: If it's just a normal selector, add its children if it has any
        //
        if (token.selectors !== void 0 && hasChildren) {
          currentSelector = token.code
          output.cache.push(currentSelector)

          if (!output[currentSelector]) {
            output[currentSelector] = {
              ...output[currentSelector],
              css: `${currentSelector}{${simpleTokenizer.build(
                token.children,
                options
              )}}`
            }
          }
        } else if (token.atRule !== void 0) {
          //
          // @NOTE: if it's a media selector, add it to mediaQuery object
          //
          if (token.atRule === "media" && hasChildren) {
            currentMediaSelector = token.code

            if (
              output.mediaQueries &&
              !output.mediaQueries.includes(currentMediaSelector)
            ) {
              output.mediaQueries.push(currentMediaSelector)
            }
            //
            // @NOTE: I'm assuming things only go 1 level deep, need recursive solution
            //
            token.children.forEach(child => {
              if (child.token === "{" && child.selectors !== void 0) {
                currentSelector = child.code
                !output.cache.includes && output.cache.push(child.code)

                if (output[currentSelector]) {
                  if (!output[currentSelector].mediaQuery) {
                    output[
                      currentSelector
                    ].mediaQuery = `${currentMediaSelector}{${simpleTokenizer.build(
                      token.children,
                      options
                    )}}`
                  } else {
                    output[
                      currentSelector
                    ].mediaQuery += `${currentMediaSelector}{${simpleTokenizer.build(
                      token.children,
                      options
                    )}}`
                  }
                } else if (!output[currentSelector]) {
                  output[currentSelector] = {
                    mediaQuery: `${currentMediaSelector}{${simpleTokenizer.build(
                      token.children,
                      options
                    )}}`
                  }
                }
              }
            })
          }
        }
        break
      default:
    }
  })

  return output
}

export default (target: Object = {}, ...themes: Array<CssLoaderT>) => {
  if (isServer) {
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
