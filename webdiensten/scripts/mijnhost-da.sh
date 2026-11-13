#!/usr/bin/env bash
# DirectAdmin-beheer voor mijn.host hostingaccounts (Cursor Cloud Agents)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=../projects/mijnhost-domeinbeheer/src/da-client.sh
source "$ROOT/projects/mijnhost-domeinbeheer/src/da-client.sh"

LOG_DIR="$ROOT/projects/mijnhost-domeinbeheer/logs"
BACKUP_DIR="$LOG_DIR/dns-backups"
mkdir -p "$BACKUP_DIR"

usage() {
  cat <<'EOF'
Gebruik: mijnhost-da.sh <commando> ...

  login-test                 Controleer DirectAdmin-login
  account                    Pakket/gebruik/config (samenvatting)
  domains list               Domeinen op dit hostingaccount
  domains dns <domein>       DNS-zone (JSON)
  domains dns-backup <domein>
  domains dns-text <domein>  Zone als tekst
  sftp-info                  Effectieve SFTP-host/user (geen wachtwoord)
  sftp-ls [pad]              Lijst via SFTP (Python/paramiko)
  help
EOF
}

pretty_json() {
  if command -v jq >/dev/null 2>&1; then jq .; else cat; fi
}

cmd_login_test() {
  da_request "/CMD_API_LOGIN_TEST"
  echo
}

cmd_account() {
  python3 - <<'PY'
import os, urllib.request, urllib.parse, ssl, base64
from urllib.parse import unquote

da_url=os.environ['MIJNHOST_DA_URL'].rstrip('/')
user=os.environ['MIJNHOST_DA_USER']; pw=os.environ['MIJNHOST_DA_PASS']

def da(path, params=None):
    url=da_url+path+(('?'+urllib.parse.urlencode(params)) if params else '')
    req=urllib.request.Request(url)
    req.add_header('Authorization','Basic '+base64.b64encode(f'{user}:{pw}'.encode()).decode())
    with urllib.request.urlopen(req, context=ssl.create_default_context(), timeout=45) as r:
        return r.read().decode()

def decode(s):
    out={}
    for part in s.split('&'):
        if not part: continue
        if '=' in part:
            k,v=part.split('=',1); k,v=unquote(k),unquote(v)
            if k.endswith('[]') or k in out:
                prev=out.get(k, [])
                if not isinstance(prev, list): prev=[prev]
                prev.append(v); out[k]=prev
            else:
                out[k]=v
        else: out[unquote(part)]=''
    return out

def listvals(d):
    for k,v in d.items():
        if 'list' in k:
            return v if isinstance(v, list) else [v]
    return list(d.values())

cfg=decode(da('/CMD_API_SHOW_USER_CONFIG', {'user':user}))
usage=decode(da('/CMD_API_SHOW_USER_USAGE', {'user':user}))
domains=decode(da('/CMD_API_SHOW_DOMAINS'))
dbs=decode(da('/CMD_API_DATABASES'))
print('Gebruiker:', cfg.get('username') or user)
print('E-mail:', cfg.get('email'))
print('Pakket:', cfg.get('original_package'), '(actief:', cfg.get('package')+')')
print('Hoofddomein:', cfg.get('domain'))
print('IP:', cfg.get('ip'))
print('SSH:', cfg.get('ssh'), '| Git:', cfg.get('git'), '| WordPress-optie:', cfg.get('wordpress'))
print('DNS-beheer:', cfg.get('dnscontrol'))
print('Max domeinen:', cfg.get('vdomains'), '| Nu:', usage.get('vdomains'))
print('Schijf MB:', usage.get('quota'), '/', cfg.get('quota'))
print('Bandwidth GB:', usage.get('bandwidth'), '/', cfg.get('bandwidth'))
print('MySQL DBs:', usage.get('mysql'), '/', cfg.get('mysql'))
print('Subdomeinen in gebruik:', usage.get('nsubdomains'))
print('Domeinen:', listvals(domains))
print('Databases:', listvals(dbs))
PY
}

cmd_domains_list() {
  da_request "/CMD_API_SHOW_DOMAINS"
  echo
  echo "--- details ---"
  python3 - <<'PY'
import os, urllib.request, urllib.parse, ssl, base64
from urllib.parse import unquote
da_url=os.environ['MIJNHOST_DA_URL'].rstrip('/')
user=os.environ['MIJNHOST_DA_USER']; pw=os.environ['MIJNHOST_DA_PASS']

def da(path, params=None):
    url=da_url+path+(('?'+urllib.parse.urlencode(params)) if params else '')
    req=urllib.request.Request(url)
    req.add_header('Authorization','Basic '+base64.b64encode(f'{user}:{pw}'.encode()).decode())
    with urllib.request.urlopen(req, context=ssl.create_default_context(), timeout=45) as r:
        return r.read().decode()

def decode(s):
    out={}
    for part in s.split('&'):
        if not part: continue
        if '=' in part:
            k,v=part.split('=',1); out[unquote(k)]=unquote(v)
        else: out[unquote(part)]=''
    return out

raw=decode(da('/CMD_API_SHOW_DOMAINS'))
domains=[v for k,v in raw.items() if k.startswith('list')]
if not domains:
    domains=list(raw.values())
for d in domains:
    print(f'\n## {d}')
    try:
        sub=decode(da('/CMD_API_SUBDOMAINS', {'domain':d}))
        print(' subdomeinen:', [v for k,v in sub.items() if k.startswith('list')] or list(sub.values()))
    except Exception as e:
        print(' subdomeinen: fout', e)
    try:
        add=decode(da('/CMD_API_ADDITIONAL_DOMAINS'))
        # print matching
        if d in add or d.replace('.', '%2E') in add:
            pass
        print(' additional meta keys ok')
    except Exception as e:
        print(' additional:', e)
PY
}

cmd_dns_json() {
  local d="${1:?domein}"
  da_request "/CMD_API_DNS_CONTROL" "domain=$(printf %s "$d" | jq -sRr @uri)&json=yes" | pretty_json
}

cmd_dns_text() {
  local d="${1:?domein}"
  da_request "/CMD_API_DNS_CONTROL" "domain=$(printf %s "$d" | jq -sRr @uri)"
  echo
}

cmd_dns_backup() {
  local d="${1:?domein}"
  local ts file
  ts="$(TZ=Europe/Amsterdam date '+%Y%m%d-%H%M%S')"
  file="$BACKUP_DIR/da-${d}.${ts}.json"
  da_request "/CMD_API_DNS_CONTROL" "domain=$(printf %s "$d" | jq -sRr @uri)&json=yes" >"$file"
  echo "Backup: $file"
  da_log "DNS backup $d → $(basename "$file")"
}

cmd_sftp_info() {
  echo "SFTP host: $(da_sftp_host)"
  echo "SFTP user: ${MIJNHOST_SFTP_USER:-${MIJNHOST_DA_USER}}"
  echo "SFTP poort: 22 (SSH-shell poort 26 staat uit op dit account)"
}

cmd_sftp_ls() {
  local path="${1:-.}"
  MIJNHOST_SFTP_EFFECTIVE_HOST="$(da_sftp_host)" SFTP_LS_PATH="$path" python3 - <<'PY'
import os, paramiko
host=os.environ['MIJNHOST_SFTP_EFFECTIVE_HOST']
user=os.environ.get('MIJNHOST_SFTP_USER') or os.environ['MIJNHOST_DA_USER']
pw=os.environ.get('MIJNHOST_SFTP_PASS') or os.environ['MIJNHOST_DA_PASS']
path=os.environ.get('SFTP_LS_PATH','.')
t=paramiko.Transport((host, 22))
t.connect(username=user, password=pw)
sftp=paramiko.SFTPClient.from_transport(t)
for name in sorted(sftp.listdir(path)):
    print(name)
sftp.close(); t.close()
PY
}

main() {
  local cmd="${1:-help}"; shift || true
  case "$cmd" in
    help|-h|--help) usage ;;
    login-test) cmd_login_test "$@" ;;
    account) cmd_account "$@" ;;
    domains)
      local sub="${1:-}"; shift || true
      case "$sub" in
        list) cmd_domains_list "$@" ;;
        dns) cmd_dns_json "$@" ;;
        dns-backup) cmd_dns_backup "$@" ;;
        dns-text) cmd_dns_text "$@" ;;
        *) usage; exit 1 ;;
      esac
      ;;
    sftp-info) cmd_sftp_info "$@" ;;
    sftp-ls) cmd_sftp_ls "$@" ;;
    *) usage; exit 1 ;;
  esac
}

main "$@"
