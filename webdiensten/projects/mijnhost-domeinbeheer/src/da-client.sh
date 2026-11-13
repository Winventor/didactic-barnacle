#!/usr/bin/env bash
# DirectAdmin helpers for mijn.host hosting (sourced by mijnhost-da.sh)
set -euo pipefail

da_require() {
  local missing=0
  for v in MIJNHOST_DA_URL MIJNHOST_DA_USER MIJNHOST_DA_PASS; do
    if [[ -z "${!v:-}" ]]; then
      echo "FOUT: $v ontbreekt in environment/secrets." >&2
      missing=1
    fi
  done
  return "$missing"
}

da_request() {
  local path="$1"
  local query="${2:-}"
  da_require
  local url="${MIJNHOST_DA_URL%/}${path}"
  [[ -n "$query" ]] && url="${url}?${query}"
  curl -sS --fail-with-body \
    -u "${MIJNHOST_DA_USER}:${MIJNHOST_DA_PASS}" \
    -H "Accept: application/json, text/plain, */*" \
    "$url"
}

da_require_approve() {
  if [[ "${1:-}" != "--i-approve" ]]; then
    echo "GEWEIGERD: mutatie vereist --i-approve én gebruikersgoedkeuring." >&2
    return 1
  fi
}

da_log() {
  local msg="$1"
  local logdir
  logdir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/logs"
  mkdir -p "$logdir"
  local ts
  ts="$(TZ=Europe/Amsterdam date '+%Y-%m-%d %H:%M:%S %Z')"
  echo "| $ts | DA: $msg |" >>"$logdir/changelog.md"
}

# Prefer real SFTP host even if secret wrongly stores DA URL
da_sftp_host() {
  local h="${MIJNHOST_SFTP_HOST:-h70.mijn.host}"
  if [[ "$h" == https://* || "$h" == http://* ]]; then
    h="${h#https://}"; h="${h#http://}"
    h="${h%%/*}"; h="${h%%:*}"
  fi
  # derived from DA URL if needed
  if [[ -z "$h" || "$h" == *"mijn.host"* && "$h" != h70.* && -n "${MIJNHOST_DA_URL:-}" ]]; then
    local d="${MIJNHOST_DA_URL#https://}"; d="${d#http://}"; d="${d%%/*}"; d="${d%%:*}"
    [[ -n "$d" ]] && h="$d"
  fi
  printf '%s' "$h"
}
