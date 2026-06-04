import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent, WheelEvent } from 'react';
import { useNavigate } from 'react-router';
import {
  Bell,
  Plus,
  Layers,
  Navigation,
  MapPin,
  ArrowLeft,
  X,
  ThumbsUp,
  AlertTriangle,
  MessageCircle,
  Clock,
  User,
  LogOut,
  UserCircle,
  RefreshCw,
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { NotificationsDrawer } from '../components/NotificationsDrawer';
import { Button } from '../components/ui/button';
import { mapFeedItemToReport } from '../mappers/denunciaMapper';
import { getApiErrorMessage } from '../services/apiClient';
import { feedService } from '../services/feedService';
import { useUser } from '../contexts/UserContext';
import type { Report } from '../components/ReportCard';
import type { DenunciaResponseDTO } from '../types/denuncia';

interface MapReport extends Report {
  denuncia: DenunciaResponseDTO;
  latitude: number;
  longitude: number;
  cidade: string;
}

interface ReportPosition {
  report: MapReport;
  x: number;
  y: number;
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

const markerPalette = [
  'bg-blue-600',
  'bg-amber-500',
  'bg-sky-500',
  'bg-cyan-500',
  'bg-rose-500',
  'bg-emerald-500',
  'bg-purple-500',
  'bg-indigo-500',
];

const statusColors: Record<string, string> = {
  Aberto: 'bg-slate-100 text-slate-700',
  'Em analise': 'bg-blue-100 text-blue-700',
  Encaminhado: 'bg-purple-100 text-purple-700',
  'Em andamento': 'bg-amber-100 text-amber-700',
  Programado: 'bg-indigo-100 text-indigo-700',
  Concluido: 'bg-green-100 text-green-700',
  Reaberto: 'bg-orange-100 text-orange-700',
  Arquivado: 'bg-zinc-100 text-zinc-700',
};

const tileSize = 256;
const defaultMapView: MapView = {
  centerLat: -6.838,
  centerLng: -35.126,
  zoom: 14,
};

function categoryColor(category: string) {
  let hash = 0;
  for (const char of category) {
    hash = char.charCodeAt(0) + ((hash << 5) - hash);
  }

  return markerPalette[Math.abs(hash) % markerPalette.length];
}

function buildBounds(reports: MapReport[]) {
  if (reports.length === 0) {
    return null;
  }

  const latitudes = reports.map((item) => item.latitude);
  const longitudes = reports.map((item) => item.longitude);
  let minLat = Math.min(...latitudes);
  let maxLat = Math.max(...latitudes);
  let minLng = Math.min(...longitudes);
  let maxLng = Math.max(...longitudes);

  if (minLat === maxLat) {
    minLat -= 0.004;
    maxLat += 0.004;
  }

  if (minLng === maxLng) {
    minLng -= 0.004;
    maxLng += 0.004;
  }

  const latPadding = (maxLat - minLat) * 0.25;
  const lngPadding = (maxLng - minLng) * 0.25;

  return {
    minLat: minLat - latPadding,
    maxLat: maxLat + latPadding,
    minLng: minLng - lngPadding,
    maxLng: maxLng + lngPadding,
  };
}

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

function fitViewToReports(reports: MapReport[], size: MapSize): MapView {
  const bounds = buildBounds(reports);
  if (!bounds || size.width === 0 || size.height === 0) {
    return defaultMapView;
  }

  const centerLat = (bounds.minLat + bounds.maxLat) / 2;
  const centerLng = (bounds.minLng + bounds.maxLng) / 2;

  for (let zoom = 17; zoom >= 10; zoom -= 1) {
    const northWest = projectLatLng(bounds.maxLat, bounds.minLng, zoom);
    const southEast = projectLatLng(bounds.minLat, bounds.maxLng, zoom);

    if (
      Math.abs(southEast.x - northWest.x) <= size.width * 0.78 &&
      Math.abs(southEast.y - northWest.y) <= size.height * 0.78
    ) {
      return { centerLat, centerLng, zoom };
    }
  }

  return { centerLat, centerLng, zoom: 10 };
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

function positionReports(reports: MapReport[], view: MapView, size: MapSize): ReportPosition[] {
  if (size.width === 0 || size.height === 0) {
    return [];
  }

  const center = projectLatLng(view.centerLat, view.centerLng, view.zoom);

  return reports.map((report) => {
    const point = projectLatLng(report.latitude, report.longitude, view.zoom);

    return {
      report,
      x: size.width / 2 + point.x - center.x,
      y: size.height / 2 + point.y - center.y,
    };
  });
}

export function MapPage() {
  const navigate = useNavigate();
  const { usuario, logout } = useUser();
  const mapRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    center: WorldPoint;
  } | null>(null);
  const [reports, setReports] = useState<MapReport[]>([]);
  const [totalLoaded, setTotalLoaded] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedReport, setSelectedReport] = useState<MapReport | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapSize, setMapSize] = useState<MapSize>({ width: 0, height: 0 });
  const [mapView, setMapView] = useState<MapView>(defaultMapView);

  const carregarMapa = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await feedService.listarDenuncias({
        cidade: usuario?.cidade,
        modo: 'MISTO',
        page: 0,
        size: 80,
      });

      setTotalLoaded(response.content.length);
      setReports(
        response.content
          .filter((item) => item.denuncia.latitude !== null && item.denuncia.longitude !== null)
          .map((item) => ({
            ...mapFeedItemToReport(item),
            denuncia: item.denuncia,
            latitude: item.denuncia.latitude as number,
            longitude: item.denuncia.longitude as number,
            cidade: item.denuncia.cidade,
          })),
      );
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [usuario?.cidade]);

  useEffect(() => {
    carregarMapa();
  }, [carregarMapa]);

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

  const reportsWithImages = reports;

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    reportsWithImages.forEach((report) => {
      counts.set(report.category, (counts.get(report.category) ?? 0) + 1);
    });

    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count, color: categoryColor(name) }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [reportsWithImages]);

  const filteredReports = useMemo(
    () => selectedCategories.length === 0
      ? reportsWithImages
      : reportsWithImages.filter((report) => selectedCategories.includes(report.category)),
    [reportsWithImages, selectedCategories],
  );

  useEffect(() => {
    if (reportsWithImages.length === 0 || mapSize.width === 0 || mapSize.height === 0) {
      return;
    }

    setMapView(fitViewToReports(reportsWithImages, mapSize));
  }, [reportsWithImages, mapSize.height, mapSize.width]);

  const visibleTiles = useMemo(() => getVisibleTiles(mapView, mapSize), [mapSize, mapView]);
  const reportPositions = useMemo(() => positionReports(filteredReports, mapView, mapSize), [filteredReports, mapSize, mapView]);
  const visibleReportPositions = useMemo(
    () => reportPositions.filter((position) => (
      position.x >= -40 &&
      position.x <= mapSize.width + 40 &&
      position.y >= -40 &&
      position.y <= mapSize.height + 40
    )),
    [mapSize.height, mapSize.width, reportPositions],
  );
  const selectedPosition = selectedReport
    ? reportPositions.find((position) => position.report.id === selectedReport.id)
    : null;
  const cidadeLabel = usuario?.cidade || reportsWithImages[0]?.cidade || 'Cidade';
  const missingCoordinates = Math.max(totalLoaded - reports.length, 0);
  const urgentCount = reportsWithImages.filter((report) => report.urgencies > 0).length;
  const solvedCount = reportsWithImages.filter((report) => report.status === 'Concluido').length;

  function toggleCategory(category: string) {
    setSelectedReport(null);
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category],
    );
  }

  function recenterMap() {
    if (filteredReports.length > 0) {
      setMapView(fitViewToReports(filteredReports, mapSize));
    }
  }

  function zoomMap(delta: number) {
    setSelectedReport(null);
    setMapView((current) => ({
      ...current,
      zoom: Math.max(10, Math.min(18, current.zoom + delta)),
    }));
  }

  function handleWheel(event: WheelEvent<HTMLDivElement>) {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -1 : 1;
    zoomMap(delta);
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
    };
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) {
      return;
    }

    const deltaX = event.clientX - dragRef.current.startX;
    const deltaY = event.clientY - dragRef.current.startY;
    const nextCenter = unprojectPoint({
      x: dragRef.current.center.x - deltaX,
      y: dragRef.current.center.y - deltaY,
    }, mapView.zoom);

    setSelectedReport(null);
    setMapView((current) => ({
      ...current,
      centerLat: nextCenter.latitude,
      centerLng: nextCenter.longitude,
    }));
  }

  function handlePointerEnd(event: PointerEvent<HTMLDivElement>) {
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <div className="flex-1 pb-20 md:pb-0">
      <header className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
          <Logo size="md" showText={true} />
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsNotificationsOpen(true)}
              className="relative p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5 text-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
            </button>
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <User className="w-5 h-5 text-foreground" />
              </button>

              {isProfileOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsProfileOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
                    <div className="p-4 border-b border-border">
                      <p className="text-sm font-medium text-foreground">
                        Ola, <span className="font-semibold">{usuario?.nome ?? 'morador'}</span>!
                      </p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          navigate('/perfil');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors text-left"
                      >
                        <UserCircle className="w-4 h-4 text-foreground" />
                        <span className="text-sm font-medium text-foreground">Perfil</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-destructive/10 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4 text-destructive" />
                        <span className="text-sm font-medium text-destructive">Sair</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/feed')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Voltar ao feed</span>
            </button>
            <div className="w-px h-6 bg-border hidden sm:block" />
            <h1 className="text-2xl font-display font-bold text-foreground">
              Mapa da Cidade
            </h1>
          </div>

          <button
            onClick={() => navigate('/novo-relato')}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-opacity shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Novo relato
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
              <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    {cidadeLabel}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                    title="Camada do mapa"
                  >
                    <Layers className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={recenterMap}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                    title="Centralizar nos relatos"
                  >
                    <Navigation className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>

              <div
                ref={mapRef}
                className="relative h-[620px] bg-muted overflow-hidden touch-none select-none cursor-grab active:cursor-grabbing"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerEnd}
                onPointerCancel={handlePointerEnd}
                onWheel={handleWheel}
              >
                {isLoading && (
                  <div className="absolute inset-0 z-20 bg-background/80 flex items-center justify-center">
                    <div className="bg-card border border-border rounded-xl px-5 py-4 text-sm text-muted-foreground shadow-sm">
                      Carregando relatos no mapa...
                    </div>
                  </div>
                )}

                {!isLoading && error && (
                  <div className="absolute inset-0 z-20 bg-background/90 flex items-center justify-center p-6">
                    <div className="bg-card border border-border rounded-xl p-6 text-center max-w-md shadow-sm space-y-4">
                      <p className="text-destructive">{error}</p>
                      <Button onClick={carregarMapa}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Tentar novamente
                      </Button>
                    </div>
                  </div>
                )}

                {!isLoading && !error && reportsWithImages.length === 0 && (
                  <div className="absolute inset-0 z-20 bg-background/90 flex items-center justify-center p-6">
                    <div className="bg-card border border-border rounded-xl p-6 text-center max-w-md shadow-sm space-y-2">
                      <MapPin className="w-8 h-8 text-muted-foreground mx-auto" />
                      <h2 className="font-display font-semibold text-foreground">
                        Nenhum relato com localizacao no mapa
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Os relatos carregados nao possuem latitude e longitude cadastradas.
                      </p>
                    </div>
                  </div>
                )}

                {visibleTiles.length > 0 ? (
                  <div className="absolute inset-0">
                    {visibleTiles.map((tile) => (
                      <img
                        key={tile.key}
                        src={tile.url}
                        alt=""
                        draggable={false}
                        className="absolute w-64 h-64 max-w-none"
                        style={{
                          left: tile.left,
                          top: tile.top,
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-sky-50 to-emerald-50" />
                )}

                <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-background/5 to-transparent" />

                <div className="absolute right-3 top-3 z-40 flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                  <button
                    type="button"
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={(event) => {
                      event.stopPropagation();
                      zoomMap(1);
                    }}
                    className="w-10 h-10 text-lg font-semibold hover:bg-muted border-b border-border"
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
                    className="w-10 h-10 text-lg font-semibold hover:bg-muted"
                    title="Afastar"
                  >
                    -
                  </button>
                </div>

                <div className="absolute left-3 bottom-3 z-20 rounded-lg bg-card/95 border border-border px-3 py-1.5 text-[11px] text-muted-foreground shadow-sm">
                  © OpenStreetMap contributors
                </div>

                {visibleReportPositions.map(({ report, x, y }) => {
                  const bgColor = categoryColor(report.category);
                  const isSelected = selectedReport?.id === report.id;

                  return (
                    <button
                      key={report.id}
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedReport(report);
                      }}
                      className="absolute -translate-x-1/2 -translate-y-full group z-10"
                      style={{ left: x, top: y }}
                    >
                      <div className="relative">
                        <div
                          className={`w-10 h-10 ${bgColor} rounded-full shadow-lg flex items-center justify-center group-hover:scale-110 transition-all ${
                            isSelected ? 'ring-4 ring-primary scale-125' : 'ring-4 ring-white'
                          }`}
                        >
                          <MapPin className="w-5 h-5 text-white" />
                        </div>
                        <div className={`w-3 h-3 ${bgColor} rotate-45 -mt-1.5 mx-auto`} />

                        {report.urgencies > 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white">
                            !
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}

                {selectedReport && selectedPosition && (
                  <>
                    <div
                      className="absolute inset-0 bg-black/10 z-20"
                      onClick={() => setSelectedReport(null)}
                    />

                    <div
                      className="absolute z-30 animate-in fade-in zoom-in-95 duration-200"
                      style={{
                        width: '320px',
                        maxWidth: 'calc(100% - 48px)',
                        left: selectedPosition.x < mapSize.width / 2 ? selectedPosition.x : 'auto',
                        right: selectedPosition.x >= mapSize.width / 2 ? mapSize.width - selectedPosition.x : 'auto',
                        top: selectedPosition.y < mapSize.height / 2 ? selectedPosition.y + 16 : 'auto',
                        bottom: selectedPosition.y >= mapSize.height / 2 ? mapSize.height - selectedPosition.y + 16 : 'auto',
                        transform: selectedPosition.x < mapSize.width / 2 ? 'translateX(-35%)' : 'translateX(35%)',
                      }}
                    >
                      <div className="bg-card rounded-xl shadow-2xl border-2 border-primary/20 overflow-hidden relative">
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedReport(null);
                          }}
                          className="absolute top-2 right-2 z-10 w-7 h-7 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                        >
                          <X className="w-3.5 h-3.5 text-white" />
                        </button>

                        {selectedReport.image && (
                          <div className="h-32 bg-muted relative overflow-hidden">
                            <img
                              src={selectedReport.image}
                              alt={selectedReport.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        <div className="p-3 space-y-2.5">
                          <div className="flex items-start gap-1.5 flex-wrap pr-8">
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                              {selectedReport.category}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              statusColors[selectedReport.status] || 'bg-gray-100 text-gray-700'
                            }`}>
                              {selectedReport.status}
                            </span>
                          </div>

                          <div>
                            <h3 className="font-display font-semibold text-sm text-foreground mb-0.5 line-clamp-2">
                              {selectedReport.title}
                            </h3>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {selectedReport.description}
                            </p>
                          </div>

                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            <span className="line-clamp-1">{selectedReport.location}, {selectedReport.neighborhood}</span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-muted-foreground pt-2 border-t border-border">
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="w-3.5 h-3.5" />
                              <span className="font-medium">{selectedReport.supports}</span>
                            </div>
                            {selectedReport.urgencies > 0 && (
                              <div className="flex items-center gap-1 text-amber-600">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span className="font-medium">{selectedReport.urgencies}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span className="font-medium">{selectedReport.comments}</span>
                            </div>
                            <div className="flex items-center gap-1 ml-auto">
                              <Clock className="w-3 h-3" />
                              <span className="text-xs">{selectedReport.timeAgo}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => navigate(`/relato/${selectedReport.id}`)}
                            className="w-full px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                          >
                            Ver detalhes completos
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <h3 className="font-display font-semibold text-foreground mb-4">
                Estatisticas
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">No mapa</span>
                  <span className="text-lg font-bold text-foreground">{reportsWithImages.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Urgentes</span>
                  <span className="text-lg font-bold text-amber-600">{urgentCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Resolvidos</span>
                  <span className="text-lg font-bold text-green-600">{solvedCount}</span>
                </div>
                {missingCoordinates > 0 && (
                  <div className="pt-3 border-t border-border text-xs text-muted-foreground">
                    {missingCoordinates} relato{missingCoordinates === 1 ? '' : 's'} nao aparece{missingCoordinates === 1 ? '' : 'm'} no mapa por falta de coordenadas.
                  </div>
                )}
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-foreground">
                  Filtrar por categoria
                </h3>
                {selectedCategories.length > 0 && (
                  <button
                    onClick={() => {
                      setSelectedCategories([]);
                      setSelectedReport(null);
                    }}
                    className="text-xs text-primary hover:underline"
                  >
                    Limpar
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {categories.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma categoria com relatos geolocalizados.
                  </p>
                )}

                {categories.map((category) => (
                  <button
                    key={category.name}
                    onClick={() => toggleCategory(category.name)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
                      selectedCategories.includes(category.name) || selectedCategories.length === 0
                        ? 'bg-muted hover:bg-muted/80'
                        : 'opacity-50 hover:opacity-70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${category.color}`} />
                      <span className="text-sm font-medium text-foreground">
                        {category.name}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <h3 className="font-display font-semibold text-foreground mb-4">
                Legenda
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-4 h-4 bg-primary rounded-full" />
                  <span className="text-muted-foreground">Relato no mapa</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="relative w-4 h-4 bg-primary rounded-full">
                    <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full" />
                  </div>
                  <span className="text-muted-foreground">Relato urgente</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </div>
  );
}
