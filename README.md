# wiki-plugin-globe

A Federated Wiki plugin that draws a [globe.gl](https://globe.gl) globe from pins the
wiki already holds: the pins of Map items, the points of a GeoJSON file, and pins typed
into the item. Whatever it shows it offers back as `markerData()`, so a Map item can
gather and freeze it.

    LAYER Embassies
    PAGE
    LAYER Places
    SOURCE /assets/my-page/places.geojson
    51.5, -0.1 A pin typed here, with a [[Link]]
    Any other line is a caption.

- **Two halves.** `client/globe.js` is the shell on the wiki page; `client/globe.html`
  draws the globe in a sandboxed frame. They talk by messages (`globeReady`,
  `globePoints`, `globeFly`, `globeOpen`).
- **Offline.** globe.gl, topojson-client and the land outline are copied into `client/`
  at build time. Nothing is fetched from a CDN.
- **Degrades.** `globe.html` in a plain Frame item reads Map items through the Frame
  plugin's `requestSourceData`, with `?data=<geojson>` as a fallback.
- **Accessible.** The same pins are listed beneath the globe; reduced motion is respected.

Version 0.1 draws points only. Research and plan: <https://place.fish/view/globe-plugin>,
<https://place.fish/view/globe-plugin-plan>.

    npm install && npm test && npm run build
