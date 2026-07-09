#!/usr/bin/env bash
set -euo pipefail

REPO="${1:-Winventor/didactic-barnacle}"

echo "GitHub Pages inschakelen voor ${REPO}..."

gh api "repos/${REPO}/pages" --method POST \
  -f build_type=legacy \
  -f 'source[branch]=gh-pages' \
  -f 'source[path]=/'

echo ""
echo "GitHub Pages is ingeschakeld."
echo "De site is binnen 1-2 minuten bereikbaar op:"
echo "https://winventor.github.io/didactic-barnacle/"
