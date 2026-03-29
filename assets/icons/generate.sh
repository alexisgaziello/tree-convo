#!/usr/bin/env bash
# Generates derived icon files from the source icon.svg.
# Requires: rsvg-convert (brew install librsvg)
set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
SRC="$DIR/icon.svg"
OUT="$DIR/generated"
EXT_SVG="$OUT/icon-ext.svg"

mkdir -p "$OUT"

# Generate extension SVG: white on dark background.
TREE_CONTENT=$(sed -n '/<svg/,/<\/svg>/p' "$SRC" | sed '1d;$d' | sed 's/currentColor/white/g')
cat > "$EXT_SVG" <<EOF
<svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="128" height="128" rx="24" fill="#1a1a1a"/>
$TREE_CONTENT
</svg>
EOF

# Generate PNGs from extension SVG.
for size in 16 48 128; do
  rsvg-convert -w "$size" -h "$size" "$EXT_SVG" -o "$OUT/icon-${size}.png"
done

echo "Generated: generated/icon-ext.svg, icon-16.png, icon-48.png, icon-128.png"
