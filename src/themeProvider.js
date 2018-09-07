// @flow
import * as React from 'react'
import { isBrowser } from './utils'
import compose from './compose'
import { contextSecret } from './const'

export default function ThemeProvider( context: React.Context<any>, GlobalContext: global ) {

  return class ThemeProvider extends React.PureComponent<any> {
    constructor(props: any) {
      super(props)

      const { theme } = this.props
      const globalLocals = GlobalContext[contextSecret].globalLocals
      const normalizedStyles = theme.styles ? theme.styles : {}
      const normalizedTheme = theme.theme ? theme.theme : theme

      if (theme && !isBrowser) {
        GlobalContext[ contextSecret ].styles = normalizedStyles
        GlobalContext[ contextSecret ].theme = compose(normalizedTheme, globalLocals)

        if (theme.classCache) {
          GlobalContext[ contextSecret ].classCache = theme.classCache
        }
      } else if (isBrowser) {
        GlobalContext[contextSecret].theme = compose(normalizedTheme, globalLocals)
      }

      console.log(GlobalContext[contextSecret])
    }

    render() {
      const { children } = this.props
      const theme = GlobalContext[ contextSecret ].theme

      return (
        <context.Provider value={ theme }>
          { children }
        </context.Provider>
      )
    }
  }
}
