const WexExtManifestPlugin = require('../../lib/WexExtManifestPlugin')
const fse = require('fs-extra')
const path = require('path')
const merge = require('deepmerge')

jest.mock('fs-extra')

describe('WexExtManifestPlugin', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  test('should emit correct files with basic setup', async () => {
    const options = {
      polyfill: '/project/polyfill-path',
      template: '/project/template-path',
      manifest: '/project/manifest-path',
      setup: '/project/setup-path'
    }

    jest.doMock(
      path.resolve(options.manifest, 'common.manifest'),
      () => ({
        mainfest_version: 2,
        name: 'name_from_common',
        short_name: 'short_name_from_common',
        description: 'description_from_common'
      }),
      { virtual: true }
    )
    jest.doMock(
      path.resolve(options.manifest, 'chrome.manifest'),
      () => ({
        mainfest_version: 2,
        short_name: 'short_name_from_chrome',
        description: 'description_from_chrome',
        background: {
          persistent: false
        }
      }),
      { virtual: true }
    )
    jest.doMock(
      path.resolve(options.manifest, 'firefox.manifest'),
      () => ({
        mainfest_version: 2,
        description: 'description_from_firefox'
      }),
      { virtual: true }
    )

    fse.readdir.mockResolvedValue([
      'chrome.manifest.json',
      'common.manifest.json',
      'firefox.manifest.json'
    ])

    const neutrinoOpts = merge(optionsFixture(), {
      mains: {
        options_page: {
          entry: 'options_page',
          webext: {
            type: 'options_page'
          }
        }
      }
    })

    const entries = [
      ['background', ['common.js', 'background.js']],
      ['popup', ['common.js', 'popup.js', 'popup.css']],
      ['page', ['common.js', 'pa  ge.js']],
      ['pageless', ['common.js', 'pageless.js']],
      ['content1', ['common.js', 'content1.js']],
      ['content2', ['common.js', 'content2.js']],
      ['other_script', ['common.js', 'other_script.js']],
      ['options_page', ['common.js', 'options_page.js', 'options_page.css']]
    ]

    await callPlugin(options, neutrinoOpts, entries)

    const tmpPath = path.join(neutrinoOpts.output, '../.webext_tmp')

    expect(fse.copy).toHaveBeenCalledWith(
      tmpPath,
      path.join(neutrinoOpts.output, 'chrome')
    )
    expect(fse.copy).toHaveBeenCalledWith(
      options.polyfill,
      path.join(neutrinoOpts.output, 'chrome/assets/browser-polyfill.min.js')
    )
    expect(fse.copy).toHaveBeenCalledWith(
      options.polyfill,
      path.join(neutrinoOpts.output, 'firefox/assets/browser-polyfill.min.js')
    )

    expect(fse.move).toHaveBeenCalledWith(
      tmpPath,
      path.join(neutrinoOpts.output, 'firefox')
    )

    expect(fse.writeJson).toHaveBeenCalledTimes(2)
    expect(fse.writeJson).toHaveBeenCalledWith(
      path.join(neutrinoOpts.output, 'chrome/manifest.json'),
      {
        background: {
          persistent: false,
          scripts: [
            'assets/browser-polyfill.min.js',
            'common.js',
            'background.js'
          ]
        },
        browser_action: {
          default_popup: 'popup.html'
        },
        content_scripts: [
          {
            js: ['assets/browser-polyfill.min.js', 'common.js', 'content1.js'],
            matches: ['<all_urls>']
          },
          {
            all_frames: true,
            js: ['assets/browser-polyfill.min.js', 'common.js', 'content2.js'],
            match_about_blank: true,
            matches: ['https://github.com/crimx/neutrino-webextension'],
            run_at: 'document_start'
          }
        ],
        options_page: 'options_page.html',
        description: 'description_from_chrome',
        mainfest_version: 2,
        name: 'name_from_common',
        short_name: 'short_name_from_chrome',
        version: '1.0.0'
      },
      expect.anything()
    )
    expect(fse.writeJson).toHaveBeenCalledWith(
      path.join(neutrinoOpts.output, 'firefox/manifest.json'),
      {
        background: {
          scripts: [
            'assets/browser-polyfill.min.js',
            'common.js',
            'background.js'
          ]
        },
        browser_action: {
          default_popup: 'popup.html'
        },
        content_scripts: [
          {
            js: ['assets/browser-polyfill.min.js', 'common.js', 'content1.js'],
            matches: ['<all_urls>']
          },
          {
            all_frames: true,
            js: ['assets/browser-polyfill.min.js', 'common.js', 'content2.js'],
            match_about_blank: true,
            matches: ['https://github.com/crimx/neutrino-webextension'],
            run_at: 'document_start'
          }
        ],
        options_page: 'options_page.html',
        description: 'description_from_firefox',
        mainfest_version: 2,
        name: 'name_from_common',
        short_name: 'short_name_from_common',
        version: '1.0.0'
      },
      expect.anything()
    )
  })

  test('should not add polyfill if not enabled', async () => {
    const options = {
      template: '/project/template-path',
      manifest: '/project/manifest-path',
      setup: '/project/setup-path'
    }

    ;['common', 'chrome', 'firefox'].forEach(name => {
      jest.doMock(
        path.resolve(options.manifest, `${name}.manifest`),
        () => ({}),
        {
          virtual: true
        }
      )
    })

    fse.readdir.mockResolvedValue([
      'chrome.manifest.json',
      'common.manifest.json',
      'firefox.manifest.json'
    ])

    const neutrinoOpts = merge(optionsFixture(), {
      mains: {
        options_ui: {
          entry: 'options_ui',
          webext: {
            type: 'options_ui'
          }
        }
      }
    })

    const entries = [
      ['background', ['common.js', 'background.js']],
      ['popup', ['common.js', 'popup.js', 'popup.css']],
      ['page', ['common.js', 'page.js']],
      ['pageless', ['common.js', 'pageless.js']],
      ['content1', ['content1.css']],
      ['content2', ['common.js', 'content2.js']],
      ['other_script', ['common.js', 'other_script.js']],
      ['options_ui', ['common.js', 'options_ui.js', 'options_ui.css']]
    ]

    await callPlugin(options, neutrinoOpts, entries)

    expect(fse.copy).not.toHaveBeenCalledWith(
      options.polyfill,
      path.join(neutrinoOpts.output, 'chrome/assets/browser-polyfill.min.js')
    )
    expect(fse.copy).not.toHaveBeenCalledWith(
      options.polyfill,
      path.join(neutrinoOpts.output, 'firefox/assets/browser-polyfill.min.js')
    )

    expect(fse.writeJson).toHaveBeenCalledWith(
      path.join(neutrinoOpts.output, 'chrome/manifest.json'),
      {
        background: {
          scripts: ['common.js', 'background.js']
        },
        browser_action: {
          default_popup: 'popup.html'
        },
        content_scripts: [
          {
            css: ['content1.css'],
            matches: ['<all_urls>']
          },
          {
            all_frames: true,
            js: ['common.js', 'content2.js'],
            match_about_blank: true,
            matches: ['https://github.com/crimx/neutrino-webextension'],
            run_at: 'document_start'
          }
        ],
        options_ui: {
          page: 'options_ui.html'
        },
        version: '1.0.0'
      },
      expect.anything()
    )

    expect(fse.writeJson).toHaveBeenCalledWith(
      path.join(neutrinoOpts.output, 'firefox/manifest.json'),
      {
        background: {
          scripts: ['common.js', 'background.js']
        },
        browser_action: {
          default_popup: 'popup.html'
        },
        content_scripts: [
          {
            css: ['content1.css'],
            matches: ['<all_urls>']
          },
          {
            all_frames: true,
            js: ['common.js', 'content2.js'],
            match_about_blank: true,
            matches: ['https://github.com/crimx/neutrino-webextension'],
            run_at: 'document_start'
          }
        ],
        options_ui: {
          page: 'options_ui.html'
        },
        version: '1.0.0'
      },
      expect.anything()
    )
  })
})

function callPlugin (options, neutrinoOpts, entries) {
  const plugin = new WexExtManifestPlugin(options, neutrinoOpts)

  let callback
  plugin.apply({
    hooks: {
      done: {
        tapPromise: (name, cb) => {
          callback = cb
        }
      }
    }
  })

  return callback({
    compilation: {
      entrypoints: {
        forEach: cb => {
          for (const [name, entry] of entries) {
            cb({ getFiles: () => entry }, name)
          }
        }
      }
    }
  })
}

function optionsFixture () {
  return {
    packageJson: {
      version: '1.0.0'
    },
    root: '/project',
    source: '/project/src',
    output: '/project/output',
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
      },
      other_script: {
        entry: 'other_script'
      }
    }
  }
}
