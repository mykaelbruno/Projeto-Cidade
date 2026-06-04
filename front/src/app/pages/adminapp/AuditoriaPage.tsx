import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Download, Eye, FileSearch, Filter, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { getApiErrorMessage } from '../../services/apiClient';
import { auditoriaService } from '../../services/auditoriaService';
import type { PageResponse } from '../../types/api';
import type { AuditoriaResponseDTO, TipoAcaoAuditoria, TipoAlvoAuditoria } from '../../types/auditoria';

const acoesAuditoria: TipoAcaoAuditoria[] = [
  'USUARIO_CRIADO',
  'USUARIO_ATUALIZADO',
  'USUARIO_ATIVACAO_ALTERADA',
  'ORGANIZACAO_CRIADA',
  'ORGANIZACAO_ATUALIZADA',
  'ORGANIZACAO_ATIVACAO_ALTERADA',
  'USUARIO_INSTITUCIONAL_CRIADO',
  'BAIRRO_CRIADO',
  'BAIRRO_ATUALIZADO',
  'BAIRRO_ATIVACAO_ALTERADA',
  'CATEGORIA_CRIADA',
  'CATEGORIA_ATUALIZADA',
  'CATEGORIA_ATIVACAO_ALTERADA',
  'VINCULO_ATUALIZADO',
  'VINCULO_ORGANIZACAO_ALTERADA',
  'DENUNCIA_STATUS_ALTERADO',
  'DENUNCIA_CONCLUSAO_CONFIRMADA',
  'DENUNCIA_CONCLUSAO_CONTESTADA',
  'DENUNCIA_ARQUIVADA_MODERACAO',
  'COMENTARIO_REMOVIDO_MODERACAO',
  'USUARIO_ADVERTIDO_MODERACAO',
  'USUARIO_SUSPENSO_MODERACAO',
  'USUARIO_REATIVADO_MODERACAO',
  'SINALIZACAO_CRIADA',
  'SINALIZACAO_ANALISADA',
  'TRANSFERENCIA_SOLICITADA',
  'TRANSFERENCIA_APROVADA',
  'TRANSFERENCIA_RECUSADA',
  'RESPONSAVEL_DENUNCIA_ALTERADO',
  'EMAIL_VERIFICADO',
  'SENHA_REDEFINIDA',
];

const alvosAuditoria: TipoAlvoAuditoria[] = [
  'USUARIO',
  'ORGANIZACAO',
  'BAIRRO',
  'CATEGORIA',
  'VINCULO',
  'DENUNCIA',
  'COMENTARIO',
  'SINALIZACAO',
  'SOLICITACAO_TRANSFERENCIA',
];

function labelEnum(value: string | null | undefined) {
  if (!value) {
    return '-';
  }

  return value
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatDate(value: string) {
  return new Date(value).toLocaleString('pt-BR');
}

function csvEscape(value: unknown) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

export function AuditoriaPage() {
  const [pagina, setPagina] = useState<PageResponse<AuditoriaResponseDTO> | null>(null);
  const [acao, setAcao] = useState<TipoAcaoAuditoria | ''>('');
  const [alvoTipo, setAlvoTipo] = useState<TipoAlvoAuditoria | ''>('');
  const [alvoId, setAlvoId] = useState('');
  const [atorId, setAtorId] = useState('');
  const [termoLocal, setTermoLocal] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [detalheSelecionado, setDetalheSelecionado] = useState<AuditoriaResponseDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregarAuditorias = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await auditoriaService.listar({
        acao: acao || null,
        alvoTipo: alvoTipo || null,
        alvoId: alvoId ? Number(alvoId) : null,
        atorId: atorId ? Number(atorId) : null,
        page: paginaAtual,
        size: 20,
      });
      setPagina(response);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [acao, alvoId, alvoTipo, atorId, paginaAtual]);

  useEffect(() => {
    carregarAuditorias();
  }, [carregarAuditorias]);

  const eventos = useMemo(() => {
    const termo = termoLocal.trim().toLowerCase();
    const content = pagina?.content ?? [];

    if (!termo) {
      return content;
    }

    return content.filter((evento) => [
      evento.acao,
      evento.alvoTipo,
      evento.descricao,
      evento.detalhes,
      evento.perfilAtor,
      evento.caminho,
      evento.ip,
      evento.atorId,
      evento.alvoId,
    ].some((value) => String(value ?? '').toLowerCase().includes(termo)));
  }, [pagina, termoLocal]);

  function limparFiltros() {
    setAcao('');
    setAlvoTipo('');
    setAlvoId('');
    setAtorId('');
    setTermoLocal('');
    setPaginaAtual(0);
  }

  function exportarCsv() {
    const header = ['id', 'acao', 'alvoTipo', 'alvoId', 'atorId', 'perfilAtor', 'descricao', 'detalhes', 'metodoHttp', 'caminho', 'ip', 'criadoEm'];
    const rows = eventos.map((evento) => [
      evento.id,
      evento.acao,
      evento.alvoTipo,
      evento.alvoId,
      evento.atorId,
      evento.perfilAtor,
      evento.descricao,
      evento.detalhes,
      evento.metodoHttp,
      evento.caminho,
      evento.ip,
      evento.criadoEm,
    ]);
    const csv = [header, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'auditoria-cidade-ativa.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  const totalElements = pagina?.totalElements ?? 0;
  const totalPages = pagina?.totalPages ?? 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">
            Auditoria Geral
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Consulte eventos registrados pelo backend para usuarios, organizacoes, denuncias e moderacao.
          </p>
        </div>

        <Button variant="outline" onClick={carregarAuditorias} disabled={isLoading}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-100 rounded-lg">
              <FileSearch className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <div className="text-2xl font-display font-bold text-foreground">
                {totalElements}
              </div>
              <div className="text-xs text-muted-foreground">
                Eventos encontrados
              </div>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="text-sm text-muted-foreground mb-1">Pagina atual</div>
          <div className="text-2xl font-display font-bold text-foreground">
            {totalPages === 0 ? 0 : paginaAtual + 1}
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="text-sm text-muted-foreground mb-1">Exibidos nesta pagina</div>
          <div className="text-2xl font-display font-bold text-foreground">
            {eventos.length}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex flex-col gap-3 lg:flex-row">
          <input
            type="text"
            placeholder="Filtrar na pagina atual por descricao, ator, alvo ou IP..."
            value={termoLocal}
            onChange={(event) => setTermoLocal(event.target.value)}
            className="flex-1 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Button variant="outline" onClick={() => setShowFilterPanel((current) => !current)}>
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline" onClick={exportarCsv} disabled={eventos.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Exportar pagina
          </Button>
        </div>

        {showFilterPanel && (
          <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Acao</label>
              <select
                value={acao}
                onChange={(event) => {
                  setAcao(event.target.value as TipoAcaoAuditoria | '');
                  setPaginaAtual(0);
                }}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Todas</option>
                {acoesAuditoria.map((item) => (
                  <option key={item} value={item}>{labelEnum(item)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Tipo de alvo</label>
              <select
                value={alvoTipo}
                onChange={(event) => {
                  setAlvoTipo(event.target.value as TipoAlvoAuditoria | '');
                  setPaginaAtual(0);
                }}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Todos</option>
                {alvosAuditoria.map((item) => (
                  <option key={item} value={item}>{labelEnum(item)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">ID do alvo</label>
              <input
                type="number"
                value={alvoId}
                onChange={(event) => {
                  setAlvoId(event.target.value);
                  setPaginaAtual(0);
                }}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">ID do ator</label>
              <input
                type="number"
                value={atorId}
                onChange={(event) => {
                  setAtorId(event.target.value);
                  setPaginaAtual(0);
                }}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="w-full" onClick={limparFiltros}>
                Limpar
              </Button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      <div className="hidden lg:block bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Acao</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Alvo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Ator</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Descricao</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Metodo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">IP</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Data</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    Carregando eventos...
                  </td>
                </tr>
              )}

              {!isLoading && eventos.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    Nenhum evento encontrado.
                  </td>
                </tr>
              )}

              {!isLoading && eventos.map((evento) => (
                <tr key={evento.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">
                    {labelEnum(evento.acao)}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {labelEnum(evento.alvoTipo)} #{evento.alvoId ?? '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    #{evento.atorId ?? '-'}
                    {evento.perfilAtor && (
                      <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        {evento.perfilAtor}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground max-w-md">
                    <span className="line-clamp-2">{evento.descricao}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded text-xs font-mono font-medium bg-muted text-muted-foreground">
                      {evento.metodoHttp ?? '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground font-mono">
                    {evento.ip ?? '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {formatDate(evento.criadoEm)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end">
                      <button
                        onClick={() => setDetalheSelecionado(evento)}
                        className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                        title="Ver detalhes"
                      >
                        <Eye className="w-4 h-4 text-foreground" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-border flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Pagina {totalPages === 0 ? 0 : paginaAtual + 1} de {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={paginaAtual === 0 || isLoading}
              onClick={() => setPaginaAtual((current) => Math.max(0, current - 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={paginaAtual >= totalPages - 1 || totalPages === 0 || isLoading}
              onClick={() => setPaginaAtual((current) => current + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="lg:hidden space-y-3">
        {isLoading && (
          <div className="bg-card rounded-xl border border-border p-4 text-sm text-muted-foreground">
            Carregando eventos...
          </div>
        )}

        {!isLoading && eventos.map((evento) => (
          <button
            key={evento.id}
            onClick={() => setDetalheSelecionado(evento)}
            className="w-full text-left bg-card rounded-xl border border-border p-4"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <h3 className="text-sm font-medium text-foreground">{labelEnum(evento.acao)}</h3>
                <p className="text-xs text-muted-foreground">
                  {labelEnum(evento.alvoTipo)} #{evento.alvoId ?? '-'}
                </p>
              </div>
              <span className="px-2 py-1 rounded text-xs font-mono font-medium bg-muted text-muted-foreground">
                {evento.metodoHttp ?? '-'}
              </span>
            </div>
            <p className="text-sm text-foreground line-clamp-2">{evento.descricao}</p>
            <p className="text-xs text-muted-foreground mt-2">{formatDate(evento.criadoEm)}</p>
          </button>
        ))}
      </div>

      {detalheSelecionado && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setDetalheSelecionado(null)}>
          <div className="bg-card rounded-xl border border-border shadow-2xl w-full max-w-2xl p-6 space-y-4" onClick={(event) => event.stopPropagation()}>
            <div>
              <h3 className="text-lg font-display font-semibold text-foreground">
                {labelEnum(detalheSelecionado.acao)}
              </h3>
              <p className="text-sm text-muted-foreground">
                Evento #{detalheSelecionado.id} em {formatDate(detalheSelecionado.criadoEm)}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <Info label="Alvo" value={`${labelEnum(detalheSelecionado.alvoTipo)} #${detalheSelecionado.alvoId ?? '-'}`} />
              <Info label="Ator" value={`#${detalheSelecionado.atorId ?? '-'} ${detalheSelecionado.perfilAtor ?? ''}`.trim()} />
              <Info label="Metodo" value={detalheSelecionado.metodoHttp ?? '-'} />
              <Info label="IP" value={detalheSelecionado.ip ?? '-'} />
              <Info label="Caminho" value={detalheSelecionado.caminho ?? '-'} />
            </div>

            <div className="space-y-2 text-sm">
              <p className="font-medium text-foreground">Descricao</p>
              <p className="text-muted-foreground whitespace-pre-wrap">{detalheSelecionado.descricao}</p>
            </div>

            {detalheSelecionado.detalhes && (
              <div className="space-y-2 text-sm">
                <p className="font-medium text-foreground">Detalhes</p>
                <p className="text-muted-foreground whitespace-pre-wrap">{detalheSelecionado.detalhes}</p>
              </div>
            )}

            <div className="flex justify-end">
              <Button onClick={() => setDetalheSelecionado(null)}>Fechar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted/50 rounded-lg p-3">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-foreground break-words">{value}</p>
    </div>
  );
}
