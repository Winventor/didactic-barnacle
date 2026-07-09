#!/usr/bin/env bash
set -euo pipefail

REPO="${1:-Winventor/didactic-barnacle}"

echo "GitHub Pages inschakelen voor ${REPO} (via GitHub Actions)..."

gh api "repos/${REPO}/pages" --method POST \
  -f build_type=workflow

echo ""
echo "GitHub Pages is ingeschakeld met GitHub Actions als bron."
echo "De site wordt gepubliceerd na de volgende succesvolle workflow-run op:"
echo "https://winventor.github.io/didactic-barnacle/"
