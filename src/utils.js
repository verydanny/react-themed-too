export function isServer() {
  return ! (typeof window != 'undefined' && window.document)
}

export const isBrowser = typeof document !== 'undefined'
