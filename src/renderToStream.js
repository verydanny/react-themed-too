import through from 'through'
import pipe from 'multipipe'
import tokenize from 'html-tokenize'

import { contextSecret, contextKey } from './const'

const createRenderToStream = (
  GlobalContext
) => () => {
  const tokenStream = tokenize()
  let globalCssInjected = false

  const inlineStream = through(
    function write(thing) {
      let [type, data] = thing
      const { styles, classCache, inserted, globalCss } = GlobalContext[ contextSecret ]

      if (globalCss !== '' && !globalCssInjected) {
        this.queue(
          `<style data-${contextKey}="globalCss">
            ${ globalCss }
          </style>`
        )

        globalCssInjected = true
      }

      if (type === 'open') {
        let css = ''
        let mediaQueries = ''
        let ids = {}

        let match
        let fragment = data.toString()
        let regex = new RegExp(`${contextKey}--([a-zA-Z0-9-]+)`, 'gm')

        while ((match = regex.exec(fragment)) !== null) {
          if (match !== null && typeof ids[match[1]] === 'undefined') {
            ids[match[1]] = true
          }
        }

        Object.keys(ids).forEach(id => {
          let currentID = classCache[id]
          console.log(classCache)
          if ( styles[currentID] && typeof inserted[id] === 'undefined' && ids[id] === true ) {
            inserted[id] = true
            let styleCss = styles[currentID] && styles[currentID].css && styles[currentID].css.css ? styles[currentID].css.css : false
            let styleQuery = styles[currentID] && styles[currentID].css.mediaQuery ? styles[currentID].css.mediaQuery : false

            css += styleCss
          }
        })

        if (css !== '') {
          this.queue(
            `<style data-${contextKey}="${Object.keys(ids).join(' ')}">
              ${css}
            </style>`
          )
        }
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
