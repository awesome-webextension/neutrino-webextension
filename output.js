yarn run v1.16.0
$ /home/crimx/code/neutrino-webextension/node_modules/.bin/neutrino --inspect --mode development
{
  mode: 'development',
  devtool: 'cheap-module-eval-source-map',
  target: 'web',
  context: '/home/crimx/code/neutrino-webextension',
  stats: {
    children: false,
    entrypoints: false,
    modules: false
  },
  node: {
    Buffer: false,
    fs: 'empty',
    tls: 'empty'
  },
  output: {
    path: '/home/crimx/code/neutrino-webextension/build',
    publicPath: '/',
    filename: 'assets/[name].js'
  },
  resolve: {
    alias: {
      'react-native': 'react-native-web'
    },
    extensions: [
      '.web.jsx',
      '.web.js',
      '.wasm',
      '.mjs',
      '.jsx',
      '.js',
      '.json'
    ]
  },
  devServer: {
    port: 5000,
    hot: true,
    historyApiFallback: true,
    overlay: true,
    stats: {
      all: false,
      errors: true,
      timings: true,
      warnings: true
    },
    index: 'popup.html'
  },
  module: {
    rules: [
      /* neutrino.config.module.rule('lint') */
      {
        test: /\.(mjs|jsx|js)$/,
        enforce: 'pre',
        include: [
          '/home/crimx/code/neutrino-webextension/test'
        ],
        use: [
          /* neutrino.config.module.rule('lint').use('eslint') */
          {
            loader: '/home/crimx/code/neutrino-webextension/node_modules/eslint-loader/index.js',
            options: {
              cache: true,
              cwd: '/home/crimx/code/neutrino-webextension',
              emitWarning: true,
              failOnError: false,
              formatter: '/home/crimx/code/neutrino-webextension/node_modules/eslint/lib/formatters/codeframe.js',
              useEslintrc: false,
              baseConfig: {
                env: {
                  es6: true,
                  browser: true,
                  commonjs: true,
                  mocha: true
                },
                'extends': [
                  '/home/crimx/code/neutrino-webextension/node_modules/eslint-config-standard/index.js',
                  '/home/crimx/code/neutrino-webextension/node_modules/eslint-config-standard-jsx/index.js'
                ],
                globals: {
                  process: true
                },
                overrides: [],
                parser: '/home/crimx/code/neutrino-webextension/node_modules/babel-eslint/lib/index.js',
                parserOptions: {
                  ecmaVersion: 2018,
                  sourceType: 'module'
                },
                plugins: [
                  'babel',
                  'standard',
                  'react',
                  'react-hooks'
                ],
                root: true,
                settings: {
                  react: {
                    version: '999.999.999'
                  }
                },
                rules: {
                  'new-cap': 'off',
                  'no-invalid-this': 'off',
                  'object-curly-spacing': 'off',
                  semi: 'off',
                  'no-unused-expressions': 'off',
                  'babel/new-cap': [
                    'error',
                    {
                      newIsCap: true,
                      capIsNew: false
                    }
                  ],
                  'babel/no-invalid-this': 'off',
                  'babel/object-curly-spacing': [
                    'error',
                    'always'
                  ],
                  'babel/semi': [
                    'error',
                    'never'
                  ],
                  'babel/no-unused-expressions': [
                    'error',
                    {
                      allowShortCircuit: true,
                      allowTernary: true,
                      allowTaggedTemplates: true
                    }
                  ],
                  'react-hooks/rules-of-hooks': 'error',
                  'react-hooks/exhaustive-deps': 'warn'
                }
              },
              globals: [
                'browser'
              ]
            }
          }
        ]
      },
      /* neutrino.config.module.rule('html') */
      {
        test: /\.html$/,
        use: [
          /* neutrino.config.module.rule('html').use('html') */
          {
            loader: '/home/crimx/code/neutrino-webextension/node_modules/html-loader/index.js',
            options: {
              attrs: [
                'img:src',
                'link:href'
              ]
            }
          }
        ]
      },
      /* neutrino.config.module.rule('compile') */
      {
        test: /\.(mjs|jsx|js)$/,
        include: [
          '/home/crimx/code/neutrino-webextension/test'
        ],
        use: [
          /* neutrino.config.module.rule('compile').use('babel') */
          {
            loader: '/home/crimx/code/neutrino-webextension/node_modules/babel-loader/lib/index.js',
            options: {
              cacheDirectory: true,
              babelrc: false,
              configFile: false,
              presets: [
                [
                  '/home/crimx/code/neutrino-webextension/node_modules/@babel/preset-env/lib/index.js',
                  {
                    debug: false,
                    useBuiltIns: false,
                    targets: {
                      browsers: [
                        'last 2 Chrome versions',
                        'last 2 Firefox versions',
                        'last 2 Edge versions',
                        'last 2 Opera versions',
                        'last 2 Safari versions',
                        'last 2 iOS versions'
                      ]
                    }
                  }
                ],
                [
                  '/home/crimx/code/neutrino-webextension/node_modules/@babel/preset-react/lib/index.js',
                  {
                    development: true,
                    useBuiltIns: true
                  }
                ]
              ],
              plugins: [
                '/home/crimx/code/neutrino-webextension/node_modules/@babel/plugin-syntax-dynamic-import/lib/index.js',
                '/home/crimx/code/neutrino-webextension/node_modules/react-hot-loader/babel.js',
                [
                  '/home/crimx/code/neutrino-webextension/node_modules/@babel/plugin-proposal-class-properties/lib/index.js',
                  {
                    loose: true
                  }
                ]
              ]
            }
          }
        ]
      },
      /* neutrino.config.module.rule('style') */
      {
        oneOf: [
          /* neutrino.config.module.rule('style').oneOf('modules') */
          {
            test: /\.module\.css$/,
            use: [
              /* neutrino.config.module.rule('style').oneOf('modules').use('style') */
              {
                loader: '/home/crimx/code/neutrino-webextension/node_modules/style-loader/index.js'
              },
              /* neutrino.config.module.rule('style').oneOf('modules').use('css') */
              {
                loader: '/home/crimx/code/neutrino-webextension/node_modules/css-loader/dist/cjs.js',
                options: {
                  importLoaders: 0,
                  modules: true
                }
              }
            ]
          },
          /* neutrino.config.module.rule('style').oneOf('normal') */
          {
            test: /\.css$/,
            use: [
              /* neutrino.config.module.rule('style').oneOf('normal').use('style') */
              {
                loader: '/home/crimx/code/neutrino-webextension/node_modules/style-loader/index.js'
              },
              /* neutrino.config.module.rule('style').oneOf('normal').use('css') */
              {
                loader: '/home/crimx/code/neutrino-webextension/node_modules/css-loader/dist/cjs.js',
                options: {
                  importLoaders: 0
                }
              }
            ]
          }
        ]
      },
      /* neutrino.config.module.rule('font') */
      {
        test: /\.(eot|ttf|woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          /* neutrino.config.module.rule('font').use('file') */
          {
            loader: '/home/crimx/code/neutrino-webextension/node_modules/file-loader/dist/cjs.js',
            options: {
              name: 'assets/[name].[ext]'
            }
          }
        ]
      },
      /* neutrino.config.module.rule('image') */
      {
        test: /\.(ico|png|jpg|jpeg|gif|svg|webp)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          /* neutrino.config.module.rule('image').use('url') */
          {
            loader: '/home/crimx/code/neutrino-webextension/node_modules/url-loader/dist/cjs.js',
            options: {
              limit: 8192,
              name: 'assets/[name].[ext]'
            }
          }
        ]
      }
    ]
  },
  plugins: [
    /* neutrino.config.plugin('html-popup') */
    new (require('/home/crimx/code/neutrino-webextension/node_modules/html-webpack-plugin/index.js'))(
      {
        template: '/home/crimx/code/neutrino-webextension/template.dev.ejs',
        appMountId: 'root',
        lang: 'en',
        meta: {
          viewport: 'width=device-width, initial-scale=1'
        },
        filename: 'popup.html',
        chunks: [
          'popup',
          'background'
        ],
        title: 'neutrino-webextension',
        webext: {
          type: 'browser_action'
        },
        inject: false,
        webextBackground: 'background'
      }
    ),
    /* neutrino.config.plugin('html-content1') */
    new (require('/home/crimx/code/neutrino-webextension/node_modules/html-webpack-plugin/index.js'))(
      {
        template: '/home/crimx/code/neutrino-webextension/template.dev.ejs',
        appMountId: 'root',
        lang: 'en',
        meta: {
          viewport: 'width=device-width, initial-scale=1'
        },
        filename: 'content1.html',
        chunks: [
          'content1',
          'background'
        ],
        title: 'neutrino-webextension',
        webext: {
          type: 'content_scripts',
          setup: 'src/content1/__dev__/setup',
          manifest: {
            matches: [
              '<all_urls>'
            ]
          }
        },
        inject: false,
        webextBackground: 'background'
      }
    ),
    /* neutrino.config.plugin('html-content2') */
    new (require('/home/crimx/code/neutrino-webextension/node_modules/html-webpack-plugin/index.js'))(
      {
        template: '/home/crimx/code/neutrino-webextension/template.dev.ejs',
        appMountId: 'root',
        lang: 'en',
        meta: {
          viewport: 'width=device-width, initial-scale=1'
        },
        filename: 'content2.html',
        chunks: [
          'content2',
          'background'
        ],
        title: 'neutrino-webextension',
        webext: {
          type: 'content_scripts',
          manifest: {
            matches: [
              'https://github.com/crimx/neutrino-webextension'
            ],
            run_at: 'document_start',
            match_about_blank: true,
            all_frames: true
          }
        },
        inject: false,
        webextBackground: 'background'
      }
    ),
    /* neutrino.config.plugin('hot') */
    new (require('/home/crimx/code/neutrino-webextension/node_modules/webpack/lib/HotModuleReplacementPlugin.js'))()
  ],
  entry: {
    background: [
      '/home/crimx/code/neutrino-webextension/node_modules/webextensions-emulator/dist/background.js',
      '/home/crimx/code/neutrino-webextension/test/setup',
      'webextension-polyfill',
      '/home/crimx/code/neutrino-webextension/test/src/background'
    ],
    popup: [
      '/home/crimx/code/neutrino-webextension/node_modules/webextensions-emulator/dist/core.js',
      '/home/crimx/code/neutrino-webextension/test/setup',
      'webextension-polyfill',
      '/home/crimx/code/neutrino-webextension/test/src/popup'
    ],
    content1: [
      '/home/crimx/code/neutrino-webextension/node_modules/webextensions-emulator/dist/core.js',
      '/home/crimx/code/neutrino-webextension/test/setup',
      'webextension-polyfill',
      'src/content1/__dev__/setup',
      '/home/crimx/code/neutrino-webextension/test/src/content1'
    ],
    content2: [
      '/home/crimx/code/neutrino-webextension/node_modules/webextensions-emulator/dist/core.js',
      '/home/crimx/code/neutrino-webextension/test/setup',
      'webextension-polyfill',
      '/home/crimx/code/neutrino-webextension/test/src/content2'
    ]
  }
}
Done in 0.25s.
