console.log('Content1 Loaded')

document.body.style.color = 'green'

import('./split-chunk').then(c => c.log())
