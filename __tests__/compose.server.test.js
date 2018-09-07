/**
 * @jest-environment node
 */

import path from "path"
import nodeEval from "node-eval"

import compiler from '../compiler'
import paths from '../paths'

let cssFile

// Convert this to read multiple css files and scss files
beforeAll(async () => {
  const stats = await compiler(path.resolve(paths.TEST, "css/test.css"))
  const cssFileName = new RegExp("test.css")

  const cssFileModule = stats.toJson().modules.filter(module => {
    if (module.id.match(cssFileName)) {
      return true
    } else {
      return false
    }
  })[0]

  cssFile = nodeEval(cssFileModule.source, "css/test.js")
}, 6000)

test('Webpack basic success', () => {
  expect(cssFile.locals).toBeTruthy()
})

test('Composed theme is equal to cssFile locals', () => {
  import('../src/compose').then(({ default: compose }) => {
    const theme = compose({}, cssFile)
    expect(theme.theme).toEqual(cssFile.locals)
  })
})