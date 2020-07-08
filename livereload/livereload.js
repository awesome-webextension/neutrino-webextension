const b = typeof browser === 'undefined' ? chrome : browser

b.runtime.sendMessage('_neutrino-webextension.reloads_')

if (window.history.length <= 1) {
  window.close()
} else {
  history.back()
}