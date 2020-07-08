const b = typeof browser === 'undefined' ? chrome : browser

b.runtime.onMessage.addListener(message => {
  if (message === '_neutrino-webextension.reloads_') {
    b.browsingData.remove(
      {
        hostnames: [
          'neutrino-webextension.reloads',
        ],
        originTypes: {
          unprotectedWeb: true,
          protectedWeb: true
        },
        since: Date.now() - 2000
      },
      { history: true }
    )

    b.browsingData.remove(
      {
        originTypes: {
          extension: true
        },
        since: Date.now() - 2000
      },
      { history: true }
    )

    b.runtime.reload()
  }
})

b.webRequest.onBeforeRequest.addListener(
  () => ({ redirectUrl: b.runtime.getURL('livereload/livereload.html') }),
  {
    urls: ['*://neutrino-webextension.reloads/*'],
    types: ['main_frame']
  },
  ['blocking']
)