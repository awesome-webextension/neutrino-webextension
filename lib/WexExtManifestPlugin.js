const fse = require('fs-extra')
const path = require('path')
const merge = require('deepmerge')
const open = require('open')
const argv = require('yargs-parser')(process.argv.slice(2))

const manifestV3Compilation = require('./manifestV3');
const manifestV2Compilation = require('./manifestV2');

class WexExtManifestPlugin {
  constructor (options, neutrinoOpts) {
    this.options = options
    this.neutrinoOpts = neutrinoOpts
  }

  apply (compiler) {
    compiler.hooks.done.tapPromise(
      'WexExtManifestPlugin',
      async ({ compilation }) => {
        const neutrinoManifest = {
          version: this.neutrinoOpts.packageJson.version
        }

        let commonManifest = {}
        try {
          commonManifest = require(path.join(
            this.options.manifest,
            'common.manifest'
          ))
        } catch(e) {}

        switch (commonManifest.manifest_version) {
          case 3:
            manifestV3Compilation(this, compilation, neutrinoManifest)
            break
          case 2:
          default:
            manifestV2Compilation(this, compilation, neutrinoManifest)
            break
        }

        const browsers = (await fse.readdir(path.join(this.options.manifest)))
          .map(fileName => (fileName.match(/^([^.]+)\.manifest/) || [, ''])[1])
          .filter(browserName => browserName !== 'common')

        const tmpPath = path.join(this.neutrinoOpts.root, '.webext_tmp_v' + commonManifest.manifest_version)
        await fse.remove(tmpPath)
        await fse.move(this.neutrinoOpts.output, tmpPath)

        for (let i = 0; i < browsers.length; i++) {
          // Didn't use Promise.all here because I want
          // to move the last one instead of copying which
          // "I think" might be faster if there are lost of files?
          // Nevertheless, it writes less to the disk this way.
          const browser = browsers[i]
          const browserManifest = require(path.join(
            this.options.manifest,
            `${browser}.manifest`
          ))

          const finalManifest = merge.all([
            neutrinoManifest,
            commonManifest,
            browserManifest
          ])
          
          const output = path.join(this.neutrinoOpts.output, browser)
          if (i !== browsers.length - 1) {
            await fse.copy(tmpPath, output)
          } else {
            await fse.move(tmpPath, output)
          }
          
          if (argv.livereload && finalManifest.manifest_version === 2) {
            // modify manifest before emitting file
            liverreloadModify(finalManifest)
            
            await fse.copy(
              path.join(__dirname, '../livereload'),
              path.join(output, 'livereload')
            )
          }

          await fse.outputJSON(
            path.join(output, 'manifest.json'),
            finalManifest,
            { spaces: '  ' }
          )

          if (this.options.polyfill) {
            const polyfill = await fse.readFile(
              this.options.polyfill,
              'utf8'
            )
            if (polyfill) {
              await fse.outputFile(
                path.join(output, 'assets/browser-polyfill.min.js'),
                this.options.removePolyfillSourcemap
                  ? polyfill.replace('//# sourceMappingURL=browser-polyfill.min.js.map', '')
                  : polyfill
              )
            }
          }
        }
        
        if (argv.livereload) {
          if (typeof argv.livereload === 'string') {
            const app = [argv.livereload]
            if (argv.livereloadargs) {
              app.push(argv.livereloadargs)
            }
            await open(
              'http://neutrino-webextension.reloads',
              { app, background: true }
            )
          } else {
            await open(
              'http://neutrino-webextension.reloads',
              { background: true }
            )
          }
        }
      }
    )
  }
}

module.exports = WexExtManifestPlugin

/** Add livereload related settings */
function liverreloadModify(manifest) {
  if (!manifest.background) {
    manifest.background = {}
  }
  // for webRequestBlocking
  manifest.background.persistent = true

  if (!manifest.background.scripts) {
    manifest.background.scripts = []
  }
  manifest.background.scripts.push('livereload/background.js')
  
  if (!manifest.web_accessible_resources) {
    manifest.web_accessible_resources = []
  }
  manifest.web_accessible_resources.push("livereload/*")
  
  if (!manifest.permissions) {
    manifest.permissions = []
  }
  manifest.permissions = [...new Set([
    ...manifest.permissions,
    "*://neutrino-webextension.reloads/*",
    "webRequest",
    "webRequestBlocking",
    // remove history
    "browsingData"
  ])]
}
