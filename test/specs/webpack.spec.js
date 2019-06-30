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
  })

  describe('production', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production'
    })

    describe('snapshots', () => {
      test('entries without polyfill', () => {
        testEntriesSnapshot()
      })

      test('entries with polyfill(should also not be injected)', () => {
        testEntriesSnapshot(true)
      })
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
    source: path.resolve(__dirname, '../src'),
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
