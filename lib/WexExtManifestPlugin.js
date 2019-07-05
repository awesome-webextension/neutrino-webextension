const fse = require('fs-extra')
const path = require('path')
const merge = require('deepmerge')

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

        compilation.entrypoints.forEach((entry, name) => {
          const htmlPluginOpts = this.neutrinoOpts.mains[name]
          const entryOpts = htmlPluginOpts.webext
          if (!entryOpts) {
            return
          }

          switch (entryOpts.type) {
            case 'content_scripts':
              {
                if (!neutrinoManifest.content_scripts) {
                  neutrinoManifest.content_scripts = []
                }

                const files = entry
                  .getFiles()
                  .map(file => file.replace(/\.(css|js)\?.*$/, '.$1'))
                const js = files.filter(file => file.endsWith('.js'))
                const css = files.filter(file => file.endsWith('.css'))
                const opt = {
                  ...(entryOpts.manifest || {})
                }
                if (this.options.polyfill) {
                  js.unshift('assets/browser-polyfill.min.js')
                }
                if (js.length > 0) {
                  opt.js = opt.js ? [...js, ...opt.js] : js
                }
                if (css.length > 0) {
                  opt.css = opt.css ? [...css, ...opt.css] : css
                }
                neutrinoManifest.content_scripts.push(opt)
              }
              break
            case 'background':
              {
                const scripts = entry
                  .getFiles()
                  .map(file => file.replace(/\.js\?.*$/, '.$1'))
                  .filter(file => file.endsWith('.js'))
                if (this.options.polyfill) {
                  scripts.unshift('assets/browser-polyfill.min.js')
                }
                neutrinoManifest[entryOpts.type] = {
                  scripts,
                  ...(entryOpts.manifest || {})
                }
              }
              break
            case 'browser_action':
            case 'page_action':
              neutrinoManifest[entryOpts.type] = {
                default_popup: htmlPluginOpts.filename || `${name}.html`,
                ...(entryOpts.manifest || {})
              }
              break
            case 'options_page':
              neutrinoManifest[entryOpts.type] =
                htmlPluginOpts.filename || `${name}.html`
              break
            case 'options_ui':
              neutrinoManifest[entryOpts.type] = {
                page: htmlPluginOpts.filename || `${name}.html`,
                ...(entryOpts.manifest || {})
              }
              break
            default:
              break
          }
        })

        const commonManifest = require(path.join(
          this.options.manifest,
          'common.manifest'
        ))

        const browsers = (await fse.readdir(path.join(this.options.manifest)))
          .map(fileName => (fileName.match(/^([^.]+)\.manifest/) || [, ''])[1])
          .filter(browserName => browserName !== 'common')

        const tmpPath = path.join(this.neutrinoOpts.root, '.webext_tmp')
        await fse.ensureDir(this.neutrinoOpts.output)
        await fse.emptyDir(this.neutrinoOpts.output)

        await Promise.all(
          browsers.map(async browser => {
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
            await fse.emptyDir(output)
            await fse.copy(tmpPath, output)

            await fse.writeJson(
              path.join(output, 'manifest.json'),
              finalManifest,
              { spaces: '  ' }
            )

            if (this.options.polyfill) {
              await fse.copy(
                this.options.polyfill,
                path.join(output, 'assets/browser-polyfill.min.js')
              )
            }
          })
        )

        await fse.remove(tmpPath)
      }
    )
  }
}

module.exports = WexExtManifestPlugin
