#!/usr/bin/env node

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production'
}

const fs = require('fs')
const path = require('path')
const globby = require('globby')
const archiver = require('archiver')
const Neutrino = require('neutrino/Neutrino')

const neutrino = new Neutrino()
const dist = neutrino.options.output

console.log('\n\nZipping files...')

main().catch(e => {
  process.exitCode = 1
  console.error(e)
})

async function main () {
  const browsers = await globby('*', {
    cwd: neutrino.options.output,
    onlyDirectories: true,
    markDirectories: false
  })

  await Promise.all([...browsers.map(pack), packSource()]).then(() => {
    console.log(`Done. See "${dist}".\n\n`)
  })
}

function pack (browser) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(path.join(dist, `${browser}.zip`))
    const archive = archiver('zip', {})

    output.on('close', resolve)

    archive.on('warning', function (err) {
      if (err.code === 'ENOENT') {
        console.warn(err)
      } else {
        reject(err)
      }
    })

    archive.on('error', reject)

    archive.pipe(output)

    archive.glob(`**/*`, {
      cwd: path.join(dist, browser),
      ignore: `**/*.map`
    })

    archive.finalize()
  })
}

function packSource () {
  return new Promise(async (resolve, reject) => {
    const output = fs.createWriteStream(path.join(dist, `source.zip`))
    const archive = archiver('zip', {})

    output.on('close', resolve)

    archive.on('warning', function (err) {
      if (err.code === 'ENOENT') {
        console.warn(err)
      } else {
        reject(err)
      }
    })

    archive.on('error', reject)

    archive.pipe(output)

    const customPatterns = process.argv.slice(2)
    const customNegativePatterns = customPatterns.filter(p => p && p[0] === '!')
    const customNormalPatterns = customPatterns.filter(p => p && p[0] !== '!')

    const files = await globby([`**/*`, '!.git', ...customNegativePatterns], {
      cwd: neutrino.options.root,
      dot: true,
      absolute: false,
      onlyFiles: true,
      gitignore: true
    })

    const moreFiles = await globby(customNormalPatterns, {
      cwd: neutrino.options.root,
      dot: true,
      absolute: false,
      onlyFiles: true,
      gitignore: false
    })

    const rootName = neutrino.options.packageJson.name || 'source'

    Array.from(new Set([...files, ...moreFiles])).forEach(name => {
      archive.file(path.join(neutrino.options.root, name), {
        name: path.join(rootName, name)
      })
    })

    archive.finalize()
  })
}
