# react-themed-too

Theme management and css injection utilizing css-loader.

## Documentation
- [Installation](#installation)
- [Composition](#compose)
- [API](#api)

## Features:
- 🌏 SSR
- ✨ Supports SCSS/SASS out of the box
- 😣 No weird "css-in-js" API
- 🏎 Fast
- 👌 CSS extraction of critical CSS
- 📺 Node streaming support
- 🧠 Caching support

---

## Installation  
**NPM:** `npm install react-themed-too`  
**Yarn:** `yarn add react-themed-too`

**Client webpack:**
```js
const { webpackIdentity } = require('react-themed-too')

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
              localIdentName: webpackIdentity,
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
const { webpackIdentity } = require('react-themed-too')

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
              localIdentName: webpackIdentity,
            },
          }
        ],
      }
    ]
  }
}
```

## Compose

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

## API

### `<ThemeProvider theme>`
Adds theme to a React component context, making it available in `themed()` calls.

#### Props

- `theme` (Object): A theme object, usually passed via css-loader, but can be any provider. Also works if you
don't plan on using `react-themed-too` to inject css.

### `themed([theme], [options])`
Creates a new HOC for generating a `Themed` component.

#### Parameters

- `theme` (Object|String|Array): Theme theme to bind to the component. Can be either a plain object, css-loader object, or
a string/array for selecting context themed(s).

- `options` (Object): Configures default options for `Themed` component.
  - pure (Bool): The component should extend `PureComponent`

### `compose(target, ...themes)`
Recursively merges theme objects by concatting values for overlapping keys and copies result into a target object, if none is specified an empty object is used.

### `addGlobalCss(...cssFiles)`
Adds all added files to a GlobalCss context that is injected when served.

#### Parameters

- cssFiles (Object): CSS file object, usually passed from css-loader.

#### Example

```js
import normalize from './normalize.css'
import bootstrap from './boostrap.scss'

addGlobalCss(
  normalize,
  bootstrap
)
```

### `extractCritical(HTMLstring): Object`
Returns an object with properties `html` and `css`. Removes unused rules, but includes `addGlobalCss` rules.

#### Parameters

- `HTMLString` (String): An HTML string, usually the result of React's `renderToString()` or `renderToStaticMarkup()`.

#### Example

```js
import { extractCritical } from 'react-themed-too'
import { renderToString } from 'react-dom/server'

const children = extractCritical(renderToString(<App/>))

const html = renderToString(
  <HTML
    state={store}
    scripts={assets}
    css={children.body.css}
  >
    { children.html }
  </HTML>
)

res.send(html)
```

## ToDo

- [ ] Add optional client side support
- [ ] Better CSS sorting
- [ ] Faster CSS sorting
