#!/usr/bin/env bash
# Shared mijn.host API helpers. Sourced by scripts/mijnhost.sh
set -euo pipefail

MIJNHOST_API_BASE="${MIJNHOST_API_BASE:-https://my.host/api/v2}"

mijnhost_require_token() {
  if [[ -z "${MIJNHOST_API_TOKEN:-}" ]]; then
    echo "FOUT: MIJNHOST_API_TOKEN ontbreekt." >&2
    echo "Maak een Personal Access Token aan op mijn.host (Account → API access)" >&2
    echo "en zet deze als Cursor Secret / omgevingsvariabele." >&2
    return 1
  fi
}

mijnhost_request() {
  local method="$1"
  local path="$2"
  local data="${3:-}"
  mijnhost_require_token

  local url="${MIJNHOST_API_BASE}${path}"
  local -a args=(-sS -X "$method" "$url"
    -H "Accept: application/json"
    -H "Authorization: Bearer ${MIJNHOST_API_TOKEN}"
  )

  if [[ -n "$data" ]]; then
    args+=(-H "Content-Type: application/json" -d "$data")
  fi

  local tmp http
  tmp="$(mktemp)"
  http="$(curl "${args[@]}" -w "%{http_code}" -o "$tmp")"
  cat "$tmp"
  echo
  rm -f "$tmp"
  if [[ "$http" -ge 400 ]]; then
    echo "HTTP $http voor $method $path" >&2
    return 1
  fi
}

mijnhost_require_approve() {
  local flag="${1:-}"
  if [[ "$flag" != "--i-approve" ]]; then
    echo "GEWEIGERD: mutatie vereist expliciete goedkeuring (--i-approve) én gebruikerstoestemming." >&2
    return 1
  fi
}

mijnhost_log() {
  local msg="$1"
  local logdir
  logdir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/logs"
  mkdir -p "$logdir"
  local ts
  ts="$(TZ=Europe/Amsterdam date '+%Y-%m-%d %H:%M:%S %Z')"
  echo "| $ts | $msg |" >>"$logdir/changelog.md"
}
