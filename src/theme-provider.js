import * as React from 'react'
import { isServer } from './utils'
import compose from './compose'
import { contextSecret } from './const'

export default function ThemeProvider( context, GlobalContext ) {

  return class ThemeProvider extends React.PureComponent {
    constructor(props) {
      super(props)

      const { theme } = this.props

      if (theme && isServer()) {
        GlobalContext[ contextSecret ].styles = this.props.theme.styles ? this.props.theme.styles : this.props.theme
        GlobalContext[ contextSecret ].inserted = {}


        if (theme.classCache) {
          GlobalContext[ contextSecret ].classCache = theme.classCache
        }
      }
    }

    render() {
      const { children } = this.props
      let { theme } = this.props

      theme = theme.theme ? theme.theme : theme

      return (
        <context.Provider value={ theme }>
          { children }
        </context.Provider>
      )
    }
  }
}
