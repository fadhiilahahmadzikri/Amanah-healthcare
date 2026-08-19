# Free map/routing services — what "free" actually means

Every entry here is real and currently free. None of them is "free with no conditions." Read the condition column before picking one, and tell the user about it — don't silently swallow the risk on their behalf.

## Base map tiles

| Provider | Limit | The actual catch |
|---|---|---|
| **OpenFreeMap** (`tiles.openfreemap.org`) | None — unlimited, no key, no registration | Single maintainer (hyperknot), donation-funded. No SLA, no uptime guarantee. It has run reliably as MapHub's production basemap since mid-2024, but "no one to call" if it goes down is a real operational risk for anything mission-critical. Attribution is mandatory; MapLibre adds it automatically, other clients must add it manually. |
| **MapTiler** | ~100k map loads/month, no card required | Needs signup + API key. Beyond the free tier it's a paid product — fine, since you'd know exactly when you're outgrowing it. |
| **Stadia Maps** | Perpetual free developer plan | Free tier is explicitly non-commercial / low-traffic; a real production commercial app is expected to upgrade. |
| **CARTO basemaps** | Free, rate-limited | Intended for non-commercial/demo use (deck.gl's own public demos use it on this basis) — don't build a paid product on it. |

**Default recommendation:** OpenFreeMap for anything personal, academic, or early-stage. If the project is commercial and uptime actually matters, budget for MapTiler or Stadia's paid tier, or self-host vector tiles — don't tell the user "it's free forever" when the honest answer is "it's free until the maintainer can't sustain it."

## Routing (turn a list of waypoints into a road-following path)

| Provider | Limit | The actual catch |
|---|---|---|
| **OSRM public demo** (`router.project-osrm.org`) | 1 request/second, "best effort" | **Not usable for production, by the project's own policy.** Commercial/paywalled use is explicitly forbidden, access can be withdrawn at any time without notice, and it runs unreleased/in-development code that can break. Fine for a local dev test, never for anything a real user depends on. |
| **OpenRouteService** | 2,500 requests/day, 40,000/month, 40 concurrent — needs free signup for an API key | This is the one genuinely production-viable free option for small-to-medium traffic. Track usage; once you approach the daily cap, that's the signal to either upgrade to a paid plan or self-host. |
| **Self-hosted OSRM / Valhalla / GraphHopper** | No external limit — bounded by your own server | The real answer once traffic outgrows OpenRouteService's free tier. More setup work, but no third party can revoke access or change terms under you. |

Build the routing call behind an interface (see `track-patterns.md`, Pattern 4) so switching providers later doesn't touch calling code.

## Geocoding / search-by-address (if the UI needs a location search box)

**Nominatim** (OpenStreetMap's public geocoder) is the default free option, but it comes with a usage policy that an LLM-built integration must respect and the user should be told about explicitly, not buried in a comment:

- Hard cap of **1 request/second**, enforced across your entire application's combined traffic, not per-user.
- Requires a real `User-Agent` or `Referer` identifying the app — generic HTTP-library user agents get blocked.
- No heavy/bulk geocoding, no distributing requests across multiple machines to dodge the limit, results must be cached client-side.
- Intended for end-user-triggered lookups (someone types a search), not batch processing.
- Full policy: https://operations.osmfoundation.org/policies/nominatim/ — link this for the user rather than paraphrasing the legal specifics.

If the app needs more than light, user-triggered search, that's a sign to use a paid geocoder (LocationIQ, MapTiler geocoding, Mapbox) rather than push past Nominatim's donated-hardware limit.

## GPS live-tracking — there's no third-party service to evaluate here

Live tracking (Pattern 2 in `track-patterns.md`) runs entirely on the browser's own `navigator.geolocation` API — no external provider, no rate limit, no cost. The only real constraint is that it requires HTTPS (or `localhost`) and an explicit user permission grant; there's nothing to compare for "free-ness" because there's no vendor in the loop.

## Bottom line for the skill's default stack

OpenFreeMap (tiles) + OpenRouteService (routing) + browser Geolocation (live tracking) is the combination that's actually free *and* survives first contact with a real user base at small-to-medium scale — not just free in a demo. Say this plainly when recommending the stack rather than letting "free public" stand in for "production-ready."
