import { hot } from 'react-hot-loader'
import React, { useState, useCallback } from 'react'

const App = () => {
  const [msg, updateMsg] = useState('Welcome to neutrino-webextension')
  const sendMsg = useCallback(() => {
    browser.runtime.sendMessage({ type: 'gretting' }).then(updateMsg)
  }, [])

  return (
    <div>
      <h1>{msg}</h1>
      <button onClick={sendMsg}>Send message to background script</button>
    </div>
  )
}

export default hot(module)(App)
