function manifestV2Compilation(parent, compilation, neutrinoManifest) {
    compilation.entrypoints.forEach((entry, name) => {
        const htmlPluginOpts = parent.neutrinoOpts.mains[name]
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
              if (parent.options.polyfill) {
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
              if (parent.options.polyfill) {
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
}

module.exports = manifestV2Compilation;