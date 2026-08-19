# Track implementation patterns

Four patterns, each behind its own interface so the map-rendering code never needs to know which one is in play. Jump to the section that matches what's being built — they don't share state, only the base map setup from `SKILL.md`.

1. [Recorded path playback](#1-recorded-path-playback)
2. [Live GPS recording](#2-live-gps-recording)
3. [User-drawn route](#3-user-drawn-route)
4. [Point-to-point routing](#4-point-to-point-routing)

All examples assume the `npm install` from `SKILL.md` and the SSR-safe wrapper pattern already in place.

---

## 1. Recorded path playback

Animate a marker along a static GeoJSON or GPX track — hiking trail replay, delivery trip animation, activity history.

**`lib/gpx-track-parser.ts`** — converts an uploaded GPX file to the GeoJSON the rest of this pattern expects:

```typescript
import { gpx } from '@tmcw/togeojson'
import type { Feature, FeatureCollection, LineString } from 'geojson'

export class GpxTrackParser {
  parse(gpxText: string): Feature<LineString> {
    const xml = new DOMParser().parseFromString(gpxText, 'text/xml')
    const collection = gpx(xml) as FeatureCollection
    const track = collection.features.find((feature) => feature.geometry.type === 'LineString')
    if (!track) throw new Error('GPX file contains no track LineString')
    return track as Feature<LineString>
  }
}
```

**`lib/track-animator.ts`** — pure geometry, no DOM, easy to unit test on its own:

```typescript
import { along, bearing, length, point } from '@turf/turf'
import type { Feature, LineString } from 'geojson'

export interface TrackAnimationFrame {
  position: [number, number]
  bearingDegrees: number
  progressRatio: number
}

export class TrackAnimator {
  private readonly totalLengthKm: number

  constructor(private readonly track: Feature<LineString>) {
    this.totalLengthKm = length(track, { units: 'kilometers' })
  }

  frameAt(progressRatio: number): TrackAnimationFrame {
    const clamped = Math.min(Math.max(progressRatio, 0), 1)
    const distanceKm = this.totalLengthKm * clamped
    const lookaheadKm = Math.min(distanceKm + 0.01, this.totalLengthKm)
    const current = along(this.track, distanceKm, { units: 'kilometers' })
    const lookahead = along(this.track, lookaheadKm, { units: 'kilometers' })
    return {
      position: current.geometry.coordinates as [number, number],
      bearingDegrees: bearing(point(current.geometry.coordinates), point(lookahead.geometry.coordinates)),
      progressRatio: clamped,
    }
  }
}
```

**`lib/playback-clock.ts`** — owns the `requestAnimationFrame` loop, decoupled from the geometry above so either can change independently:

```typescript
export class PlaybackClock {
  private rafHandle: number | null = null
  private startTimestamp = 0
  private elapsedBeforePauseMs = 0

  constructor(
    private readonly durationMs: number,
    private readonly onTick: (progressRatio: number) => void,
    private readonly onComplete: () => void,
  ) {}

  play(): void {
    if (this.rafHandle !== null) return
    this.startTimestamp = performance.now() - this.elapsedBeforePauseMs
    this.scheduleTick()
  }

  pause(): void {
    if (this.rafHandle === null) return
    cancelAnimationFrame(this.rafHandle)
    this.rafHandle = null
    this.elapsedBeforePauseMs = performance.now() - this.startTimestamp
  }

  seek(progressRatio: number): void {
    this.elapsedBeforePauseMs = progressRatio * this.durationMs
    this.onTick(progressRatio)
  }

  private scheduleTick(): void {
    this.rafHandle = requestAnimationFrame(this.tick)
  }

  private tick = (): void => {
    const elapsedMs = performance.now() - this.startTimestamp
    const progressRatio = Math.min(elapsedMs / this.durationMs, 1)
    this.onTick(progressRatio)
    if (progressRatio >= 1) {
      this.rafHandle = null
      this.onComplete()
      return
    }
    this.scheduleTick()
  }
}
```

**`hooks/use-track-playback.ts`** — wires the two classes above into React state:

```typescript
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Feature, LineString } from 'geojson'
import { TrackAnimator } from '@/lib/track-animator'
import { PlaybackClock } from '@/lib/playback-clock'

export function useTrackPlayback(track: Feature<LineString>, durationMs = 20000) {
  const animator = useMemo(() => new TrackAnimator(track), [track])
  const [frame, setFrame] = useState(() => animator.frameAt(0))
  const [isPlaying, setIsPlaying] = useState(false)
  const clockRef = useRef<PlaybackClock | null>(null)

  useEffect(() => {
    clockRef.current = new PlaybackClock(
      durationMs,
      (progressRatio) => setFrame(animator.frameAt(progressRatio)),
      () => setIsPlaying(false),
    )
    return () => clockRef.current?.pause()
  }, [animator, durationMs])

  const play = useCallback(() => {
    clockRef.current?.play()
    setIsPlaying(true)
  }, [])

  const pause = useCallback(() => {
    clockRef.current?.pause()
    setIsPlaying(false)
  }, [])

  const seek = useCallback((progressRatio: number) => {
    clockRef.current?.seek(progressRatio)
    setFrame(animator.frameAt(progressRatio))
  }, [animator])

  return { frame, isPlaying, play, pause, seek }
}
```

**`components/track-playback-map.tsx`** — the only piece that touches MapLibre or shadcn:

```tsx
'use client'
import Map, { Layer, Marker, Source } from 'react-map-gl/maplibre'
import { Pause, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { useTrackPlayback } from '@/hooks/use-track-playback'
import type { Feature, LineString } from 'geojson'

export function TrackPlaybackMap({ track }: { track: Feature<LineString> }) {
  const { frame, isPlaying, play, pause, seek } = useTrackPlayback(track)

  return (
    <div className="relative h-full w-full">
      <Map
        initialViewState={{ longitude: frame.position[0], latitude: frame.position[1], zoom: 13 }}
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
        style={{ width: '100%', height: '100%' }}
      >
        <Source id="recorded-track" type="geojson" data={track}>
          <Layer id="recorded-track-line" type="line" paint={{ 'line-color': '#3b82f6', 'line-width': 4 }} />
        </Source>
        <Marker longitude={frame.position[0]} latitude={frame.position[1]} rotation={frame.bearingDegrees} />
      </Map>
      <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 rounded-lg bg-background/90 p-3 shadow-lg">
        <Button size="icon" onClick={isPlaying ? pause : play}>
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Slider value={[frame.progressRatio * 100]} onValueChange={([value]) => seek(value / 100)} max={100} step={0.1} />
      </div>
    </div>
  )
}
```

---

## 2. Live GPS recording

Record the device's own movement in real time — delivery tracking, live activity sharing. No external service; the only dependency is the browser's Geolocation API, which requires HTTPS (or `localhost`) and an explicit permission grant.

**`lib/location-source.ts`** — the interface exists so the recorder below never depends on `navigator.geolocation` directly, which also makes it trivial to substitute a fake source in tests:

```typescript
export interface LocationFix {
  longitude: number
  latitude: number
  accuracyMeters: number
  timestampMs: number
}

export interface ILocationSource {
  start(onFix: (fix: LocationFix) => void, onError: (error: GeolocationPositionError) => void): void
  stop(): void
}

export class BrowserGeolocationSource implements ILocationSource {
  private watchId: number | null = null

  start(onFix: (fix: LocationFix) => void, onError: (error: GeolocationPositionError) => void): void {
    this.watchId = navigator.geolocation.watchPosition(
      (position) =>
        onFix({
          longitude: position.coords.longitude,
          latitude: position.coords.latitude,
          accuracyMeters: position.coords.accuracy,
          timestampMs: position.timestamp,
        }),
      onError,
      { enableHighAccuracy: true, maximumAge: 1000 },
    )
  }

  stop(): void {
    if (this.watchId !== null) navigator.geolocation.clearWatch(this.watchId)
    this.watchId = null
  }
}
```

**`lib/track-recorder.ts`** — accumulates fixes into a growing LineString; this is the single responsibility that's separate from where the fixes come from:

```typescript
import type { Feature, LineString } from 'geojson'
import type { ILocationSource } from './location-source'

export class TrackRecorder {
  private readonly coordinates: [number, number][] = []

  constructor(private readonly source: ILocationSource) {}

  start(onUpdate: (track: Feature<LineString>) => void, onError?: (message: string) => void): void {
    this.source.start(
      (fix) => {
        this.coordinates.push([fix.longitude, fix.latitude])
        onUpdate(this.toFeature())
      },
      (error) => onError?.(error.message),
    )
  }

  stop(): void {
    this.source.stop()
  }

  private toFeature(): Feature<LineString> {
    return { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: this.coordinates } }
  }
}
```

**`hooks/use-live-track-recorder.ts`**:

```typescript
import { useCallback, useRef, useState } from 'react'
import type { Feature, LineString } from 'geojson'
import { TrackRecorder } from '@/lib/track-recorder'
import { BrowserGeolocationSource } from '@/lib/location-source'

export function useLiveTrackRecorder() {
  const recorderRef = useRef<TrackRecorder | null>(null)
  const [track, setTrack] = useState<Feature<LineString> | null>(null)
  const [isRecording, setIsRecording] = useState(false)

  const start = useCallback(() => {
    recorderRef.current = new TrackRecorder(new BrowserGeolocationSource())
    recorderRef.current.start(setTrack)
    setIsRecording(true)
  }, [])

  const stop = useCallback(() => {
    recorderRef.current?.stop()
    setIsRecording(false)
  }, [])

  return { track, isRecording, start, stop }
}
```

Render `track` through the same `<Source type="geojson"><Layer type="line" /></Source>` pair shown in Pattern 1 — the rendering side doesn't change, only where the data comes from.

---

## 3. User-drawn route

Let the user draw a line directly on the map and capture it as GeoJSON. Built on `maplibre-gl-terradraw`, the maintained successor to the now-stale `mapbox-gl-draw` — don't substitute the latter.

```bash
npm install @watergis/maplibre-gl-terradraw
```

**`components/route-draw-control.tsx`**:

```tsx
'use client'
import { useEffect, useRef } from 'react'
import { useMap } from 'react-map-gl/maplibre'
import { MaplibreTerradrawControl } from '@watergis/maplibre-gl-terradraw'
import '@watergis/maplibre-gl-terradraw/dist/maplibre-gl-terradraw.css'
import type { Feature, LineString } from 'geojson'

export function RouteDrawControl({ onRouteDrawn }: { onRouteDrawn: (route: Feature<LineString>) => void }) {
  const { current: map } = useMap()
  const controlRef = useRef<MaplibreTerradrawControl | null>(null)

  useEffect(() => {
    if (!map) return
    const control = new MaplibreTerradrawControl({ modes: ['linestring', 'select', 'delete'] })
    map.getMap().addControl(control, 'top-left')
    controlRef.current = control

    const drawInstance = control.getTerraDrawInstance()
    drawInstance.on('finish', (id: string) => {
      const snapshot = drawInstance.getSnapshot()
      const feature = snapshot.find((item) => item.id === id)
      if (feature?.geometry.type === 'LineString') onRouteDrawn(feature as Feature<LineString>)
    })

    return () => map.getMap().removeControl(control)
  }, [map, onRouteDrawn])

  return null
}
```

This must be a child of `react-map-gl`'s `<Map>` so `useMap()` resolves — drop it inside the same `<Map>` block used in Pattern 1, alongside any `<Source>`/`<Layer>` elements.

---

## 4. Point-to-point routing

Turn two or more waypoints into a road-following path. This is the one pattern that needs a server-side proxy: the API key must never reach the browser bundle, and it's also the natural place to enforce the free-tier request budget described in `free-services-tradeoffs.md`.

**`lib/routing/route-provider.ts`** — the interface every provider implements, so swapping OpenRouteService for self-hosted OSRM later means writing one new class, not touching any caller:

```typescript
import type { Feature, LineString } from 'geojson'

export interface RouteWaypoint {
  longitude: number
  latitude: number
}

export interface RouteResult {
  geometry: Feature<LineString>
  distanceMeters: number
  durationSeconds: number
}

export interface IRouteProvider {
  getRoute(waypoints: RouteWaypoint[]): Promise<RouteResult>
}
```

**`lib/routing/open-route-service-provider.ts`** — the production-viable free option:

```typescript
import type { IRouteProvider, RouteResult, RouteWaypoint } from './route-provider'

export class OpenRouteServiceProvider implements IRouteProvider {
  constructor(
    private readonly apiKey: string,
    private readonly profile: 'driving-car' | 'cycling-regular' | 'foot-walking' = 'driving-car',
  ) {}

  async getRoute(waypoints: RouteWaypoint[]): Promise<RouteResult> {
    const coordinates = waypoints.map((waypoint) => [waypoint.longitude, waypoint.latitude])
    const response = await fetch(`https://api.openrouteservice.org/v2/directions/${this.profile}/geojson`, {
      method: 'POST',
      headers: { Authorization: this.apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ coordinates }),
    })
    if (!response.ok) throw new Error(`OpenRouteService request failed: ${response.status}`)
    const data = await response.json()
    const feature = data.features[0]
    return {
      geometry: feature,
      distanceMeters: feature.properties.summary.distance,
      durationSeconds: feature.properties.summary.duration,
    }
  }
}
```

For quick local testing only — never deploy this one — the OSRM public demo server implements the same interface:

```typescript
import type { IRouteProvider, RouteResult, RouteWaypoint } from './route-provider'

export class OsrmLocalDevRouteProvider implements IRouteProvider {
  async getRoute(waypoints: RouteWaypoint[]): Promise<RouteResult> {
    const coordinates = waypoints.map((waypoint) => `${waypoint.longitude},${waypoint.latitude}`).join(';')
    const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`)
    if (!response.ok) throw new Error(`OSRM demo request failed: ${response.status}`)
    const data = await response.json()
    const route = data.routes[0]
    return {
      geometry: { type: 'Feature', properties: {}, geometry: route.geometry },
      distanceMeters: route.distance,
      durationSeconds: route.duration,
    }
  }
}
```

**`app/api/route/route.ts`** — the Next.js Route Handler that keeps the API key server-side:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { OpenRouteServiceProvider } from '@/lib/routing/open-route-service-provider'

const routeProvider = new OpenRouteServiceProvider(process.env.OPENROUTESERVICE_API_KEY!)

export async function POST(request: NextRequest) {
  const { waypoints } = await request.json()
  const result = await routeProvider.getRoute(waypoints)
  return NextResponse.json(result)
}
```

**`hooks/use-route.ts`** — the client-side caller, which never sees the API key:

```typescript
import { useCallback, useState } from 'react'
import type { RouteResult, RouteWaypoint } from '@/lib/routing/route-provider'

export function useRoute() {
  const [result, setResult] = useState<RouteResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchRoute = useCallback(async (waypoints: RouteWaypoint[]) => {
    setIsLoading(true)
    const response = await fetch('/api/route', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ waypoints }),
    })
    const data: RouteResult = await response.json()
    setResult(data)
    setIsLoading(false)
  }, [])

  return { result, isLoading, fetchRoute }
}
```

Feed `result.geometry` into the same `<Source type="geojson"><Layer type="line" /></Source>` pair as Pattern 1 — and if the UI also needs an address search box to pick waypoints, that's Nominatim, governed by the usage policy in `free-services-tradeoffs.md` (1 req/sec hard cap, real `User-Agent` required, no bulk lookups). Read that policy before wiring up the search box, not after it gets rate-limited.
