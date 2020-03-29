console.log('Content1 Loaded')

document.querySelector('.title').style.color = 'green'

import('./split-chunk').then(c => c.log())
