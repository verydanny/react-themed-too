import through from 'through'
import pipe from 'multipipe'
import tokenize from 'html-tokenize'

import { contextSecret } from './const'

const createRenderToStream = (
  GlobalContext
) => () => {
  const tokenStream = tokenize()
  let cssInjected = false

  const inlineStream = through(
    function write(thing) {
      let [type, data] = thing
      const { theme } = GlobalContext[ contextSecret ]
      let css = ''

      if (theme && theme.css && !cssInjected) {
        css = theme.css
        
        this.queue(`<style type="text/css">${css}</style>`)
        cssInjected = true
      }

      this.queue(data)
    },
    function end() {
      this.queue(null)
    }
  )

  return pipe(tokenStream, inlineStream)
}

export default createRenderToStream

