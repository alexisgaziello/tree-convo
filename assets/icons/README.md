# Icons

`icon.svg` is the single source icon using `currentColor`. All other files are derived from it.

## Generated files

- `icon-ext.svg` — white on dark background, for extension manifests
- `icon-{16,48,128}.png` — rasterized from `icon-ext.svg`

## Regenerating

```bash
./assets/icons/generate.sh
```

Requires `rsvg-convert` (`brew install librsvg` on macOS).
