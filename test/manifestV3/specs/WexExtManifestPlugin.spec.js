const WexExtManifestPlugin = require('../../../lib/WexExtManifestPlugin')
const fse = require('fs-extra')
const path = require('path')
const merge = require('deepmerge')

jest.mock('fs-extra')

describe('WexExtManifestPlugin', () => {
  let vfs // virtual file system
  
  beforeEach(() => {
    jest.resetModules()
    
    vfs = {
      'node_modules/webextension-polyfill/dist/browser-polyfill.min.js': 'polyfill'
    }
    
    fse.move.mockImplementation((src, dest) => {
      vfs[dest] = vfs[src]
      vfs[src] = undefined
    })

    fse.copy.mockImplementation((src, dest) => {
      vfs[dest] = vfs[src]
    })

    fse.writeFile.mockImplementation((dest, data) => {
      vfs[dest] = data
    })

    fse.outputFile.mockImplementation((dest, data) => {
      vfs[dest] = data
    })

    fse.writeJson.mockImplementation((dest, json) => {
      vfs[dest] = json
    })

    fse.outputJson.mockImplementation((dest, json) => {
      vfs[dest] = json
    })
  })

  test('should emit correct files with basic setup', async () => {
    const options = {
      polyfill: '/project/polyfill-path',
      template: '/project/template-path',
      manifest: '/project/manifest-path',
      setup: '/project/setup-path'
    }
    
    fse.readFile.mockImplementation(async file => {
      if (file === options.polyfill) {
        return 'polyfill'
      }
    })

    jest.doMock(
      path.resolve(options.manifest, 'common.manifest'),
      () => ({
        manifest_version: 3,
        name: 'name_from_common',
        short_name: 'short_name_from_common',
        description: 'description_from_common'
      }),
      { virtual: true }
    )
    jest.doMock(
      path.resolve(options.manifest, 'chrome.manifest'),
      () => ({
        manifest_version: 3,
        short_name: 'short_name_from_chrome',
        description: 'description_from_chrome'
      }),
      { virtual: true }
    )
    jest.doMock(
      path.resolve(options.manifest, 'firefox.manifest'),
      () => ({
        manifest_version: 3,
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
    
    vfs[neutrinoOpts.output] = 'output'

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
    
    expect(vfs[neutrinoOpts.output]).toBeUndefined()
    expect(vfs[tmpPath]).toBeUndefined()
    
    expect(vfs[path.join(neutrinoOpts.output, 'chrome', 'assets/browser-polyfill.min.js')]).toBe('polyfill')
    expect(vfs[path.join(neutrinoOpts.output, 'firefox', 'assets/browser-polyfill.min.js')]).toBe('polyfill')
    
    expect(vfs[path.join(neutrinoOpts.output, 'chrome')]).toBe('output')
    expect(vfs[path.join(neutrinoOpts.output, 'firefox')]).toBe('output')
    
    expect(vfs[path.join(neutrinoOpts.output, 'chrome/manifest.json')]).toEqual({
      background: {
        service_worker: 'background.js'
      },
      action: {
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
      manifest_version: 3,
      name: 'name_from_common',
      short_name: 'short_name_from_chrome',
      version: '1.0.0'
    })
    
    expect(vfs[path.join(neutrinoOpts.output, 'firefox/manifest.json')]).toEqual({
      background: {
        service_worker: 'background.js'
      },
      action: {
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
      manifest_version: 3,
      name: 'name_from_common',
      short_name: 'short_name_from_common',
      version: '1.0.0'
    })
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
        () => ({ manifest_version: 3 }),
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
    
    vfs[neutrinoOpts.output] = 'output'

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
    
    expect(vfs[neutrinoOpts.output]).toBeUndefined()
    
    expect(vfs[path.join(neutrinoOpts.output, 'chrome')]).toBe('output')
    expect(vfs[path.join(neutrinoOpts.output, 'firefox')]).toBe('output')

    expect(vfs[path.join(neutrinoOpts.output, 'chrome', 'assets/browser-polyfill.min.js')]).toBeUndefined()
    expect(vfs[path.join(neutrinoOpts.output, 'firefox', 'assets/browser-polyfill.min.js')]).toBeUndefined()
    
    expect(vfs[path.join(neutrinoOpts.output, 'chrome/manifest.json')]).toEqual({
      background: {
        service_worker: 'background.js'
      },
      action: {
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
      version: '1.0.0',
      manifest_version: 3
    })
    
    expect(vfs[path.join(neutrinoOpts.output, 'firefox/manifest.json')]).toEqual({
      background: {
        service_worker: 'background.js'
      },
      action: {
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
      version: '1.0.0',
      manifest_version: 3
    })
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
          type: 'action'
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
