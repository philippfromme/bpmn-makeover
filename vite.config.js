import { readFileSync } from 'node:fs'

import { defineConfig } from 'vite'

const bpmnJsAssetSourcePlugin = () => ({
  name: 'bpmn-js-asset-source',
  enforce: 'pre',
  load(id) {
    const normalizedId = id.split('?')[0].replace(/\\/g, '/')

    if (!normalizedId.includes('/node_modules/bpmn-js/')) {
      return null
    }

    if (!/\.(bpmn|svg)$/.test(normalizedId)) {
      return null
    }

    const source = readFileSync(normalizedId, 'utf8')

    return `export default ${JSON.stringify(source)};`
  }
})

export default defineConfig({
  // Relative base path keeps assets working on GitHub Pages project sites.
  base: './',
  // Mirror webpack asset/source behavior for text assets used inside bpmn-js.
  // CSS must stay on Vite's normal pipeline so styles are still emitted.
  plugins: [ bpmnJsAssetSourcePlugin() ]
})
