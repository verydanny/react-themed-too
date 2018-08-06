import * as React from 'react'
import compose from './compose'

function ThemeProvider( context ) {
  return class ThemeProvider extends React.PureComponent {
    constructor(props) {
      super(props)

    }

    render() {
      const { children } = this.props
      let { theme } = this.props

      // Everything will have locals
      theme.locals = !theme.locals ? theme : theme.locals

      console.log(theme)

      return (
        <context.Provider value={ theme }>
          { children }
        </context.Provider>
      )
    }
  }
}

export default ThemeProvider