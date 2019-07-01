const standard = require('@neutrinojs/standardjs')
const react = require('@neutrinojs/react')
const webext = require('../../lib')
const neutrino = require('neutrino')

describe('eslintrc', () => {
  test('should add browser global if globals field exists', () => {
    expect(
      neutrino({
        use: [standard(), react(), webext()]
      }).eslintrc().globals.browser
    ).toBeTruthy()
  })

  test('should add browser global if globals field does no exist', () => {
    const middleware = neutrino => {
      neutrino.config.module
        .rule('lint')
        .use('eslint')
        .tap(options => {
          options.globals = ['aGlobal']
          return options
        })
    }
    expect(
      neutrino({
        use: [standard(), react(), middleware, webext()]
      }).eslintrc().globals.browser
    ).toBeTruthy()
  })
})
