## React Themed

Theme management for CSS modules, has support for SSR. Node streaming support coming soon.

### Installation  
`npm install react-themed-too --save-dev`
<br/>  
or  
<br/>
`yarn add react-themed-too -D`

<br/>

### Compose a theme object using your CSS modules

*`composed.js`*
```javascript
import { compose } from 'react-themed-too'
import FooStyles from './fooStyles.css'
import BarStyles from './barStyles.css'

export default compose({},
  FooStyles,
  BarStyles
)
```

### Provide theme object for `ThemeProvider`

*`App.js`*
```js
import React from 'react'
import { render } from 'react-dom'
import { ThemeProvider } from 'react-themed-too'
import composed from './composed'
import App from './App'

render(
  <ThemeProvider theme={ composed }>
    <App/>
  </ThemeProvider>,
  document.getElementById('root')
)
```

### Use theme in components

*`Button.js`*
```js
import * as React from 'react'
import { themed } from 'react-themed-too'

const Button = ({ theme, ...props }) => (
  <button className={ theme.fooButton } {...props}>
    Button Text
  </button>
)

export default themed()(Button)
```

or

```js
import * as React from 'react'
import { themed } from 'react-themed-too'

@themed()
export default class Button extends React.Component {
  constructor( props ) {
    super( props )

  }
  render() {
    const { theme } = this.props

    return (
      <button className={ theme.fooButton }>
        Button Text
      </button>
    )
  }
}
```

### SSR Extraction
react-themed provides a handy function for flushing out the css SSR
```js
import { flush } from 'react-themed-too'

const css = flush()
```