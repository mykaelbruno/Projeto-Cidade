import { MapPin } from 'lucide-react';

interface ReportLocationMapProps {
  latitude: number | null;
  longitude: number | null;
  label: string;
  className?: string;
}

export function ReportLocationMap({ latitude, longitude, label, className = '' }: ReportLocationMapProps) {
  if (latitude === null || longitude === null) {
    return (
      <div className={`h-64 rounded-2xl border border-border bg-muted flex flex-col items-center justify-center gap-3 text-muted-foreground ${className}`}>
        <MapPin className="w-8 h-8" />
        <p className="text-sm font-medium">Localizacao informada por endereco</p>
        <p className="text-xs max-w-xs text-center">{label}</p>
      </div>
    );
  }

  const delta = 0.004;
  const bbox = [
    longitude - delta,
    latitude - delta,
    longitude + delta,
    latitude + delta,
  ].join('%2C');
  const marker = `${latitude}%2C${longitude}`;

  return (
    <div className={`h-64 rounded-2xl border border-border overflow-hidden bg-muted ${className}`}>
      <iframe
        title={`Mapa do relato - ${label}`}
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${marker}`}
        className="w-full h-full"
        loading="lazy"
      />
    </div>
  );
}
