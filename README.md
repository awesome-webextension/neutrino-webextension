## Usage

This middleware is intended to be used with [web](https://github.com/neutrinojs/neutrino/blob/master/packages/web/README.md#preset-options) preset or other Neutrino presets that based on web (e.g [react](https://github.com/neutrinojs/neutrino/blob/master/packages/react/README.md#advanced-configuration)).

This middleware should be placed ***after*** the aforementioned presets.

Example usage:

```javascript
// .neutrinorc.js

module.exports = {
  options: {
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
  },
  use: [
    react(),
    webext({
      polyfill: true
    })
  ]
}
```

## API

### Middleware Options

All options are optional.

- `polyfill`: boolean or string. Default `false`. Generate polyfill related configs. If `true` you should also install the polyfll.
  ```
  yarn add webextension-polyfill
  ```
  If you want to use other polyfill library, provide the path to the polyfill file instead.
- `manifest`: string. Default `<project_root>/src/manifest/`. Extensions' manifests directory.
  - This directory should have at least a `common.manifest.json` and `[browser].manifest.json` (e.g. `firefox.manifest.json`). This middleware will read this directory to get browser names and generate outputs respectively.
- `template`: string. Default [`<neutrino-webextension_root>/template.ejs`](./template.ejs). Path to a special template for html-webpack-plugin. You normally don't have to change this. The html-webpack-plugin can be configured through [web](https://github.com/neutrinojs/neutrino/blob/master/packages/web/README.md#preset-options) preset or other Neutrino presets that based on web (e.g [react](https://github.com/neutrinojs/neutrino/blob/master/packages/react/README.md#advanced-configuration)). If you really need to replace the template, copy [template.ejs](./template.ejs) and make your own.

### Entry Options

WebExtension manifest options `page`, `content`, `background`, `pageless`, `browser_action`, `page_action`, `options_page` and `options_ui` ***SHOULD*** only be configured in `.neutrinorc.js`. This middleware will handle file dependencies for you. If you manually add these fileds in `common.manifest.json` or `[browser].manifest.json`, options may get overwritten.

Specificity: `.neutrinorc.js` < `common.manifest.json` < `[browser].manifest.json`

Options are merged using default [deepmerge](https://www.npmjs.com/package/deepmerge) strategy.

Entry options can be configured through `options.mains.[entry].webext`. All are optional.

- `webext.type`: `'page'` | `'pageless'` | `'content'` | `'background'` | `'browser_action'` | `'page_action'` | `'options_page'` | `'options_ui'`. Default `'page'`.
  - `'page'`: Generate normal output. No manifest configuration.
  - `'pageless'`: Generate normal output without html. No manifest configuration.
  - Others: Generate normal output with or without html. Configure manifest according to the [docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json).
- `webext.manifest`: object. Other manifest options for this field. See example above.

