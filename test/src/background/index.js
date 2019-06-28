console.log('background script loaded')

browser.runtime.onMessage.addListener(message => {
  if (message.type === 'gretting') {
    return Promise.resolve('background script says hi!')
  }
})
