import { useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent, WheelEvent } from 'react';
import { Loader2, MapPin, Navigation } from 'lucide-react';
import { Button } from './ui/button';

interface LocationPickerMapProps {
  centerLatitude: number;
  centerLongitude: number;
  markerLatitude: number | null;
  markerLongitude: number | null;
  isUpdating?: boolean;
  onPick: (latitude: number, longitude: number) => void;
}

interface MapView {
  centerLat: number;
  centerLng: number;
  zoom: number;
}

interface MapSize {
  width: number;
  height: number;
}

interface WorldPoint {
  x: number;
  y: number;
}

interface MapTile {
  key: string;
  url: string;
  left: number;
  top: number;
}

const tileSize = 256;
const defaultZoom = 15;

function projectLatLng(latitude: number, longitude: number, zoom: number): WorldPoint {
  const scale = tileSize * 2 ** zoom;
  const safeLat = Math.max(Math.min(latitude, 85.05112878), -85.05112878);
  const sin = Math.sin((safeLat * Math.PI) / 180);

  return {
    x: ((longitude + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale,
  };
}

function unprojectPoint(point: WorldPoint, zoom: number) {
  const scale = tileSize * 2 ** zoom;
  const longitude = (point.x / scale) * 360 - 180;
  const n = Math.PI - (2 * Math.PI * point.y) / scale;
  const latitude = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));

  return {
    latitude,
    longitude,
  };
}

function getVisibleTiles(view: MapView, size: MapSize): MapTile[] {
  if (size.width === 0 || size.height === 0) {
    return [];
  }

  const center = projectLatLng(view.centerLat, view.centerLng, view.zoom);
  const topLeft = {
    x: center.x - size.width / 2,
    y: center.y - size.height / 2,
  };
  const tilesPerAxis = 2 ** view.zoom;
  const minTileX = Math.floor(topLeft.x / tileSize) - 1;
  const maxTileX = Math.floor((topLeft.x + size.width) / tileSize) + 1;
  const minTileY = Math.floor(topLeft.y / tileSize) - 1;
  const maxTileY = Math.floor((topLeft.y + size.height) / tileSize) + 1;
  const tiles: MapTile[] = [];

  for (let tileX = minTileX; tileX <= maxTileX; tileX += 1) {
    for (let tileY = minTileY; tileY <= maxTileY; tileY += 1) {
      if (tileY < 0 || tileY >= tilesPerAxis) {
        continue;
      }

      const wrappedX = ((tileX % tilesPerAxis) + tilesPerAxis) % tilesPerAxis;

      tiles.push({
        key: `${view.zoom}-${tileX}-${tileY}`,
        url: `https://tile.openstreetmap.org/${view.zoom}/${wrappedX}/${tileY}.png`,
        left: tileX * tileSize - topLeft.x,
        top: tileY * tileSize - topLeft.y,
      });
    }
  }

  return tiles;
}

function getMarkerPosition(
  latitude: number | null,
  longitude: number | null,
  view: MapView,
  size: MapSize,
) {
  if (latitude === null || longitude === null || size.width === 0 || size.height === 0) {
    return null;
  }

  const center = projectLatLng(view.centerLat, view.centerLng, view.zoom);
  const point = projectLatLng(latitude, longitude, view.zoom);

  return {
    x: size.width / 2 + point.x - center.x,
    y: size.height / 2 + point.y - center.y,
  };
}

export function LocationPickerMap({
  centerLatitude,
  centerLongitude,
  markerLatitude,
  markerLongitude,
  isUpdating = false,
  onPick,
}: LocationPickerMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    center: WorldPoint;
    moved: boolean;
  } | null>(null);
  const [mapSize, setMapSize] = useState<MapSize>({ width: 0, height: 0 });
  const [mapView, setMapView] = useState<MapView>({
    centerLat: centerLatitude,
    centerLng: centerLongitude,
    zoom: defaultZoom,
  });

  useEffect(() => {
    const element = mapRef.current;
    if (!element) {
      return undefined;
    }

    const updateSize = () => {
      setMapSize({
        width: element.clientWidth,
        height: element.clientHeight,
      });
    };

    const observer = new ResizeObserver(updateSize);
    updateSize();
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setMapView((current) => ({
      ...current,
      centerLat: markerLatitude ?? centerLatitude,
      centerLng: markerLongitude ?? centerLongitude,
    }));
  }, [centerLatitude, centerLongitude, markerLatitude, markerLongitude]);

  const visibleTiles = useMemo(() => getVisibleTiles(mapView, mapSize), [mapSize, mapView]);
  const markerPosition = useMemo(
    () => getMarkerPosition(markerLatitude, markerLongitude, mapView, mapSize),
    [mapSize, mapView, markerLatitude, markerLongitude],
  );

  function zoomMap(delta: number) {
    setMapView((current) => ({
      ...current,
      zoom: Math.max(11, Math.min(19, current.zoom + delta)),
    }));
  }

  function recenter() {
    setMapView((current) => ({
      ...current,
      centerLat: markerLatitude ?? centerLatitude,
      centerLng: markerLongitude ?? centerLongitude,
    }));
  }

  function handleWheel(event: WheelEvent<HTMLDivElement>) {
    event.preventDefault();
    zoomMap(event.deltaY > 0 ? -1 : 1);
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      center: projectLatLng(mapView.centerLat, mapView.centerLng, mapView.zoom),
      moved: false,
    };
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) {
      return;
    }

    const deltaX = event.clientX - dragRef.current.startX;
    const deltaY = event.clientY - dragRef.current.startY;

    if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
      dragRef.current.moved = true;
    }

    const nextCenter = unprojectPoint({
      x: dragRef.current.center.x - deltaX,
      y: dragRef.current.center.y - deltaY,
    }, mapView.zoom);

    setMapView((current) => ({
      ...current,
      centerLat: nextCenter.latitude,
      centerLng: nextCenter.longitude,
    }));
  }

  function handlePointerEnd(event: PointerEvent<HTMLDivElement>) {
    const dragState = dragRef.current;
    dragRef.current = null;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (!dragState || dragState.moved || !mapRef.current) {
      return;
    }

    const rect = mapRef.current.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    const center = projectLatLng(mapView.centerLat, mapView.centerLng, mapView.zoom);
    const point = {
      x: center.x - mapSize.width / 2 + clickX,
      y: center.y - mapSize.height / 2 + clickY,
    };
    const selected = unprojectPoint(point, mapView.zoom);

    onPick(selected.latitude, selected.longitude);
  }

  return (
    <div className="space-y-3">
      <div
        ref={mapRef}
        className="relative h-[320px] lg:h-[520px] overflow-hidden rounded-2xl border border-border bg-muted touch-none select-none cursor-crosshair"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onWheel={handleWheel}
      >
        {visibleTiles.length > 0 ? (
          <div className="absolute inset-0">
            {visibleTiles.map((tile) => (
              <img
                key={tile.key}
                src={tile.url}
                alt=""
                draggable={false}
                className="absolute h-64 w-64 max-w-none"
                style={{ left: tile.left, top: tile.top }}
              />
            ))}
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-sky-50 to-emerald-50" />
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/5 to-transparent" />

        {markerPosition && (
          <div
            className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full"
            style={{ left: markerPosition.x, top: markerPosition.y }}
          >
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary shadow-lg ring-4 ring-white">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <div className="-mt-1.5 mx-auto h-3 w-3 rotate-45 bg-primary" />
            </div>
          </div>
        )}

        {isUpdating && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/40 backdrop-blur-[1px]">
            <div className="rounded-xl border border-border bg-card/95 px-4 py-3 text-sm text-muted-foreground shadow-sm">
              <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
              Atualizando endereco...
            </div>
          </div>
        )}

        <div className="absolute right-3 top-3 z-40 flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <button
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              zoomMap(1);
            }}
            className="h-10 w-10 border-b border-border text-lg font-semibold hover:bg-muted"
            title="Aproximar"
          >
            +
          </button>
          <button
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              zoomMap(-1);
            }}
            className="h-10 w-10 text-lg font-semibold hover:bg-muted"
            title="Afastar"
          >
            -
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Clique no mapa para marcar o local exato ou arraste para navegar.
        </p>
        <Button type="button" variant="outline" size="sm" className="gap-2" onClick={recenter}>
          <Navigation className="h-4 w-4" />
          Recentrar
        </Button>
      </div>
    </div>
  );
}
