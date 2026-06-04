import { MapPin, ThumbsUp, AlertTriangle, MessageCircle, Clock, Flag, Image as ImageIcon } from 'lucide-react';

export interface Report {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  location: string;
  neighborhood: string;
  supports: number;
  urgencies: number;
  comments: number;
  timeAgo: string;
  image?: string;
  supportedByUser?: boolean;
  urgentByUser?: boolean;
  feedReason?: string;
  feedScore?: number;
}

interface ReportCardProps {
  report: Report;
  onSupport?: () => void;
  onUrgent?: () => void;
  onReport?: () => void;
  onClick?: () => void;
}

const categoryColors: Record<string, string> = {
  Mobilidade: 'bg-blue-100 text-blue-700',
  Iluminacao: 'bg-amber-100 text-amber-700',
  Limpeza: 'bg-sky-100 text-sky-700',
  'Agua e esgoto': 'bg-cyan-100 text-cyan-700',
  Saude: 'bg-rose-100 text-rose-700',
  'Meio ambiente': 'bg-emerald-100 text-emerald-700',
};

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

export function ReportCard({ report, onSupport, onUrgent, onReport, onClick }: ReportCardProps) {
  return (
    <div
      className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow cursor-pointer relative flex flex-col"
      onClick={onClick}
    >
      <button
        onClick={(event) => {
          event.stopPropagation();
          onReport?.();
        }}
        className="absolute top-3 right-3 z-[1] w-9 h-9 rounded-full bg-card/95 border border-border shadow-sm flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/5 transition-colors"
        title="Denunciar relato"
      >
        <Flag className="w-4 h-4" />
      </button>

      <div className="aspect-video bg-muted relative overflow-hidden border-b border-border">
        {report.image ? (
          <img
            src={report.image}
            alt={report.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-100 via-sky-50 to-emerald-50 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <div className="w-12 h-12 rounded-full bg-card/85 border border-border shadow-sm flex items-center justify-center">
              <ImageIcon className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium">Relato sem foto</span>
          </div>
        )}
      </div>

      <div className="p-4 space-y-3 flex flex-col flex-1">
        <div className="flex items-start gap-2 flex-wrap pr-10">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${categoryColors[report.category] || 'bg-gray-100 text-gray-700'}`}>
            {report.category}
          </span>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[report.status] || 'bg-gray-100 text-gray-700'}`}>
            {report.status}
          </span>
        </div>

        <div>
          <h3 className="font-display font-semibold text-foreground mb-1">
            {report.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {report.description}
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span className="line-clamp-1">{report.location}, {report.neighborhood}</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          <span>{report.timeAgo}</span>
          {report.feedReason && (
            <span className="hidden sm:inline text-muted-foreground/80">- {report.feedReason}</span>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 pt-3 border-t border-border mt-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={(event) => {
                event.stopPropagation();
                onSupport?.();
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                report.supportedByUser
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
              }`}
              title={report.supportedByUser ? 'Remover apoio' : 'Apoiar relato'}
            >
              <ThumbsUp className="w-4 h-4" />
              <span>{report.supports}</span>
            </button>
            <button
              onClick={(event) => {
                event.stopPropagation();
                onUrgent?.();
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                report.urgentByUser
                  ? 'bg-amber-500 text-white'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200'
              }`}
              title={report.urgentByUser ? 'Remover urgencia' : 'Marcar como urgente'}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>{report.urgencies}</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MessageCircle className="w-4 h-4" />
            <span className="font-medium">{report.comments}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
