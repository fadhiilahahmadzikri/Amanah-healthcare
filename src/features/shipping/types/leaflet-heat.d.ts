import 'leaflet';

declare module 'leaflet' {
  type HeatLatLngExpression = [number, number] | [number, number, number];

  interface HeatLayerOptions extends LayerOptions {
    minOpacity?: number;
    maxZoom?: number;
    max?: number;
    radius?: number;
    blur?: number;
    gradient?: Record<number, string>;
  }

  interface HeatLayer extends Layer {
    setLatLngs(latlngs: HeatLatLngExpression[]): this;
    addLatLng(latlng: HeatLatLngExpression): this;
    setOptions(options: HeatLayerOptions): this;
    redraw(): this;
  }

  function heatLayer(latlngs: HeatLatLngExpression[], options?: HeatLayerOptions): HeatLayer;
}
