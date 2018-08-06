const composeCssTheme = (target, mixin) => {
  if (!mixin) return target

  return Object.keys(mixin).reduce((acc, key) => {

    if (mixin.locals) {
      mixin.toCSS = function() {
        return this.map(function(item) {
          const content = item[1] || ''

          if ( item[2] ) {
            return `@media ${ item[2] } { ${ content } }`
          }

          return content
        }).join("")
      }

      acc.css += mixin.toCSS()
    }

    switch (typeof acc[key]) {
      case 'undefined':
        if (mixin[key] !== null && !Array.isArray(mixin[key]) && typeof mixin[key] !== 'function') {
          acc[key] = mixin[key]
        }
        break
      case 'string':
        if (typeof mixin[key] === 'string') {
          acc[key] = [target[key], mixin[key]].filter(x => x).join(' ')
        }
        break
      case 'object':
        if (typeof mixin[key] === 'object') {
          composeCssTheme(acc[key], mixin[key])
        }
        break
      default:
    }

    return acc
  }, target)
}

export default (target = {}, ...themes) => ({
  themed: themes.reduce((acc, curr) => composeCssTheme(acc, curr), target),
  get theme() {
    return this.themed.locals ? this.themed.locals : this.themed
  }
})