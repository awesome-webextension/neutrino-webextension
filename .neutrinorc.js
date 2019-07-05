/**
 * For testing only
 */

const standard = require('@neutrinojs/standardjs')
const react = require('@neutrinojs/react')
const copy = require('@neutrinojs/copy')
const webext = require('./lib')

module.exports = {
  options: {
    source: 'test',
    mains: {
      background: {
        entry: 'src/background',
        webext: {
          type: 'background'
        }
      },
      popup: {
        entry: 'src/popup',
        webext: {
          type: 'browser_action'
        }
      },
      content1: {
        entry: 'src/content1',
        webext: {
          type: 'content_scripts',
          setup: 'src/content1/__dev__/setup',
          manifest: {
            matches: ['<all_urls>']
          }
        }
      },
      content2: {
        entry: 'src/content2',
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
  },
  use: [
    standard(),
    react({
      html: {
        title: 'neutrino-webextension'
      }
    }),
    copy({
      patterns: [
        { context: 'assets', from: '**/*', to: 'assets', toType: 'dir' }
      ]
    }),
    webext({
      polyfill: true,
      manifest: 'test/src/manifest',
      setup: 'test/setup'
    })
  ]
}
