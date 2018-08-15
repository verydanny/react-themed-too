## React Themed

Theme management and injection utilizing only css-loader. SSR.

### Guide
- [Installation](#Installation)

### Installation  
`npm install react-themed-too --save-dev`
<br/>  
or  
<br/>
`yarn add react-themed-too -D`

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
