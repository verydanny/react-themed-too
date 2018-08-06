// @flow
import * as React from 'react'
import hoist from 'hoist-non-react-statics'

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
  const BaseComponent = whatReactComponent(Component) === "stateless" ? React.PureComponent
    : config.pure ? React.PureComponent : React.Component

  const { context, compose } = config
  const themes = config.themes.slice()
  let thisTheme

  const buildContext = ( theme ) => {
    const shared = theme.locals

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

    return <Component theme={ thisTheme }/>
  }
  
  // update the ThemeProvider with new object, then
  // Do the thang
  return () => (
    <context.Consumer>
      { (theme) => buildContext( theme ) }
    </context.Consumer>
  )
}

const factory = defaults => {
  const themed = ( context: React.Context<any> ) => (theme: any = [], options: any) => (Component: React.ComponentType<any>) => {
    let themes = []
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