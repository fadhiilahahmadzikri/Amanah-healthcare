---
name: cloudflare-dns-cli
description: Use whenever the user wants to add, list, update, or delete DNS records (CNAME, A, AAAA, TXT, MX, etc.) on a Cloudflare-managed domain entirely from the terminal, without opening the Cloudflare dashboard. Covers two distinct terminal methods and when each applies — (1) "cloudflared tunnel route dns", which auto-creates a CNAME pointing a hostname at a Cloudflare Tunnel the user runs, and (2) the Cloudflare REST API via curl + an API token, which is required whenever a record must point at an arbitrary external target (third-party domain/DNS verification records from services like Clerk, Resend, Vercel, Google Workspace, SendGrid, etc., since tunnel routing can only point at a tunnel). Trigger this skill any time the user mentions adding a subdomain or CNAME "from the terminal"/"from the CLI", cloudflared, a Cloudflare API token or Zone ID, or needs to add a DNS verification record for a third-party service on a Cloudflare-managed domain.
---

# Cloudflare DNS from the Terminal

There are two genuinely different ways to create DNS records on a Cloudflare-managed
domain from a terminal, with **no dashboard interaction required**. They are not
interchangeable — pick based on what the record needs to point to.

## Decision: which method?

| What the record needs to point to | Method |
|---|---|
| A Cloudflare Tunnel running locally (`cloudflared`) | **Method 1** — `cloudflared tunnel route dns` |
| Anything else: a value handed to the user by a third-party service (Clerk, Resend, Vercel, Google Workspace, SendGrid, an SSL/verification TXT record, a plain A record to a VPS IP, etc.) | **Method 2** — Cloudflare API |

A very common mix-up: someone successfully used Method 1 to add subdomains in the
past (e.g. for a homelab service or self-hosted app behind `cloudflared`), and
assumes the same command can be reused for *any* new subdomain. It can't — Method 1's
CNAME target is hardcoded to the tunnel's address. If a service (like Clerk) gives a
specific Name + Value to add, that's always Method 2.

---

## Method 1: `cloudflared tunnel route dns`

**Use only when** routing a hostname to a Cloudflare Tunnel the user runs with `cloudflared`.

Prerequisites (one-time):
- `cloudflared` installed
- Authenticated once via `cloudflared tunnel login` (this writes a `cert.pem` used for
  API calls made by the CLI itself — this is *how* it manages to touch DNS without the
  dashboard)
- A tunnel already created: `cloudflared tunnel create <tunnel-name>`

Command:
```bash
cloudflared tunnel route dns <tunnel-name-or-uuid> <hostname>
```

Example:
```bash
cloudflared tunnel route dns my-tunnel app.autovoid.cyou
```

What actually happens: this creates a CNAME record `app.autovoid.cyou` →
`<TUNNEL-UUID>.cfargotunnel.com`, calling the Cloudflare API under the hood with the
credentials from `cert.pem`. Nothing is touched in the dashboard — this is real and is
almost certainly what's responsible if the user has added several subdomains before
"without touching the dashboard."

**Hard limitation:** the CNAME target is always `<uuid>.cfargotunnel.com`. There's no
flag to point it anywhere else. This command cannot be used to satisfy a verification
record from Clerk, Resend, Vercel, etc. — those require Method 2.

---

## Method 2: Cloudflare API (arbitrary records)

**Use this whenever a third-party service hands the user a specific Name + Target/Value**
to add as a DNS record — this is the general-purpose path and the one needed for things
like Clerk production-domain CNAMEs.

### One-time setup

1. **API Token** — dashboard.cloudflare.com → profile icon (top right) → *My Profile* →
   *API Tokens* → *Create Token* → use the **"Edit zone DNS"** template → scope to the
   specific zone (domain).
2. **Zone ID** — Cloudflare dashboard → select the domain → Overview page, right
   sidebar, under "API" → **Zone ID**. (Or resolve it via the API — see
   `scripts/cf-dns.sh`.)
3. Export both so they're not hardcoded into commands or shell history:
   ```bash
   export CF_API_TOKEN="paste-token-here"
   export CF_ZONE_ID="paste-zone-id-here"
   ```

### List existing records
```bash
curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" | jq '.result[] | {id, name, type, content, proxied}'
```

### Add a record
```bash
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{
    "type": "CNAME",
    "name": "accounts.autovoid.cyou",
    "content": "target-value-given-by-the-service",
    "ttl": 1,
    "proxied": false
  }'
```

`"ttl": 1` means "Auto". Adjust `"type"` / `"content"` for A, TXT, MX, etc.

**Critical: `"proxied": false`.** Third-party DNS verification (Clerk, SSL issuance,
SPF/DKIM, most "point this CNAME at us" instructions) needs the plain DNS answer, not
Cloudflare's proxy IP. The dashboard equivalent of `proxied: false` is the **grey "DNS
only" cloud** — never the orange "Proxied" cloud — for these records.

### Update a record
Get the record's `id` from the list call above, then:
```bash
curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/dns_records/<record_id>" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"content": "new-target-value", "proxied": false}'
```

### Delete a record
```bash
curl -s -X DELETE "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/dns_records/<record_id>" \
  -H "Authorization: Bearer $CF_API_TOKEN"
```

---

## Helper script

`scripts/cf-dns.sh` wraps the calls above (list / add / delete, plus zone-ID lookup by
domain name) so the boilerplate doesn't need retyping. Requires `curl` and `jq`.

```bash
export CF_API_TOKEN="..."
./scripts/cf-dns.sh zone-id autovoid.cyou        # look up and print the Zone ID
export CF_ZONE_ID="..."                          # paste the result in
./scripts/cf-dns.sh list
./scripts/cf-dns.sh add CNAME accounts.autovoid.cyou target-value-from-service
./scripts/cf-dns.sh delete <record_id>
```

---

## Common pitfalls

- **Forgetting `proxied: false`** — third-party DNS validation (Clerk, SSL cert
  issuance, etc.) fails silently or hangs indefinitely if left proxied (orange cloud).
- **Wrong token scope** — a 403 usually means the token isn't scoped to the right zone
  or is missing the "Zone:DNS:Edit" permission.
- **Reaching for `cloudflared tunnel route dns` for a non-tunnel record** — it will
  either fail or create the wrong CNAME target. If a service handed over a literal
  Name + Value pair, that's always Method 2.
- **Name field format** — the Cloudflare API wants the full hostname in `"name"` (e.g.
  `accounts.autovoid.cyou`), not just the subdomain label (`accounts`) the dashboard UI
  sometimes shows shorthand for.
