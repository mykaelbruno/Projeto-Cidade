import { formatDistanceToNowStrict } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Report } from '../components/ReportCard';
import { getApiUrl } from '../services/apiClient';
import type { DenunciaResponseDTO, FeedDenunciaResponseDTO, StatusDenuncia } from '../types/denuncia';

const statusLabels: Record<StatusDenuncia, string> = {
  ABERTO: 'Aberto',
  EM_ANALISE: 'Em analise',
  ENCAMINHADO: 'Encaminhado',
  EM_ANDAMENTO: 'Em andamento',
  PROGRAMADO: 'Programado',
  CONCLUIDO: 'Concluido',
  REABERTO: 'Reaberto',
  ARQUIVADO: 'Arquivado',
};

function getLocation(denuncia: DenunciaResponseDTO): string {
  return denuncia.rua || denuncia.pontoReferencia || denuncia.cidade || 'Local nao informado';
}

function getTimeAgo(criadoEm: string): string {
  try {
    return `ha ${formatDistanceToNowStrict(new Date(criadoEm), { locale: ptBR })}`;
  } catch {
    return 'data nao informada';
  }
}

export function mapDenunciaToReport(
  denuncia: DenunciaResponseDTO,
  flags?: Pick<FeedDenunciaResponseDTO, 'apoiadaPeloUsuario' | 'urgentePeloUsuario' | 'motivoOrdenacao' | 'pontuacaoFeed'>,
): Report {
  return {
    id: String(denuncia.id),
    title: denuncia.titulo,
    description: denuncia.descricao,
    category: denuncia.categoriaNome,
    status: statusLabels[denuncia.status] ?? denuncia.status,
    location: getLocation(denuncia),
    neighborhood: denuncia.bairro,
    supports: denuncia.quantidadeConfirmacoes,
    urgencies: denuncia.quantidadeUrgencias,
    comments: denuncia.quantidadeComentarios,
    timeAgo: getTimeAgo(denuncia.criadoEm),
    image: denuncia.imagemCapaUrl ? getApiUrl(denuncia.imagemCapaUrl) : undefined,
    supportedByUser: flags?.apoiadaPeloUsuario ?? false,
    urgentByUser: flags?.urgentePeloUsuario ?? false,
    feedReason: flags?.motivoOrdenacao,
    feedScore: flags?.pontuacaoFeed,
  };
}

export function mapFeedItemToReport(item: FeedDenunciaResponseDTO): Report {
  return mapDenunciaToReport(item.denuncia, item);
}

export function mapMinhaDenunciaToReport(denuncia: DenunciaResponseDTO): Report {
  const report = mapDenunciaToReport(denuncia);

  if (denuncia.status === 'CONCLUIDO' && !denuncia.conclusaoConfirmadaEm) {
    return {
      ...report,
      status: 'Aguardando confirmacao',
    };
  }

  return report;
}
