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

const create = (Component, config) => {
  const BaseComponent = whatReactComponent(Component) === "stateless" ? React.PureComponent
    : config.pure ? React.PureComponent : React.Component

  const Context = config.context
  
  return () => (
    <Context.Consumer>
      {(theme) => <Component theme={ theme }/>}
    </Context.Consumer>
  )
}

const factory = defaults => {
  const themed = ( context: React.Context<any> ) => (theme: any = [], options: any) => (Component: React.ComponentType<any>) => {
    let themes = []
    let themesCss = []
    let config = { ...defaults }

    if (theme.locals) {
      themes.push(theme.locals)
      themesCss.push({
        locals: theme.locals,
        css: theme.toString()
      })
    } else if (theme) {
      themes.push(theme)
    }

    Object.assign(config, options, {
      themes,
      themesCss,
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