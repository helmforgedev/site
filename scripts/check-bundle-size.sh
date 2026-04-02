#!/bin/bash
# Check that JS and CSS bundles stay within budget
set -euo pipefail

DIST="dist"
MAX_JS_KB=150
MAX_CSS_KB=120
MAX_TOTAL_KB=500

js_size=0
css_size=0

for f in $(find "$DIST" -name '*.js' -not -path '*/pagefind/*' -not -path '*/node_modules/*'); do
  size=$(wc -c < "$f")
  js_size=$((js_size + size))
done

for f in $(find "$DIST" -name '*.css' -not -path '*/pagefind/*' -not -path '*/node_modules/*'); do
  size=$(wc -c < "$f")
  css_size=$((css_size + size))
done

js_kb=$((js_size / 1024))
css_kb=$((css_size / 1024))
total_kb=$((js_kb + css_kb))

echo "Bundle sizes:"
echo "  JS:    ${js_kb}KB (budget: ${MAX_JS_KB}KB)"
echo "  CSS:   ${css_kb}KB (budget: ${MAX_CSS_KB}KB)"
echo "  Total: ${total_kb}KB (budget: ${MAX_TOTAL_KB}KB)"

errors=0
if [ "$js_kb" -gt "$MAX_JS_KB" ]; then
  echo "ERROR: JS bundle exceeds budget (${js_kb}KB > ${MAX_JS_KB}KB)"
  errors=$((errors + 1))
fi
if [ "$css_kb" -gt "$MAX_CSS_KB" ]; then
  echo "ERROR: CSS bundle exceeds budget (${css_kb}KB > ${MAX_CSS_KB}KB)"
  errors=$((errors + 1))
fi
if [ "$total_kb" -gt "$MAX_TOTAL_KB" ]; then
  echo "ERROR: Total bundle exceeds budget (${total_kb}KB > ${MAX_TOTAL_KB}KB)"
  errors=$((errors + 1))
fi

if [ "$errors" -gt 0 ]; then
  exit 1
fi

echo "All bundle sizes within budget"
