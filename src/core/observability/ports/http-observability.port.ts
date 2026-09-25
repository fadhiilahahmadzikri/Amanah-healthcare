import type {
  HttpRequestEvent,
  HttpResponseEvent,
  HttpErrorEvent,
  ObservableRequest,
  ObservableResponse,
  ObservableContext
} from '../models/http-event.types';

export interface IHttpObservabilityAdapter {
  onIncomingRequest(
    req: ObservableRequest,
    params?: Record<string, string | string[]>
  ): ObservableContext;
  onResponse(ctx: ObservableContext, res: ObservableResponse): void;
  onError(
    ctx: ObservableContext,
    error: unknown,
    statusCode?: number,
    responseBody?: unknown
  ): void;
  logRequestEvent(event: HttpRequestEvent): void;
  logResponseEvent(event: HttpResponseEvent): void;
  logErrorEvent(event: HttpErrorEvent): void;
}
