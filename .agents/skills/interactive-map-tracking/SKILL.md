---
name: interactive-map-tracking
description: Build interactive maps with route/track visualization in Next.js using MapLibre GL JS, free OpenStreetMap-based tiles and routing, shadcn/ui, and Tailwind. Covers four distinct track patterns — animated playback of a recorded path, live GPS recording, user-drawn routes, and point-to-point road routing — each with a different architecture. Trigger this whenever the user wants an interactive map with a path, trail, route, GPS trace, "track jalur", hiking/delivery/trip route display, live location tracking, draw-a-route feature, or GPX/GeoJSON visualization in a React/Next.js project. Also trigger on "shadcn map", "free map API", "map without Google/Mapbox key", or requests to add a map to an existing Next.js + shadcn app — even if the user doesn't name a library.
---

# Interactive Map + Track Visualization (Next.js)

## Reality check before writing any code

Three assumptions are usually baked into requests like this. Correct them before building, not after something breaks in production:

1. **"Gratis" is not "production-grade."** Every option below is genuinely free, but each has a real string attached: a rate limit, a single-maintainer project with no SLA, or a "demo only" clause. Pick deliberately and tell the user what they're trading off — don't present it as risk-free.
2. **shadcn/ui does not render the map.** It only styles the chrome around it (sidebars, sliders, cards, search command palette). The canvas itself is MapLibre's; shadcn classes don't reach inside it. Don't waste time hunting for a "shadcn map component" — there isn't one.
3. **Don't reach for `mapbox-gl-draw`.** It's the library every old tutorial uses for drawing routes on a map, and it's unmaintained and increasingly broken on current MapLibre. Use `maplibre-gl-terradraw` instead (see Pattern 3 below).

## Decision tree: which track pattern do you actually need

"Track jalur" collapses four architecturally different features. Identify which one(s) the user means before picking code — they share a map base but nothing else:

| User says... | Pattern | Core mechanism |
|---|---|---|
| "show the hiking trail", "replay this trip", "animate a delivery moving along its route" | **1. Recorded path playback** | Static GeoJSON/GPX LineString + `turf.along()` to animate a point/marker across it |
| "track my location live", "show where the driver is right now" | **2. Live GPS recording** | `navigator.geolocation.watchPosition` appending coordinates to a growing LineString |
| "let the user draw a route", "let them mark a custom path" | **3. User-drawn route** | `maplibre-gl-terradraw` line-drawing mode, exported as GeoJSON |
| "get the route between point A and B", "show turn-by-turn directions" | **4. Point-to-point routing** | A routing API (OSRM/OpenRouteService) returns a routed LineString to render |

A real app often needs more than one — e.g. pattern 4 to compute a route, then pattern 1 to animate along it. Read `references/track-patterns.md` for working code for all four; it's organized so you only need to open the section(s) that apply.

## Canonical stack (pick this unless there's a stated reason not to)

| Concern | Choice | Why |
|---|---|---|
| Renderer | **MapLibre GL JS** | MIT-licensed fork of Mapbox GL JS v1, no API key for rendering, WebGL/vector tiles handle smooth track animation far better than Leaflet's DOM-based rendering. Leaflet is only the better call if you must support browsers without WebGL. |
| React binding | **`react-map-gl/maplibre`** (react-map-gl v7+) | `import Map from 'react-map-gl/maplibre'` — the dedicated subpath means it never pulls in `mapbox-gl` or asks for a Mapbox token. |
| Base tiles | **OpenFreeMap** (`tiles.openfreemap.org/styles/{liberty\|positron\|bright}`) | Genuinely unlimited, no key, no registration. Attribution is auto-injected by MapLibre. Caveat: it's a single-maintainer, donation-funded project — fine for most apps, but say so if the user is building something attribution- or uptime-critical (see `references/free-services-tradeoffs.md`). |
| Geometry math | **`@turf/turf`** | `along`, `length`, `lineSliceAlong`, `bearing` cover every animation/distance need without hand-rolled trig. |
| GPX import | **`@tmcw/togeojson`** | Actively maintained, also handles KML/TCX. Converts to GeoJSON so it drops straight into a MapLibre source. |
| Route drawing | **`maplibre-gl-terradraw`** (`@watergis/maplibre-gl-terradraw`) | Maintained successor to `mapbox-gl-draw`. One line to register: `map.addControl(new MaplibreTerradrawControl())`. |
| Routing API | **OpenRouteService free tier** | 2,500 req/day, 40k/month, real signup + API key — slow but legitimately usable in production at small scale. Never use the public OSRM demo server (`router.project-osrm.org`) for anything beyond a local throwaway test: it's capped at 1 req/sec, explicitly barred from commercial use, and can be withdrawn without notice. |
| UI chrome | **shadcn/ui** (`Sidebar`, `Sheet`, `Slider`, `Card`, `Command`) | For route lists, playback scrubbers, search — never for the map canvas itself. |

```bash
npm install maplibre-gl react-map-gl @turf/turf @tmcw/togeojson @watergis/maplibre-gl-terradraw
```

## The one Next.js gotcha that breaks this every time

MapLibre touches `window`/`document` at module load. Next.js App Router still server-renders Client Components for the initial HTML — `'use client'` alone is **not** enough, the build will crash on `window is undefined`. You must additionally skip SSR for the component with `next/dynamic`:

```tsx
// app/map/page.tsx
import dynamic from 'next/dynamic'

const TrackMap = dynamic(() => import('@/components/track-map'), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-muted" />,
})

export default function Page() {
  return <div className="h-screen w-full"><TrackMap /></div>
}
```

```tsx
// components/track-map.tsx
'use client'
import Map from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'

export default function TrackMap() {
  return (
    <Map
      initialViewState={{ longitude: 106.816666, latitude: -6.2, zoom: 11 }}
      mapStyle="https://tiles.openfreemap.org/styles/liberty"
      style={{ width: '100%', height: '100%' }}
    />
  )
}
```

The `'use client'` directive still matters — it's what lets the dynamically-imported module use hooks/refs — but it does not by itself disable server rendering. Both pieces are required together.

## Where to go next

- **`references/track-patterns.md`** — full working code for all four patterns above, written class-based with dependency inversion (each routing/recording concern sits behind an interface, so swapping OpenRouteService for self-hosted OSRM later is a one-line change, not a rewrite).
- **`references/free-services-tradeoffs.md`** — the honest comparison of every free tile/routing provider: actual rate limits, what "free" quietly assumes, and when to tell the user they've outgrown it.

Read whichever reference file matches what the user is actually building — don't load both if the task only touches one pattern.
