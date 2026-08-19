'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { geocodeStructuredLocation } from '../api/service';
import type { StructuredLocationRequest } from '../api/types';
import {
  createBoundaryFromStructured,
  type BoundaryPreview,
  type BoundarySource
} from '../utils/location-map';
import { useDebouncedValue } from './use-debounced-value';

type HoverRequest = {
  key: string;
  request: StructuredLocationRequest;
  source: BoundarySource;
};

type UseBoundaryPreviewOptions = {
  delayMs?: number;
  onFocusBoundary: (boundary: BoundaryPreview) => void;
};

export function useBoundaryPreview({ delayMs = 500, onFocusBoundary }: UseBoundaryPreviewOptions) {
  const [peekBoundary, setPeekBoundary] = useState<BoundaryPreview | null>(null);
  const [hoverRequest, setHoverRequest] = useState<HoverRequest | null>(null);
  const debouncedHoverRequest = useDebouncedValue(hoverRequest, delayMs);
  const requestIdRef = useRef(0);

  const previewStructuredLocation = useCallback(
    (request: StructuredLocationRequest, source: BoundarySource, label: string) => {
      setHoverRequest({
        key: createHoverKey(request, source, label),
        request,
        source
      });
    },
    []
  );

  const previewBoundary = useCallback(
    (boundary: BoundaryPreview) => {
      setHoverRequest(null);
      setPeekBoundary(boundary);
      onFocusBoundary(boundary);
    },
    [onFocusBoundary]
  );

  const clearPreview = useCallback(() => {
    setHoverRequest(null);
    setPeekBoundary(null);
  }, []);

  useEffect(() => {
    if (!debouncedHoverRequest) {
      return;
    }

    const currentHoverRequest = debouncedHoverRequest;
    const controller = new AbortController();
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    async function fetchPreview() {
      try {
        const result = await geocodeStructuredLocation(currentHoverRequest.request, {
          signal: controller.signal
        });

        if (!result || requestIdRef.current !== requestId) {
          return;
        }

        const boundary = createBoundaryFromStructured(result, currentHoverRequest.source);
        setPeekBoundary(boundary);
        onFocusBoundary(boundary);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
      }
    }

    fetchPreview();

    return () => {
      controller.abort();
    };
  }, [debouncedHoverRequest, onFocusBoundary]);

  return {
    peekBoundary,
    setPeekBoundary,
    previewStructuredLocation,
    previewBoundary,
    clearPreview
  };
}

function createHoverKey(
  request: StructuredLocationRequest,
  source: BoundarySource,
  label: string
): string {
  return [
    source,
    label,
    request.query,
    request.city,
    request.state,
    request.country,
    request.countryCode
  ]
    .map((part) => part?.trim().toLowerCase() ?? '')
    .join('|');
}
