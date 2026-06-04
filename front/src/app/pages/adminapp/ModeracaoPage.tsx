import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { AlertTriangle, Archive, CheckCircle2, Eye, RefreshCw, Shield, ShieldAlert, UserCheck, Ban } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { getApiErrorMessage } from '../../services/apiClient';
import { moderacaoService } from '../../services/moderacaoService';
import type { PainelModeracaoResumoDTO, SinalizacaoDenunciaResponseDTO } from '../../types/moderacao';

const motivoLabels: Record<string, string> = {
  IMAGEM_INADEQUADA: 'Imagem inadequada',
  SPAM: 'Spam',
  FAKE_NEWS: 'Informacao falsa',
  CONTEUDO_OFENSIVO: 'Conteudo ofensivo',
  DADOS_PESSOAIS_EXPOSTOS: 'Dados pessoais expostos',
  DENUNCIA_DUPLICADA: 'Relato duplicado',
  LOCALIZACAO_INCORRETA: 'Localizacao incorreta',
  CATEGORIA_INCORRETA: 'Categoria incorreta',
  OUTRO: 'Outro',
};

export function ModeracaoPage() {
  const navigate = useNavigate();
  const [resumo, setResumo] = useState<PainelModeracaoResumoDTO | null>(null);
  const [sinalizacoes, setSinalizacoes] = useState<SinalizacaoDenunciaResponseDTO[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSinalizacao, setSelectedSinalizacao] = useState<SinalizacaoDenunciaResponseDTO | null>(null);
  const [motivoArquivamento, setMotivoArquivamento] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [processandoId, setProcessandoId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const carregarModeracao = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [resumoResponse, sinalizacoesResponse] = await Promise.all([
        moderacaoService.resumo(),
        moderacaoService.listarSinalizacoes('PENDENTE', 0, 50),
      ]);

      setResumo(resumoResponse);
      setSinalizacoes(sinalizacoesResponse.content);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarModeracao();
  }, [carregarModeracao]);

  const filteredSinalizacoes = useMemo(() => {
    const termo = searchTerm.trim().toLowerCase();

    if (!termo) {
      return sinalizacoes;
    }

    return sinalizacoes.filter((sinalizacao) => [
      sinalizacao.denunciaId,
      sinalizacao.denunciaTitulo,
      sinalizacao.motivo,
      sinalizacao.comentario,
      sinalizacao.autorNome,
    ].some((value) => String(value).toLowerCase().includes(termo)));
  }, [searchTerm, sinalizacoes]);

  async function marcarComoAnalisada(sinalizacao: SinalizacaoDenunciaResponseDTO) {
    setProcessandoId(sinalizacao.id);
    setError(null);

    try {
      await moderacaoService.marcarSinalizacaoAnalisada(sinalizacao.id);
      setSinalizacoes((current) => current.filter((item) => item.id !== sinalizacao.id));
      setResumo((current) => current
        ? {
          ...current,
          sinalizacoesPendentes: Math.max(0, current.sinalizacoesPendentes - 1),
          sinalizacoesAnalisadas: current.sinalizacoesAnalisadas + 1,
        }
        : current);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setProcessandoId(null);
    }
  }

  async function confirmarArquivamento() {
    if (!selectedSinalizacao || motivoArquivamento.trim().length < 10) {
      return;
    }

    setProcessandoId(selectedSinalizacao.id);
    setError(null);

    try {
      await moderacaoService.arquivarDenuncia(selectedSinalizacao.denunciaId, {
        motivo: motivoArquivamento.trim(),
      });
      await moderacaoService.marcarSinalizacaoAnalisada(selectedSinalizacao.id);
      setSinalizacoes((current) => current.filter((item) => item.id !== selectedSinalizacao.id));
      setResumo((current) => current
        ? {
          ...current,
          sinalizacoesPendentes: Math.max(0, current.sinalizacoesPendentes - 1),
          sinalizacoesAnalisadas: current.sinalizacoesAnalisadas + 1,
          denunciasArquivadasModeracao: current.denunciasArquivadasModeracao + 1,
        }
        : current);
      setSelectedSinalizacao(null);
      setMotivoArquivamento('');
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setProcessandoId(null);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">
            Moderacao Geral
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Acompanhe sinalizacoes pendentes e aplique acoes essenciais de moderacao.
          </p>
        </div>

        <Button variant="outline" onClick={carregarModeracao} disabled={isLoading}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <ResumoCard
          icon={<AlertTriangle className="w-5 h-5 text-red-600" />}
          value={resumo?.sinalizacoesPendentes ?? 0}
          label="Sinalizacoes pendentes"
          tone="bg-red-100"
        />
        <ResumoCard
          icon={<Archive className="w-5 h-5 text-slate-600" />}
          value={resumo?.denunciasArquivadasModeracao ?? 0}
          label="Denuncias arquivadas"
          tone="bg-slate-100"
        />
        <ResumoCard
          icon={<ShieldAlert className="w-5 h-5 text-amber-600" />}
          value={resumo?.usuariosAdvertidosModeracao ?? 0}
          label="Usuarios advertidos"
          tone="bg-amber-100"
        />
        <ResumoCard
          icon={<Ban className="w-5 h-5 text-red-600" />}
          value={resumo?.usuariosSuspensosModeracao ?? 0}
          label="Usuarios suspensos"
          tone="bg-red-100"
        />
        <ResumoCard
          icon={<UserCheck className="w-5 h-5 text-green-600" />}
          value={resumo?.usuariosReativadosModeracao ?? 0}
          label="Usuarios reativados"
          tone="bg-green-100"
        />
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm">
        <div className="p-6 border-b border-border space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-display font-semibold text-foreground">
                Sinalizacoes Pendentes
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Reports enviados por moradores para avaliacao.
              </p>
            </div>
            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
              {filteredSinalizacoes.length} exibidas
            </span>
          </div>

          <input
            type="text"
            placeholder="Buscar por denuncia, motivo, comentario ou autor..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="divide-y divide-border">
          {isLoading && (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Carregando sinalizacoes...
            </div>
          )}

          {!isLoading && filteredSinalizacoes.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Nenhuma sinalizacao pendente encontrada.
            </div>
          )}

          {!isLoading && filteredSinalizacoes.map((sinalizacao) => (
            <div key={sinalizacao.id} className="p-6 hover:bg-muted/50 transition-colors">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                      {motivoLabels[sinalizacao.motivo] ?? sinalizacao.motivo}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Relato #{sinalizacao.denunciaId}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(sinalizacao.criadoEm).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <h4 className="font-medium text-foreground">{sinalizacao.denunciaTitulo}</h4>
                  <p className="text-sm text-muted-foreground">{sinalizacao.comentario}</p>
                  <p className="text-xs text-muted-foreground">
                    Reportado por {sinalizacao.autorNome}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="outline" onClick={() => navigate(`/admin-app/relato/${sinalizacao.denunciaId}`)}>
                    <Eye className="w-4 h-4 mr-2" />
                    Ver relato
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => marcarComoAnalisada(sinalizacao)}
                    disabled={processandoId === sinalizacao.id}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Marcar analisada
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setSelectedSinalizacao(sinalizacao)}
                    disabled={processandoId === sinalizacao.id}
                  >
                    <Archive className="w-4 h-4 mr-2" />
                    Arquivar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-blue-100 rounded-lg">
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground">Moderacao de usuarios</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Para advertir, suspender, reativar ou consultar historico de usuario por ID, use o painel dedicado de moderador.
              O Admin App mantem aqui apenas a triagem global de sinalizacoes para evitar duplicar fluxos complexos.
            </p>
          </div>
        </div>
      </div>

      {selectedSinalizacao && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedSinalizacao(null)}>
          <div className="bg-card rounded-2xl border border-border shadow-2xl max-w-lg w-full" onClick={(event) => event.stopPropagation()}>
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-display font-bold text-foreground">
                Arquivar relato por moderacao
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Relato #{selectedSinalizacao.denunciaId}
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  Essa acao arquiva o relato e registra auditoria. Use apenas quando a sinalizacao justificar a remocao.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Motivo do arquivamento
                </label>
                <Textarea
                  value={motivoArquivamento}
                  onChange={(event) => setMotivoArquivamento(event.target.value)}
                  placeholder="Explique o motivo com pelo menos 10 caracteres..."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {motivoArquivamento.trim().length}/10 caracteres minimos
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-border flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setSelectedSinalizacao(null);
                  setMotivoArquivamento('');
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                disabled={motivoArquivamento.trim().length < 10 || processandoId === selectedSinalizacao.id}
                onClick={confirmarArquivamento}
              >
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ResumoCard({ icon, value, label, tone }: { icon: ReactNode; value: number; label: string; tone: string }) {
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 ${tone} rounded-lg`}>
          {icon}
        </div>
        <div>
          <div className="text-2xl font-display font-bold text-foreground">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </div>
    </div>
  );
}
