import path from 'path'
import webpack from 'webpack'
import memoryfs from 'memory-fs'
import { webpackIdentity } from './src/const'

export default (fixture, options = {}) => {
  const compiler = webpack({
    mode: 'development',
    entry: `${fixture}`,
    output: {
      path: path.resolve(__dirname),
      filename: 'bundle.js',
    },
    resolve: {
      modules: [path.resolve(__dirname, 'node_modules')]
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: {
            loader: 'css-loader',
            options: {
              modules: true,
              camelCase: true,
              localIdentName: webpackIdentity,
            }
          }
        }
      ]
    }
  })

  compiler.outputFileSystem = new memoryfs()

  return new Promise(( resolve, reject ) => {
    compiler.run((err, stats) => {
      if (err || stats.hasErrors()) reject(err)

      return resolve(stats)
    })
  })
}