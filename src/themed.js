// @flow
import * as React from 'react'
import hoist from 'hoist-non-react-statics'
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

  return () => (
    <context.Consumer>
      {(theme: CssLoaderT ) => {
        return <Component theme={theme} />
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
