## React Themed

Theme management and injection utilizing only css-loader. SSR.

### Guide
- [Installation](#installation)
- [Composition](#compose)

### Features:
- [x] SSR
- [x] Supports SCSS/SASS out of the box
- [x] No weird "css-in-js" API
- [x] Fast
- [x] CSS extraction of critical CSS
- [x] Node streaming support

### Installation  
**NPM:** `npm install react-themed-too --save-dev`
**Yarn:** `yarn add react-themed-too -D`

**Client webpack:**
```js
const { contextKey } = require('react-themed-too')

module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'css-loader/locals',
            options: {
              camelCase: true,
              modules: true,
              localIdentName: `[name]__${ contextKey }--[hash:base64:5]`,
            },
          }
        ],
      }
    ]
  }
}
```

**Server webpack:**
```js
const { contextKey } = require('react-themed-too')

module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'css-loader',
            options: {
              camelCase: true,
              modules: true,
              localIdentName: `[name]__${ contextKey }--[hash:base64:5]`,
            },
          }
        ],
      }
    ]
  }
}
```

### Compose

**Compose a theme:**
```js
import { compose } from 'react-themed-too'
import Header from './Header.css'
import Footer from './Footer.css'

export default compose({},
  Header,
  Footer
)
```

**Import composed theme:**
```js
import * as React from 'react'
import { ThemeProvider } from 'react-themed-too'

import MobileTheme from 'ui/smallTheme'
import Header from './Header/Header'
import Footer from './Footer/Footer'

const App = () => (
  <ThemeProvider theme={MobileTheme}>
    <Header />
    <Footer />
  </ThemeProvider>
)

export default App
```

**Use composed theme:**
```js
import * as React from 'react'
import { themed } from 'react-themed-too'

const Header = ({ theme, ...props }: { theme: any }) => {
  return (
    <div className={theme.HeaderMain}>
      <h1 className={theme.HeaderFoo}>This is my title</h1>
    </div>
  )
}

export default themed('*')(Header)
```

**Or use class decorator:**
```js
import * as React from 'react'
import { themed } from 'react-themed-too'

@themed('*')
export default class Footer extends React.PureComponent {
  constructor(props) {
    super(props)
  }

  render() {
    const { theme } = this.props

    return (
      <div className={theme.FooterText}>This is the footer</div>
    )
  }
}
```

### API

Coming Soon

### ToDo

- [ ] Add optional client side support
- [ ] Better CSS sorting
- [ ] Faster CSS sorting
- [ ] Caching
