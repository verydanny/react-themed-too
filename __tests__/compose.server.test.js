/**
 * @jest-environment node
 */

import path from "path"
import nodeEval from "node-eval"

import compiler from "../compiler"
import paths from "../paths"

let cssFileServer
let cssFileBrowser

let cssServer = {}
let cssBrowser = {}

async function singleFileCompose() {
  const statsBrowser = await compiler(
    path.resolve(paths.TEST, "css/test.css"),
    {
      browser: true
    }
  )
  const statsServer = await compiler(
    path.resolve(paths.TEST, "css/test.css"),
    {
      browser: false
    }
  )

  const cssFileName = new RegExp("test.css")

  const cssFileModuleBrowser = statsBrowser
    .toJson()
    .modules.filter(module => {
      if (module.id.match(cssFileName)) {
        return true
      } else {
        return false
      }
    })[0]

  const cssFileModuleServer = statsServer.toJson().modules.filter(module => {
    if (module.id.match(cssFileName)) {
      return true
    } else {
      return false
    }
  })[0]

  cssFileBrowser = nodeEval(cssFileModuleBrowser.source, "css/test.js")
  cssFileServer = nodeEval(cssFileModuleServer.source, "css/test.js")
}

async function multiFileCompose() {
  // read css dir sync
  // get paths of all css
  // process through async compile function
  // add result to cssServer/Browser object
}

// Convert this to read multiple css files and scss files
beforeAll(async () => {
  await singleFileCompose()
}, 6000)

test("Webpack basic browser success", () => {
  expect(cssFileBrowser).toBeTruthy()
})

test("Webpack basic server success", () => {
  expect(cssFileServer.locals).toBeTruthy()
})

test("Composed theme is equal to server locals", () => {
  import("../src/compose").then(({ default: compose }) => {
    const theme = compose(
      {},
      cssFileServer
    )
    expect(theme.theme).toEqual(cssFileServer.locals)
  })
})

test("Composed theme is equal to browser locals", () => {
  import("../src/compose").then(({ default: compose }) => {
    const theme = compose(
      {},
      cssFileServer
    )
    expect(theme.theme).toEqual(cssFileBrowser)
  })
})
