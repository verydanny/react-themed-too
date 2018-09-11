// @flow
import * as React from 'react'
import hoist from 'hoist-non-react-statics'

import type { CssLoaderT } from './compose'
import compose from './compose'

const pluck = (theme, keys) => {
  if ( theme && keys !== void 0 ) {
    return keys.reduce((acc, key) => {
      if (keys !== void 0 && theme[key]) {
        acc[key] = theme[key]
      }
      return acc
    }, {})
  }

  return {}
}

const match = (theme, regex) => (
  Object.keys(theme).reduce((acc, key) => {
    if (key.match(regex)) acc[key] = theme[key]
    return acc
  }, {})
)

const create = (Component, config) => {
  const { context, compose, pure } = config

  const buildTheme = ( reactThemeContext ) => {
    const themes = config.themes.slice()
    const shared = reactThemeContext
    let thisTheme = undefined

    if (!shared) {
      return {}
    }

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

  class Themed extends React.PureComponent<any> {
    // Only used for unit testing purposes
    static WrappedComponent = Component
    static displayName = `Themed(${Component.displayName || Component.name})`

    constructor(props) {
      super(props)
    }

    render() {
      const { ...props } = this.props

      return (
        <context.Consumer>
          {( theme ) => {
            const thisTheme = buildTheme(theme)

            return <Component theme={ thisTheme } { ...props }/>
          }}
        </context.Consumer>
      )
    }
  }

  const StatelessThemed = ({ ...props }) => (
    <context.Consumer WrappedComponent={ Component }>
      {(theme: CssLoaderT ) => {
        const thisTheme = buildTheme(theme)

        return <Component theme={ thisTheme } {...props}/>
      }}
    </context.Consumer>
  )

  return pure ?
    hoist(Themed, Component)
    : StatelessThemed
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
      context,
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
