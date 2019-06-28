console.log('background script loaded')

browser.runtime.onMessage.addListener(message => {
  if (message.type === 'gretting') {
    return new Promise(resolve => {
      setTimeout(resolve, 1000, 'background script says hi!')
    })
  }
})
