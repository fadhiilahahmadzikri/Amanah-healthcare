# Plasma Scene Export

This package was exported from Plasma Studio.

## Files

- `index.html`: ready-to-open demo page using the exported scene config.
- `scene.json`: declarative `plasmaScene@1` asset config.
- `plasma-scene.runtime.js`: standalone web-component runtime.

## Use In Any HTML Page

```html
<script type="module" src="./plasma-scene.runtime.js"></script>
<plasma-scene src="./scene.json"></plasma-scene>
```

If your browser blocks local JSON fetches from `file://`, serve the folder with any static server.
The included `index.html` uses inline config so it can be previewed without writing renderer logic.
