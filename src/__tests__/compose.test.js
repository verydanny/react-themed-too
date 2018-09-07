import path from "path"
import nodeEval from "node-eval"

import compiler from '../../compiler'
import paths from '../../paths'

test('Testing basic CSS conversion', async () => {
  const stats = await compiler(path.resolve(paths.TEST, 'css/test.css'))
  const cssFileName = new RegExp('test.css')

  const cssFileModule = stats.toJson().modules.filter(( module ) => {
    if ( module.id.match(cssFileName) ) {
      return true
    } else {
      return false
    }
  })[0]
  
  const cssFile = nodeEval(cssFileModule.source, 'css/test.js')
})