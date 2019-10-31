'use strict'

module.exports = function clone (obj, orig, shim = {}) {
  const proto = Object.getOwnPropertyDescriptor(orig, '__proto__')
  const descriptors = proto ? { ['__proto__']: proto } : {}

  for (const name of Object.getOwnPropertyNames(orig)) {
    descriptors[name] = Object.getOwnPropertyDescriptor(orig, name)
  }

  for (const name of Object.keys(shim)) {
    descriptors[name] = shim[name](descriptors[name])
  }

  return Object.defineProperties(obj, descriptors)
}
