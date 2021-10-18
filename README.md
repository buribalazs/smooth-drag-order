# Smooth Drag Order

- vertical dragging and reordering only
- mobile (touch screen) support
- Emits `change` event on reordering
- mixed heights are supported
- uses `MutationObserver` to keep up with children list changes. Will probably break if you change children list while the user is dragging though
- can be destroyed and reinitialized without event listener stacking or clashing
- 1.3Kb minified and gzipped
- features *disgusting™* codestyle

## Browser support

| Internet Explorer | Edge   | Firefox | Chrome | Safari | Samsung browser |
|-------------------|--------|---------|--------|--------|-----------------|
| ❌                |✔️      |✔️      |   ✔️   | ✔️     | ✔️             |

## How to

see `index.html` for how-to. Open console to see output.