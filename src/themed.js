// @flow
import * as React from 'react'
import type { CssLoaderT } from './compose'

import compose from './compose'

const whatReactComponent = (component) => {
  if (typeof component !== 'string' && component.prototype && component.prototype.render) {
    return "class"
  }

  return "stateless"
}

const pluck = (theme, keys) => (
  keys.reduce((acc, key) => {
    acc[key] = theme[key]
    return acc
  }, {})
)

const match = (theme, regex) => (
  Object.keys(theme).reduce((acc, key) => {
    if (key.match(regex)) acc[key] = theme[key]
    return acc
  }, {})
)

const create = (Component, config) => {
  const { context, compose } = config

  const buildTheme = ( reactThemeContext ) => {
    const themes = config.themes.slice()
    const shared = reactThemeContext
    let thisTheme = undefined;

    themes.forEach(theme => {
      if (Array.isArray(theme)) {
        thisTheme = compose(thisTheme, pluck(shared, theme))
      } else if (typeof theme === 'string') {
        thisTheme = compose(thisTheme, theme === '*' ? shared : shared[theme])
      } else if (theme instanceof RegExp) {
        thisTheme = compose(thisTheme, match(shared, theme))
      } else if (typeof theme === 'object') {
        thisTheme = compose(thisTheme, theme)
      }
    })

    return thisTheme
  }

  return ({ ...props }) => (
    <context.Consumer>
      {(theme: CssLoaderT ) => {
        const thisTheme = buildTheme(theme)

        return <Component theme={ thisTheme } {...props}/>
      }}
    </context.Consumer>
  )
}

type FactoryDefaultsT = {|
  compose: (target ? : Object, themes: Array < CssLoaderT > ) => Object,
  pure?: boolean,
  propName?: string,
  context?: any,
  themes?: string & RegExp & Array<CssLoaderT>
|}

const factory = (defaults: FactoryDefaultsT) => {
  const themed = ( context: React.Context<any> ) => (theme: CssLoaderT, options: FactoryDefaultsT ) => (Component: React.ComponentType<any>) => {
    let themes: Array<any> = []
    let config = { ...defaults }

    if (theme) {
      themes.push(theme)
    }

    Object.assign(config, options, {
      themes,
      context
    })

    return create(Component, config)
  }

  return themed
}

export default factory({
  compose,
  pure: false,
  propName: 'theme'
})
