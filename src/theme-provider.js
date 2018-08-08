import * as React from 'react'
import { isServer } from './utils'
import compose from './compose'
import { contextSecret } from './const'

export default function ThemeProvider( context, GlobalContext ) {

  return class ThemeProvider extends React.PureComponent {
    constructor(props) {
      super(props)

      if (this.props.theme && isServer()) {
        GlobalContext[ contextSecret ].theme = this.props.theme
      }
    }

    render() {
      const { children } = this.props
      let { theme } = this.props

      // Everything will have locals
      theme.locals = !theme.locals ? theme : theme.locals

      return (
        <context.Provider value={ theme }>
          { children }
        </context.Provider>
      )
    }
  }
}