'use strict'

const test = require('tape')
const clone = require('./')

const original = Object.defineProperties({ regular: 1 }, {
  nonWritable: {
    value: 2,
    writable: false
  },
  nonConfigurable: {
    configurable: false,
    enumerable: true,
    get: function get () {
      return 3
    }
  },
  nonConfigurableAndEnumerable: {
    configurable: false,
    enumerable: false,
    get: function get () {
      return 4
    }
  }
})

test('original', function (t) {
  assertDefault(original, t)
  t.end()
})

test('shallow copy', function (t) {
  const copy = clone({}, original)

  assertDefault(copy, t)

  copy.regular = 42
  t.equal(copy.regular, 42)

  assertDefault(original, t)

  t.end()
})

test('shim', function (t) {
  const copy = clone({}, original, {
    nonWritable (descriptor) {
      descriptor.value *= 2
      return descriptor
    },
    nonConfigurable (descriptor) {
      const getter = descriptor.get
      descriptor.get = function get () {
        return getter() * 3
      }
      return descriptor
    },
    nonConfigurableAndEnumerable (descriptor) {
      const getter = descriptor.get
      descriptor.get = function get () {
        return getter() * 4
      }
      return descriptor
    }
  })

  assertDefault(original, t)

  t.equal(copy.regular, 1)
  t.equal(copy.nonWritable, 4)
  t.equal(copy.nonConfigurable, 9)
  t.equal(copy.nonConfigurableAndEnumerable, 16)

  t.end()
})

test('shim - change fundamental properties', function (t) {
  const copy = clone({}, original, {
    nonConfigurableAndEnumerable (descriptor) {
      return {
        value: 42,
        writable: true,
        enumerable: true,
        configurable: true
      }
    }
  })

  assertDefault(original, t)

  t.equal(copy.regular, 1)
  t.equal(copy.nonWritable, 2)
  t.equal(copy.nonConfigurable, 3)
  t.equal(copy.nonConfigurableAndEnumerable, 42)

  copy.nonConfigurableAndEnumerable = 'hello'

  t.equal(copy.nonConfigurableAndEnumerable, 'hello')

  t.end()
})

test('prototype pollution via __proto__', function (t) {
  t.notOk(Object.prototype.hasOwnProperty.call({}, '__proto__'), 'new object should not have own property __proto__')

  const original = { ['__proto__']: { foo: 42 } }

  t.ok(Object.prototype.hasOwnProperty.call(original, '__proto__'), 'should have own property __proto__')
  t.deepEqual(original.__proto__, { foo: 42 }) // eslint-disable-line no-proto

  const copy = clone({}, original)

  t.ok(Object.prototype.hasOwnProperty.call(copy, '__proto__'), 'should have own property __proto__')
  t.deepEqual(copy.__proto__, { foo: 42 }) // eslint-disable-line no-proto
  t.equal(Object.prototype.foo, undefined)

  t.end()
})

test('prototype pollution via constructor.prototype', function (t) {
  t.notOk(Object.prototype.hasOwnProperty.call({}, 'constructor'), 'new object should not have own property constructor')

  const original = { constructor: { prototype: { foo: 42 } } }

  t.ok(Object.prototype.hasOwnProperty.call(original, 'constructor'), 'should have own property constructor')
  t.ok(Object.prototype.hasOwnProperty.call(original.constructor, 'prototype'), 'should have own property constructor.prototype')
  t.equal(original.constructor, original.constructor)

  const copy = clone({}, original)

  t.ok(Object.prototype.hasOwnProperty.call(copy, 'constructor'), 'should have own property constructor')
  t.ok(Object.prototype.hasOwnProperty.call(copy.constructor, 'prototype'), 'should have own property constructor.prototype')
  t.equal(copy.constructor, original.constructor)
  t.equal(Object.prototype.foo, undefined)

  t.end()
})

function assertDefault (obj, t) {
  t.equal(obj.regular, 1, 'should have original value for `regular`')
  t.equal(obj.nonWritable, 2, 'should have original value for `nonWritable`')
  t.equal(obj.nonConfigurable, 3, 'should have original value for `nonConfigurable`')
  t.equal(obj.nonConfigurableAndEnumerable, 4, 'should have original value for `nonConfigurableAndEnumerable`')
}
