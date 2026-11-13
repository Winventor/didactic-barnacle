#!/usr/bin/env bash
# mijn.host domein- & DNS-CLI voor Cursor-agents
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=../projects/mijnhost-domeinbeheer/src/mijnhost-client.sh
source "$ROOT/projects/mijnhost-domeinbeheer/src/mijnhost-client.sh"

LOG_DIR="$ROOT/projects/mijnhost-domeinbeheer/logs"
BACKUP_DIR="$LOG_DIR/dns-backups"
mkdir -p "$BACKUP_DIR"

usage() {
  cat <<'EOF'
Gebruik: mijnhost.sh <commando> ...

  whoami                         IP + klantnummer (tools/me)
  domains list                   Alle domeinen
  domains get <domein>           Domeindetails
  domains availability <domein>  Beschikbaarheid (+ premium/trustee)
  domains availability-batch a b Bulk (max 20)
  domains order <domein> ...     REGISTRATIE — alleen met --i-approve
  extensions list [zoek]         TLD-prijzen
  extensions get <tld>           Eén extensie
  dns get <domein>               DNS-records
  dns zone <domein>              Zonefile
  dns history <domein>           Wijzigingsgeschiedenis
  dns backup <domein>            Backup naar logs/dns-backups/
  dns propose-hosting <domein> <ipv4> [ipv6] [mailhost]
  dns mail-check <domein>        SPF/DKIM/DMARC via dig + API
  dns apply-file <json> [--dry-run|--i-approve]
  dns delete-record <domein> <type> <name> <value> --i-approve
  help
EOF
}

pretty() {
  if command -v jq >/dev/null 2>&1; then
    jq .
  else
    cat
  fi
}

cmd_whoami() {
  mijnhost_request GET "/tools/me" | pretty
}

cmd_domains_list() {
  mijnhost_request GET "/domains" | pretty
}

cmd_domains_get() {
  local d="${1:?domein verplicht}"
  mijnhost_request GET "/domains/${d}" | pretty
}

cmd_domains_availability() {
  local d="${1:?domein verplicht}"
  mijnhost_request GET "/domains/availability/${d}" | pretty
}

cmd_domains_availability_batch() {
  local payload
  payload="$(printf '%s\n' "$@" | jq -R . | jq -s '{domains: .}')"
  mijnhost_request POST "/domains/availability" "$payload" | pretty
}

cmd_domains_order() {
  echo "LET OP: domains order rekent direct af op het mijn.host-account." >&2
  local approve=""
  local args=()
  for a in "$@"; do
    if [[ "$a" == "--i-approve" ]]; then approve="$a"; else args+=("$a"); fi
  done
  mijnhost_require_approve "${approve:-}"
  local body="${args[*]:-}"
  if [[ -z "$body" || "$body" != \{* ]]; then
    echo "Geef JSON body als argument, bijv.:" >&2
    echo "  mijnhost.sh domains order '{\"domain\":\"x.nl\",...}' --i-approve" >&2
    echo "Zie API: POST /domains/order" >&2
    return 1
  fi
  mijnhost_request POST "/domains/order" "$body" | pretty
  mijnhost_log "domains order uitgevoerd (details in API-response; geen secrets gelogd)"
}

cmd_extensions_list() {
  local q="${1:-}"
  if [[ -n "$q" ]]; then
    mijnhost_request GET "/domains/extensions?search=$(printf %s "$q" | jq -sRr @uri)" | pretty
  else
    mijnhost_request GET "/domains/extensions" | pretty
  fi
}

cmd_extensions_get() {
  local tld="${1:?tld verplicht}"
  mijnhost_request GET "/domains/extensions/${tld}" | pretty
}

cmd_dns_get() {
  local d="${1:?domein verplicht}"
  mijnhost_request GET "/domains/${d}/dns" | pretty
}

cmd_dns_zone() {
  local d="${1:?domein verplicht}"
  mijnhost_request GET "/domains/${d}/dns/zone" | pretty
}

cmd_dns_history() {
  local d="${1:?domein verplicht}"
  mijnhost_request GET "/domains/${d}/dns/history" | pretty
}

cmd_dns_backup() {
  local d="${1:?domein verplicht}"
  local ts file
  ts="$(TZ=Europe/Amsterdam date '+%Y%m%d-%H%M%S')"
  file="$BACKUP_DIR/${d}.${ts}.json"
  mijnhost_request GET "/domains/${d}/dns" >"$file"
  echo "Backup geschreven: $file"
  mijnhost_log "DNS backup $d → $(basename "$file")"
}

cmd_dns_propose_hosting() {
  local d="${1:?domein}"
  local ipv4="${2:?ipv4}"
  local ipv6="${3:-}"
  local mail="${4:-}"
  local out="$ROOT/projects/mijnhost-domeinbeheer/fixtures/propose-${d}.json"

  # Bouw een veilig voorstel: apex A (+AAAA), www CNAME, behoud MX/TXT indien later gemerged.
  # Agents moeten bestaande records mergen vóór apply.
  jq -n \
    --arg domain "$d" \
    --arg ipv4 "$ipv4" \
    --arg ipv6 "$ipv6" \
    --arg mail "$mail" \
    '{
      domain: $domain,
      note: "VOORSTEL — niet toegepast. Merge met bestaande zone vóór apply. Goedkeuring vereist.",
      records: (
        [
          {type:"A", name:($domain+"."), value:$ipv4, ttl:300},
          {type:"CNAME", name:("www."+$domain+"."), value:($domain+"."), ttl:300}
        ]
        + (if $ipv6 != "" then [{type:"AAAA", name:($domain+"."), value:$ipv6, ttl:300}] else [] end)
        + (if $mail != "" then [{type:"MX", name:($domain+"."), value:("10 "+$mail+"."), ttl:300}] else [] end)
      ),
      checklist: [
        "Bestaande MX/TXT/SPF/DKIM/DMARC behouden of expliciet vervangen",
        "dns backup draaien",
        "dry-run apply-file",
        "gebruikersgoedkeuring",
        "apply met --i-approve",
        "dig + publieke resolvers controleren"
      ]
    }' >"$out"
  echo "Voorstel geschreven: $out"
  cat "$out" | pretty
}

cmd_dns_mail_check() {
  local d="${1:?domein}"
  echo "=== API records ==="
  mijnhost_request GET "/domains/${d}/dns" | pretty || true
  echo "=== dig SPF (TXT apex) ==="
  dig +short TXT "$d" || true
  echo "=== dig DMARC ==="
  dig +short TXT "_dmarc.$d" || true
  echo "=== dig MX ==="
  dig +short MX "$d" || true
  echo "=== dig NS ==="
  dig +short NS "$d" || true
  echo "DKIM: zoek selector._domainkey.$d (selector afhankelijk van mailprovider)."
}

cmd_dns_apply_file() {
  local file="${1:?json-bestand}"
  local mode="${2:---dry-run}"
  if [[ ! -f "$file" ]]; then
    echo "Bestand niet gevonden: $file" >&2
    return 1
  fi
  local domain records
  domain="$(jq -r '.domain // empty' "$file")"
  records="$(jq -c '.records // empty' "$file")"
  if [[ -z "$domain" || -z "$records" || "$records" == "null" ]]; then
    echo "JSON moet {domain, records:[...]} bevatten" >&2
    return 1
  fi
  local body
  body="$(jq -c '{records: .records}' "$file")"
  if [[ "$mode" == "--dry-run" ]]; then
    echo "DRY-RUN PUT /domains/${domain}/dns"
    echo "$body" | pretty
    echo "Geen wijziging uitgevoerd."
    return 0
  fi
  mijnhost_require_approve "$mode"
  cmd_dns_backup "$domain"
  mijnhost_request PUT "/domains/${domain}/dns" "$body" | pretty
  mijnhost_log "DNS replace applied for $domain via $(basename "$file")"
}

cmd_dns_delete_record() {
  local d="${1:?}" t="${2:?}" n="${3:?}" v="${4:?}" approve="${5:-}"
  mijnhost_require_approve "$approve"
  cmd_dns_backup "$d"
  local body
  body="$(jq -n --arg type "$t" --arg name "$n" --arg value "$v" '{record:{type:$type,name:$name,value:$value}}')"
  mijnhost_request DELETE "/domains/${d}/dns" "$body" | pretty
  mijnhost_log "DNS delete $t $n $v on $d"
}

main() {
  local cmd="${1:-help}"
  shift || true
  case "$cmd" in
    help|-h|--help) usage ;;
    whoami) cmd_whoami "$@" ;;
    domains)
      local sub="${1:-}"; shift || true
      case "$sub" in
        list) cmd_domains_list "$@" ;;
        get) cmd_domains_get "$@" ;;
        availability) cmd_domains_availability "$@" ;;
        availability-batch) cmd_domains_availability_batch "$@" ;;
        order) cmd_domains_order "$@" ;;
        *) usage; exit 1 ;;
      esac
      ;;
    extensions)
      local sub="${1:-}"; shift || true
      case "$sub" in
        list) cmd_extensions_list "$@" ;;
        get) cmd_extensions_get "$@" ;;
        *) usage; exit 1 ;;
      esac
      ;;
    dns)
      local sub="${1:-}"; shift || true
      case "$sub" in
        get) cmd_dns_get "$@" ;;
        zone) cmd_dns_zone "$@" ;;
        history) cmd_dns_history "$@" ;;
        backup) cmd_dns_backup "$@" ;;
        propose-hosting) cmd_dns_propose_hosting "$@" ;;
        mail-check) cmd_dns_mail_check "$@" ;;
        apply-file) cmd_dns_apply_file "$@" ;;
        delete-record) cmd_dns_delete_record "$@" ;;
        *) usage; exit 1 ;;
      esac
      ;;
    *) usage; exit 1 ;;
  esac
}

main "$@"
