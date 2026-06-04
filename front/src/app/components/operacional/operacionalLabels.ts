import type { StatusDenuncia } from '../../types/denuncia';

export const statusDenunciaLabels: Record<StatusDenuncia, string> = {
  ABERTO: 'Aberto',
  EM_ANALISE: 'Em analise',
  ENCAMINHADO: 'Encaminhado',
  EM_ANDAMENTO: 'Em andamento',
  PROGRAMADO: 'Programado',
  CONCLUIDO: 'Concluido',
  REABERTO: 'Reaberto',
  ARQUIVADO: 'Arquivado',
};

export const statusDenunciaColors: Record<StatusDenuncia, string> = {
  ABERTO: 'bg-slate-100 text-slate-700',
  EM_ANALISE: 'bg-blue-100 text-blue-700',
  ENCAMINHADO: 'bg-purple-100 text-purple-700',
  EM_ANDAMENTO: 'bg-amber-100 text-amber-800',
  PROGRAMADO: 'bg-indigo-100 text-indigo-700',
  CONCLUIDO: 'bg-green-100 text-green-700',
  REABERTO: 'bg-red-100 text-red-700',
  ARQUIVADO: 'bg-gray-100 text-gray-700',
};

export const statusDenunciaOptions: StatusDenuncia[] = [
  'ABERTO',
  'EM_ANALISE',
  'ENCAMINHADO',
  'EM_ANDAMENTO',
  'PROGRAMADO',
  'CONCLUIDO',
  'REABERTO',
  'ARQUIVADO',
];

export function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function formatPercent(value: number | null | undefined) {
  return `${Math.round((value ?? 0) * 100)}%`;
}

export function formatHours(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return '-';
  }

  if (value >= 24) {
    return `${(value / 24).toFixed(1)} dias`;
  }

  return `${value.toFixed(1)} h`;
}
