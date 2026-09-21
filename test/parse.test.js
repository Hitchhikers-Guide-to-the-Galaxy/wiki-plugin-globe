import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parse, pin, resolveSource, pinsFromGeojson, geojsonFromMarkers, unique } from '../src/client/parse.js'

test('pin lines are the Map plugin\'s', () => {
  assert.deepEqual(pin('51.5, -0.1 London [[Embassy]]'), { lat: 51.5, lon: -0.1, label: 'London [[Embassy]]' })
  assert.equal(pin('PAGE'), null)
  assert.equal(pin('Two cities'), null)
})

test('commands, layers, pins and captions', () => {
  const got = parse('LAYER Embassies\nPAGE\nLAYER Files\nSOURCE: /assets/x/places.geojson\n52.52, 13.405 Berlin\nA caption line.')
  assert.equal(got.layers.length, 2)
  assert.deepEqual(got.layers[0], { name: 'Embassies', page: true, lineup: false, sources: [], pins: [] })
  assert.deepEqual(got.layers[1].sources, ['/assets/x/places.geojson'])
  assert.equal(got.layers[1].pins[0].label, 'Berlin')
  assert.deepEqual(got.captions, ['A caption line.'])
  assert.deepEqual(got.problems, [])
})

test('lines before any LAYER form an unnamed layer', () => {
  const got = parse('LINEUP\n51.5, 0 Greenwich')
  assert.equal(got.layers.length, 1)
  assert.equal(got.layers[0].name, '')
  assert.ok(got.layers[0].lineup)
})

test('planned commands are named, not reported; typos are reported, not captioned', () => {
  const got = parse('KIND points\nSORCE /assets/a.geojson\nlowercase page is a caption')
  assert.deepEqual(got.planned, ['KIND'])
  assert.deepEqual(got.problems, [{ word: 'SORCE', suggestion: 'SOURCE' }])
  assert.deepEqual(got.captions, ['lowercase page is a caption'])
})

test('a pin off the globe is a caption, not a pin', () => {
  assert.equal(parse('2026, 9 was a good month').layers.length, 0)
})

test('SOURCE on a remote page belongs to that site', () => {
  assert.equal(resolveSource('/assets/a/b.geojson', 'place.fish'), '//place.fish/assets/a/b.geojson')
  assert.equal(resolveSource('/assets/a/b.geojson', null), '/assets/a/b.geojson')
  assert.equal(resolveSource('https://x.org/b.geojson', 'place.fish'), 'https://x.org/b.geojson')
})

test('GeoJSON: points only, labels as wiki text', () => {
  const { pins, skipped } = pinsFromGeojson({ type: 'FeatureCollection', features: [
    { type: 'Feature', geometry: { type: 'Point', coordinates: [13.4, 52.5] }, properties: { name: 'Berlin', title: 'Berlin Embassy' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-0.1, 51.5] }, properties: { name: 'London', wiki_url: 'https://l.example/view/london' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [2.35, 48.85] }, properties: { name: 'Paris ]] [[Oops' } },
    { type: 'Feature', geometry: { type: 'LineString', coordinates: [[0, 0], [1, 1]] }, properties: {} },
  ] })
  assert.equal(skipped, 1)
  assert.deepEqual(pins.map(p => p.label), ['Berlin [[Berlin Embassy]]', '[https://l.example/view/london London]', 'Paris  Oops'])
  assert.deepEqual([pins[0].lat, pins[0].lon], [52.5, 13.4])
})

test('markerGeo is valid GeoJSON: properties beside geometry', () => {
  const f = geojsonFromMarkers([{ lat: 1, lon: 2, label: 'x' }]).features[0]
  assert.deepEqual(f.geometry, { type: 'Point', coordinates: [2, 1] })
  assert.deepEqual(f.properties, { label: 'x' })
})

test('unique keeps the first of a repeated pin', () => {
  assert.equal(unique([{ lat: 1, lon: 2, label: 'a' }, { lat: 1.000001, lon: 2, label: 'a' }, { lat: 1, lon: 2, label: 'b' }]).length, 2)
})
