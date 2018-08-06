import * as React from 'react'
import compose from './compose'

function ThemeProvider( context ) {
  return class ThemeProvider extends React.PureComponent {
    constructor(props) {
      super(props)

    }

    render() {
      const { theme, children } = this.props
      const newContext = {
        theme,
        compose
      }

      return (
        <context.Provider value={ newContext }>
          { children }
        </context.Provider>
      )
    }
  }
}

export default ThemeProvider