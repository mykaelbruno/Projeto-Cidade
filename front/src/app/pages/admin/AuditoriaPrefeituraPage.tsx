import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Eye, FileSearch, Filter, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { getApiErrorMessage } from '../../services/apiClient';
import { auditoriaService } from '../../services/auditoriaService';
import { useUser } from '../../contexts/UserContext';
import type { PageResponse } from '../../types/api';
import type { AuditoriaResponseDTO, TipoAcaoAuditoria, TipoAlvoAuditoria } from '../../types/auditoria';

const acoesAuditoria: TipoAcaoAuditoria[] = [
  'USUARIO_INSTITUCIONAL_CRIADO',
  'BAIRRO_CRIADO',
  'BAIRRO_ATUALIZADO',
  'BAIRRO_ATIVACAO_ALTERADA',
  'ORGANIZACAO_CRIADA',
  'ORGANIZACAO_ATUALIZADA',
  'ORGANIZACAO_ATIVACAO_ALTERADA',
  'CATEGORIA_ATUALIZADA',
  'VINCULO_ATUALIZADO',
  'VINCULO_ORGANIZACAO_ALTERADA',
  'DENUNCIA_STATUS_ALTERADO',
  'TRANSFERENCIA_SOLICITADA',
  'TRANSFERENCIA_APROVADA',
  'TRANSFERENCIA_RECUSADA',
  'RESPONSAVEL_DENUNCIA_ALTERADO',
];

const alvosAuditoria: TipoAlvoAuditoria[] = [
  'ORGANIZACAO',
  'BAIRRO',
  'CATEGORIA',
  'VINCULO',
  'DENUNCIA',
  'SOLICITACAO_TRANSFERENCIA',
  'COMENTARIO',
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

export function AuditoriaPrefeituraPage() {
  const { vinculosOperacionais } = useUser();
  const prefeituraId = vinculosOperacionais.find((vinculo) =>
    vinculo.ativo && vinculo.papel === 'ADMIN_PREFEITURA')?.organizacaoId;

  const [pagina, setPagina] = useState<PageResponse<AuditoriaResponseDTO> | null>(null);
  const [acao, setAcao] = useState<TipoAcaoAuditoria | ''>('');
  const [alvoTipo, setAlvoTipo] = useState<TipoAlvoAuditoria | ''>('');
  const [atorId, setAtorId] = useState('');
  const [termoLocal, setTermoLocal] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [detalheSelecionado, setDetalheSelecionado] = useState<AuditoriaResponseDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregarAuditoria = useCallback(async () => {
    if (!prefeituraId) {
      setError('Nao foi possivel identificar a prefeitura da sua sessao.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await auditoriaService.listarDaPrefeitura(prefeituraId, {
        acao: acao || null,
        alvoTipo: alvoTipo || null,
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
  }, [acao, alvoTipo, atorId, paginaAtual, prefeituraId]);

  useEffect(() => {
    carregarAuditoria();
  }, [carregarAuditoria]);

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
      evento.atorNome,
      evento.perfilAtor,
      evento.caminho,
      evento.ip,
    ].some((value) => String(value ?? '').toLowerCase().includes(termo)));
  }, [pagina, termoLocal]);

  const totalPages = pagina?.totalPages ?? 0;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Auditoria da prefeitura</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Acompanhe as acoes registradas pela prefeitura e pelas secretarias vinculadas.
          </p>
        </div>

        <Button variant="outline" onClick={carregarAuditoria} disabled={isLoading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Atualizar
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-3 lg:flex-row">
          <Input
            value={termoLocal}
            onChange={(event) => setTermoLocal(event.target.value)}
            placeholder="Buscar por acao, operador, descricao ou caminho..."
            className="border-border bg-background/80 shadow-sm"
          />
          <Button variant="outline" onClick={() => setMostrarFiltros((current) => !current)}>
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
        </div>

        {mostrarFiltros && (
          <div className="mt-4 grid gap-4 border-t border-border pt-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Acao</Label>
              <Select value={acao} onValueChange={(value) => {
                setAcao(value as TipoAcaoAuditoria | '');
                setPaginaAtual(0);
              }}>
                <SelectTrigger className="border-border bg-background/80 shadow-sm">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  {acoesAuditoria.map((item) => (
                    <SelectItem key={item} value={item}>{labelEnum(item)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tipo de alvo</Label>
              <Select value={alvoTipo} onValueChange={(value) => {
                setAlvoTipo(value as TipoAlvoAuditoria | '');
                setPaginaAtual(0);
              }}>
                <SelectTrigger className="border-border bg-background/80 shadow-sm">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  {alvosAuditoria.map((item) => (
                    <SelectItem key={item} value={item}>{labelEnum(item)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>ID do operador</Label>
              <Input
                value={atorId}
                onChange={(event) => {
                  setAtorId(event.target.value);
                  setPaginaAtual(0);
                }}
                placeholder="Opcional"
                className="border-border bg-background/80 shadow-sm"
              />
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Acao</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Alvo</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Operador</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Descricao</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Data</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-muted-foreground">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    Carregando eventos...
                  </td>
                </tr>
              )}

              {!isLoading && eventos.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    Nenhum evento encontrado.
                  </td>
                </tr>
              )}

              {!isLoading && eventos.map((evento) => (
                <tr key={evento.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{labelEnum(evento.acao)}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{labelEnum(evento.alvoTipo)} #{evento.alvoId ?? '-'}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    <div className="font-medium text-foreground">{evento.atorNome ?? `#${evento.atorId ?? '-'}`}</div>
                    <div className="text-xs">{evento.perfilAtor ?? '-'}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground max-w-md">
                    <span className="line-clamp-2">{evento.descricao}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(evento.criadoEm)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setDetalheSelecionado(evento)}
                      className="rounded-lg p-1.5 transition-colors hover:bg-muted"
                      title="Ver detalhes"
                    >
                      <Eye className="h-4 w-4 text-foreground" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-border p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileSearch className="h-4 w-4" />
            {pagina?.totalElements ?? 0} eventos
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={paginaAtual === 0 || isLoading}
              onClick={() => setPaginaAtual((current) => Math.max(0, current - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-28 text-center text-sm text-muted-foreground">
              Pagina {totalPages === 0 ? 0 : paginaAtual + 1} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={paginaAtual >= totalPages - 1 || totalPages === 0 || isLoading}
              onClick={() => setPaginaAtual((current) => current + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {detalheSelecionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setDetalheSelecionado(null)}>
          <div className="w-full max-w-2xl rounded-xl border border-border bg-card p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="space-y-1">
              <h3 className="text-lg font-display font-semibold text-foreground">{labelEnum(detalheSelecionado.acao)}</h3>
              <p className="text-sm text-muted-foreground">
                {detalheSelecionado.atorNome ?? `#${detalheSelecionado.atorId ?? '-'}`} em {formatDate(detalheSelecionado.criadoEm)}
              </p>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Info label="Alvo" value={`${labelEnum(detalheSelecionado.alvoTipo)} #${detalheSelecionado.alvoId ?? '-'}`} />
              <Info label="Perfil" value={detalheSelecionado.perfilAtor ?? '-'} />
              <Info label="Metodo" value={detalheSelecionado.metodoHttp ?? '-'} />
              <Info label="Caminho" value={detalheSelecionado.caminho ?? '-'} />
            </div>

            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-foreground">Descricao</p>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">{detalheSelecionado.descricao}</p>
            </div>

            {detalheSelecionado.detalhes && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-foreground">Detalhes</p>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">{detalheSelecionado.detalhes}</p>
              </div>
            )}

            <div className="mt-6 flex justify-end">
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
    <div className="rounded-lg bg-muted/50 p-3">
      <p className="mb-1 text-xs text-muted-foreground">{label}</p>
      <p className="break-words text-sm text-foreground">{value}</p>
    </div>
  );
}
