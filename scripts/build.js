import esbuild from 'esbuild'
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'

mkdirSync('client', { recursive: true })

// The shell: the wiki-side plugin.
await esbuild.build({
  entryPoints: ['src/client/globe.js'],
  bundle: true,
  format: 'iife',
  outfile: 'client/globe.js',
  sourcemap: true,
  minify: true,
})
console.log('built client/globe.js')

// The renderer and everything it draws with, shipped beside it so the globe works offline.
copyFileSync('src/renderer/globe.html', 'client/globe.html')
copyFileSync('node_modules/globe.gl/dist/globe.gl.min.js', 'client/globe.gl.min.js')
copyFileSync('node_modules/topojson-client/dist/topojson-client.min.js', 'client/topojson-client.min.js')
// A script, not a fetch: the renderer runs in a sandboxed frame with no origin of its own.
writeFileSync('client/land-110m.js', `window.LAND_110M = ${readFileSync('node_modules/world-atlas/land-110m.json', 'utf8')}\n`)
console.log('copied client/globe.html and its libraries')
