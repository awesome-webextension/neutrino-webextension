# neutrino-webextension

Neutrino 9 preset for WebExtension development which supports framework devtools.

## Features

- Zero upfront configuration necessary to start developing and building a WebExtension.
- Run development mode in a fake WebExtension environment which supports hot reload and framework devtools.
- Webpack chunks are translated into manifest configs nicely.
- Outputs are bundled for each browser respectively, with different manifest.
- Works well with other official Neutrino presets.

## Requirements

- Node.js ^8.10 or 10+
- Yarn v1.2.1+, or npm v5.4+
- Neutrino 9
- webpack 4
- webpack-cli 3
- webpack-dev-server 3
- sinon-chrome >=2 (for fake environment and testing)
- webextension-polyfill latest (optional, for Chrome)

## Installation

Yarn

```
❯ yarn add --dev neutrino-webextension sinon-chrome webextension-polyfill
```

Npm

```
❯ npm install --save-dev neutrino-webextension sinon-chrome webextension-polyfill
```

`webextension-polyfill` is optional.


## Project Layout

This preset follows the standard [project layout](https://neutrinojs.org/project-layout/) specified by Neutrino. This means that by default all project source code should live in a directory named `src` in the root of the project. This includes JavaScript files, CSS stylesheets, images, and any other assets that would be available to your compiled project.

`src/manifest/` is the default manifest directory. See explanations below.

```
src/manifest/
├── chrome.manifest.json
├── common.manifest.json
└── firefox.manifest.json
```

Add this preset and your entries in `.neutrinorc.js`. Example:

```javascript
const react = require('@neutrinojs/react')
const webext = require('neutrino-webextension')

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
          type: 'browser_action',
          manifest: {
            browser_style: false,
            default_title: 'My Popup Page'
          }
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

This preset is designed to work with [eslint](https://github.com/neutrinojs/neutrino/blob/master/packages/eslint/README.md) preset and [web](https://github.com/neutrinojs/neutrino/blob/master/packages/web/README.md#preset-options) preset or other Neutrino presets that are based on eslint or web (e.g. [standardjs](https://github.com/neutrinojs/neutrino/blob/master/packages/standardjs/README.md) or [react](https://github.com/neutrinojs/neutrino/blob/master/packages/react/README.md#advanced-configuration)).

This preset should be placed ***after*** all other presets.


### Development

```
yarn start
```

Or to jump to a specific entry:

```
yarn start --open-page [entry name].html
```

Or just keep one entry for faster bundling:

```
yarn start --wextentry [entry name]
```


## Preset Options

All options are optional.

- `polyfill`: boolean. Default `false`. Generate polyfill related configs. If `true` you should also install the polyfll.
  ```
  yarn add webextension-polyfill
  ```
- `manifest`: string. Default `'<project_root>/src/manifest/'`. Extensions' manifests directory.
  - This directory should have at least a `common.manifest.json` and `[browser].manifest.json` (e.g. `firefox.manifest.json`). This preset will read this directory to get browser names and generate outputs respectively.
- `template`: string. Default [`<neutrino-webextension_root>/template.ejs`](./template.ejs). Path to a special template for html-webpack-plugin. You normally don't have to change this. The html-webpack-plugin can be configured through [web](https://github.com/neutrinojs/neutrino/blob/master/packages/web/README.md#preset-options) preset or other Neutrino presets that based on web (e.g [react](https://github.com/neutrinojs/neutrino/blob/master/packages/react/README.md#advanced-configuration)). If you really need to replace the template, copy [template.ejs](./template.ejs) and make your own.

## Entry Options

WebExtension manifest options `page`, `content_scripts`, `background`, `pageless`, `browser_action`, `page_action`, `options_page` and `options_ui` ***SHOULD*** only be configured in `.neutrinorc.js`. This preset will handle file dependencies for you. If you manually add these fileds in `common.manifest.json` or `[browser].manifest.json`, options may get overwritten.

Specificity: `.neutrinorc.js` < `common.manifest.json` < `[browser].manifest.json`

Options are merged using default [deepmerge](https://www.npmjs.com/package/deepmerge) strategy.

Entry options can be configured through `options.mains.[entry].webext`. All are optional.

- `webext.type`: `'page'` | `'pageless'` | `'content_scripts'` | `'background'` | `'browser_action'` | `'page_action'` | `'options_page'` | `'options_ui'`. Default `'page'`.
  - `'page'`: Generate normal output. No manifest configuration.
  - `'pageless'`: Generate normal output without html. No manifest configuration.
  - Others: Generate normal output with or without html. Configure manifest according to the [docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json).
  - Except `'page'`, `'pageless'` and `'content_scripts'` other entry types should be one and only.
- `webext.manifest`: object. Other manifest options for this field. See example above.
