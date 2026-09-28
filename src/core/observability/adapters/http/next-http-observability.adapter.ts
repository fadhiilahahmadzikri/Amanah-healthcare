/**
 * @deprecated
 * This file is kept for backward-compatibility with existing import sites
 * (e.g. route-observability.adapter.ts, app API routes).
 *
 * It re-exports from the Node.js adapter because these call-sites run
 * exclusively in the Node.js runtime (API Route Handlers, RSC). They are
 * never bundled for the Edge runtime, so using Node-only APIs here is fine.
 *
 * Do NOT import this file from any code that could be pulled into the Edge
 * bundle (middleware, edge route handlers, instrumentation.ts at the top level).
 *
 * For instrumentation.ts, use the dynamic-import branches in register() instead.
 */
export {
  NodeHttpObservabilityAdapter as NextHttpObservabilityAdapter,
  defaultHttpObservability
} from './next-http-observability.adapter.node';
export type { NextHttpObservabilityConfig } from './next-http-observability.adapter.node';
