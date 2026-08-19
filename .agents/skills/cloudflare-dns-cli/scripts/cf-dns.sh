#!/usr/bin/env bash
#
# cf-dns.sh — tiny wrapper around the Cloudflare DNS API.
#
# Requires: curl, jq
# Requires env vars: CF_API_TOKEN (always), CF_ZONE_ID (for list/add/update/delete)
#
# Usage:
#   ./cf-dns.sh zone-id <domain.tld>
#   ./cf-dns.sh list
#   ./cf-dns.sh add <TYPE> <name> <content> [proxied(true|false), default false]
#   ./cf-dns.sh update <record_id> <content> [proxied(true|false)]
#   ./cf-dns.sh delete <record_id>

set -euo pipefail

API="https://api.cloudflare.com/client/v4"

require_token() {
  if [[ -z "${CF_API_TOKEN:-}" ]]; then
    echo "Error: CF_API_TOKEN is not set. export CF_API_TOKEN=\"...\"" >&2
    exit 1
  fi
}

require_zone() {
  if [[ -z "${CF_ZONE_ID:-}" ]]; then
    echo "Error: CF_ZONE_ID is not set. Run '$0 zone-id <domain>' first, or find it on the domain's Overview page in the Cloudflare dashboard." >&2
    exit 1
  fi
}

cmd="${1:-}"
shift || true

case "$cmd" in
  zone-id)
    require_token
    domain="${1:?Usage: $0 zone-id <domain.tld>}"
    curl -s -X GET "$API/zones?name=$domain" \
      -H "Authorization: Bearer $CF_API_TOKEN" \
      -H "Content-Type: application/json" | jq -r '.result[] | "\(.name)\t\(.id)"'
    ;;

  list)
    require_token; require_zone
    curl -s -X GET "$API/zones/$CF_ZONE_ID/dns_records" \
      -H "Authorization: Bearer $CF_API_TOKEN" \
      -H "Content-Type: application/json" | jq '.result[] | {id, name, type, content, proxied}'
    ;;

  add)
    require_token; require_zone
    type="${1:?Usage: $0 add <TYPE> <name> <content> [proxied]}"
    name="${2:?Usage: $0 add <TYPE> <name> <content> [proxied]}"
    content="${3:?Usage: $0 add <TYPE> <name> <content> [proxied]}"
    proxied="${4:-false}"
    curl -s -X POST "$API/zones/$CF_ZONE_ID/dns_records" \
      -H "Authorization: Bearer $CF_API_TOKEN" \
      -H "Content-Type: application/json" \
      --data "$(jq -n --arg type "$type" --arg name "$name" --arg content "$content" --argjson proxied "$proxied" \
        '{type: $type, name: $name, content: $content, ttl: 1, proxied: $proxied}')" \
      | jq '{success, result: {id: .result.id, name: .result.name, type: .result.type, content: .result.content, proxied: .result.proxied}, errors}'
    ;;

  update)
    require_token; require_zone
    record_id="${1:?Usage: $0 update <record_id> <content> [proxied]}"
    content="${2:?Usage: $0 update <record_id> <content> [proxied]}"
    proxied="${3:-false}"
    curl -s -X PATCH "$API/zones/$CF_ZONE_ID/dns_records/$record_id" \
      -H "Authorization: Bearer $CF_API_TOKEN" \
      -H "Content-Type: application/json" \
      --data "$(jq -n --arg content "$content" --argjson proxied "$proxied" '{content: $content, proxied: $proxied}')" \
      | jq '{success, result: {id: .result.id, name: .result.name, content: .result.content, proxied: .result.proxied}, errors}'
    ;;

  delete)
    require_token; require_zone
    record_id="${1:?Usage: $0 delete <record_id>}"
    curl -s -X DELETE "$API/zones/$CF_ZONE_ID/dns_records/$record_id" \
      -H "Authorization: Bearer $CF_API_TOKEN" \
      -H "Content-Type: application/json" | jq '{success, errors}'
    ;;

  *)
    echo "Usage: $0 {zone-id <domain>|list|add <TYPE> <name> <content> [proxied]|update <record_id> <content> [proxied]|delete <record_id>}" >&2
    exit 1
    ;;
esac
