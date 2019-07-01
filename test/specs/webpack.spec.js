const path = require('path')
const _ = require('lodash')
const Neutrino = require('neutrino/Neutrino')
const react = require('@neutrinojs/react')
const webext = require('../../lib')

describe('webpack', () => {
  const NODE_ENV = process.env.NODE_ENV
  afterAll(() => {
    process.env.NODE_ENV = NODE_ENV
  })

  describe('development', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development'
    })

    describe('snapshots', () => {
      test('entries without polyfill', () => {
        testEntriesSnapshot()
      })

      test('entries with polyfill', () => {
        testEntriesSnapshot(true)
      })
    })

    test('should not have webext plugin', () => {
      const neutrino = new Neutrino(optionsFixture())
      neutrino.use(react())
      neutrino.use(webext())
      expect(neutrino.config.plugins.has('webext')).toBeFalsy()
    })

    test('should add global and entry setup files', () => {
      const neutrino = new Neutrino({
        root: '/project',
        source: '/project/src',
        mains: {
          index: {
            entry: 'index',
            webext: {
              type: 'browser_action',
              setup: '/entry-setup-path'
            }
          }
        }
      })
      neutrino.use(react())
      neutrino.use(
        webext({
          setup: '/global-setup-path'
        })
      )
      expect(neutrino.config.entry('index').values()).toMatchSnapshot()
    })

    test('should resolve relative setup path', () => {
      const neutrino = new Neutrino({
        root: '/project',
        source: '/project/src',
        mains: {
          index: {
            entry: 'index',
            webext: {
              type: 'browser_action',
              setup: 'entry-setup-path'
            }
          }
        }
      })
      neutrino.use(react())
      neutrino.use(
        webext({
          setup: 'global-setup-path'
        })
      )
      expect(neutrino.config.entry('index').values()).toMatchSnapshot()
    })

    describe('wextentry cli option', () => {
      test('other entries except background should be removed', () => {
        const bakArgv = process.argv
        process.argv = ['yarn', 'start', '--wextentry', 'popup']
        const neutrino = new Neutrino(optionsFixture())
        neutrino.use(react())
        neutrino.use(webext())
        expect(neutrino.config.entryPoints.has('background')).toBeTruthy()
        expect(neutrino.config.entryPoints.has('popup')).toBeTruthy()
        expect(neutrino.config.plugins.has('html-popup')).toBeTruthy()
        expect(neutrino.config.entryPoints.has('page')).toBeFalsy()
        expect(neutrino.config.plugins.has('html-page')).toBeFalsy()
        expect(neutrino.config.entryPoints.has('pageless')).toBeFalsy()
        expect(neutrino.config.plugins.has('html-pageless')).toBeFalsy()
        expect(neutrino.config.entryPoints.has('content1')).toBeFalsy()
        expect(neutrino.config.plugins.has('html-content1')).toBeFalsy()
        expect(neutrino.config.entryPoints.has('content2')).toBeFalsy()
        expect(neutrino.config.plugins.has('html-content2')).toBeFalsy()

        process.argv = bakArgv
      })
    })
  })

  describe('production', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production'
    })

    describe('snapshots', () => {
      test('entries without polyfill(should not be injected)', () => {
        testEntriesSnapshot()
      })

      test('entries with polyfill(should also not be injected)', () => {
        testEntriesSnapshot(true)
      })
    })

    test('should have webext plugin', () => {
      const neutrino = new Neutrino(optionsFixture())
      neutrino.use(react())
      neutrino.use(webext())
      expect(neutrino.config.plugins.has('webext')).toBeTruthy()
    })

    test('should not inject polyfill if polyfill options is off', () => {
      const neutrino = new Neutrino(optionsFixture())
      neutrino.use(react())
      neutrino.use(webext())
      expect(neutrino.config.plugins.has('html-background')).toBeFalsy()
      expect(neutrino.config.plugins.has('html-pageless')).toBeFalsy()
      expect(neutrino.config.plugins.has('html-content1')).toBeFalsy()
      expect(neutrino.config.plugins.has('html-content2')).toBeFalsy()
    })

    test('should inject polyfill if polyfill options is on', () => {
      const neutrino = new Neutrino(optionsFixture())
      neutrino.use(react())
      neutrino.use(
        webext({
          polyfill: 'polyfill-path',
          template: 'template-path'
        })
      )
      expect(neutrino.config.plugins.has('html-background')).toBeFalsy()
      expect(neutrino.config.plugins.has('html-pageless')).toBeFalsy()
      expect(neutrino.config.plugins.has('html-content1')).toBeFalsy()
      expect(neutrino.config.plugins.has('html-content2')).toBeFalsy()
    })
  })
})

function testEntriesSnapshot (polyfill) {
  const neutrino = new Neutrino(optionsFixture())
  neutrino.use(react())
  neutrino.use(polyfill ? webext({ polyfill: true }) : webext())
  expect(
    _.mapValues(neutrino.config.entryPoints.entries(), entry => {
      return entry.values()
    })
  ).toMatchSnapshot()
}

function optionsFixture () {
  return {
    root: '/project',
    source: '/project/src',
    mains: {
      background: {
        entry: 'background',
        webext: {
          type: 'background'
        }
      },
      popup: {
        entry: 'popup',
        webext: {
          type: 'browser_action'
        }
      },
      page: {
        entry: 'page',
        webext: {
          type: 'page'
        }
      },
      pageless: {
        entry: 'pageless',
        webext: {
          type: 'pageless'
        }
      },
      content1: {
        entry: 'content1',
        webext: {
          type: 'content_scripts',
          setup: 'content1/__dev__/setup',
          manifest: {
            matches: ['<all_urls>']
          }
        }
      },
      content2: {
        entry: 'content2',
        webext: {
          type: 'content_scripts',
          manifest: {
            matches: ['https://github.com/crimx/neutrino-webextension'],
            run_at: 'document_start',
            match_about_blank: true,
            all_frames: true
          }
        }
      }
    }
  }
}
