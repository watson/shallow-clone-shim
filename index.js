'use strict'

const getOwnPropertyDescriptors = Object.getOwnPropertyDescriptors || require('get-own-property-descriptors-polyfill')

module.exports = function clone (obj, orig, shim = {}) {
  const descriptors = getOwnPropertyDescriptors(orig)

  for (const name of Object.keys(shim)) {
    descriptors[name] = shim[name](descriptors[name])
  }

  return Object.defineProperties(obj, descriptors)
}
