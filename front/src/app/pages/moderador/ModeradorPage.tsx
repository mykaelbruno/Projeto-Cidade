import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  AlertTriangle,
  Archive,
  Ban,
  CheckCircle2,
  Eye,
  FileText,
  MessageSquare,
  Search,
  ShieldAlert,
  Trash2,
  UserCheck,
} from 'lucide-react';
import { EmptyState } from '../../components/EmptyState';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { moderacaoService } from '../../services/moderacaoService';
import type {
  AcaoModeracaoUsuario,
  ModeracaoResponseDTO,
  PainelModeracaoResumoDTO,
  SinalizacaoDenunciaResponseDTO,
} from '../../types/moderacao';

const motivoLabels: Record<string, string> = {
  IMAGEM_INADEQUADA: 'Imagem inadequada',
  SPAM: 'Spam',
  FAKE_NEWS: 'Fake news',
  CONTEUDO_OFENSIVO: 'Conteudo ofensivo',
  DADOS_PESSOAIS_EXPOSTOS: 'Dados pessoais expostos',
  DENUNCIA_DUPLICADA: 'Denuncia duplicada',
  LOCALIZACAO_INCORRETA: 'Localizacao incorreta',
  CATEGORIA_INCORRETA: 'Categoria incorreta',
  OUTRO: 'Outro',
};

const acaoUsuarioLabels: Record<AcaoModeracaoUsuario, string> = {
  ADVERTENCIA: 'Advertencia',
  SUSPENSAO: 'Suspensao',
  REATIVACAO: 'Reativacao',
};

export function ModeradorPage() {
  const navigate = useNavigate();
  const [resumo, setResumo] = useState<PainelModeracaoResumoDTO | null>(null);
  const [sinalizacoes, setSinalizacoes] = useState<SinalizacaoDenunciaResponseDTO[]>([]);
  const [historicoUsuario, setHistoricoUsuario] = useState<ModeracaoResponseDTO[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [usuarioId, setUsuarioId] = useState('');
  const [comentarioId, setComentarioId] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState(false);

  const [sinalizacaoSelecionada, setSinalizacaoSelecionada] =
    useState<SinalizacaoDenunciaResponseDTO | null>(null);
  const [modalArquivarAberto, setModalArquivarAberto] = useState(false);
  const [motivoArquivamento, setMotivoArquivamento] = useState('');
  const [acaoUsuario, setAcaoUsuario] = useState<AcaoModeracaoUsuario | null>(null);
  const [modalUsuarioAberto, setModalUsuarioAberto] = useState(false);
  const [motivoUsuario, setMotivoUsuario] = useState('');
  const [modalComentarioAberto, setModalComentarioAberto] = useState(false);
  const [motivoComentario, setMotivoComentario] = useState('');

  const carregarDados = useCallback(async () => {
    setCarregando(true);
    setErro(null);

    try {
      const [resumoResponse, sinalizacoesResponse] = await Promise.all([
        moderacaoService.resumo(),
        moderacaoService.listarSinalizacoes('PENDENTE', 0, 50),
      ]);
      setResumo(resumoResponse);
      setSinalizacoes(sinalizacoesResponse.content);
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Nao foi possivel carregar a moderacao.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const sinalizacoesFiltradas = useMemo(() => {
    const termo = searchTerm.trim().toLowerCase();
    if (!termo) {
      return sinalizacoes;
    }

    return sinalizacoes.filter((sinalizacao) => {
      return (
        String(sinalizacao.denunciaId).includes(termo) ||
        sinalizacao.denunciaTitulo.toLowerCase().includes(termo) ||
        sinalizacao.autorNome.toLowerCase().includes(termo) ||
        motivoLabels[sinalizacao.motivo].toLowerCase().includes(termo)
      );
    });
  }, [searchTerm, sinalizacoes]);

  async function marcarAnalisada(sinalizacao: SinalizacaoDenunciaResponseDTO) {
    setProcessando(true);
    try {
      await moderacaoService.marcarSinalizacaoAnalisada(sinalizacao.id);
      setFeedback('Sinalizacao marcada como analisada.');
      await carregarDados();
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Nao foi possivel analisar a sinalizacao.');
    } finally {
      setProcessando(false);
    }
  }

  async function confirmarArquivamento() {
    if (!sinalizacaoSelecionada || motivoArquivamento.trim().length < 10) {
      return;
    }

    setProcessando(true);
    try {
      await moderacaoService.arquivarDenuncia(sinalizacaoSelecionada.denunciaId, {
        motivo: motivoArquivamento.trim(),
      });
      await moderacaoService.marcarSinalizacaoAnalisada(sinalizacaoSelecionada.id);
      setFeedback('Denuncia arquivada e sinalizacao marcada como analisada.');
      setModalArquivarAberto(false);
      setMotivoArquivamento('');
      await carregarDados();
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Nao foi possivel arquivar a denuncia.');
    } finally {
      setProcessando(false);
    }
  }

  async function carregarHistoricoUsuario() {
    const id = Number(usuarioId);
    if (!Number.isInteger(id) || id <= 0) {
      setErro('Informe um ID de usuario valido.');
      return;
    }

    setProcessando(true);
    try {
      const response = await moderacaoService.historicoUsuario(id);
      setHistoricoUsuario(response.content);
      setFeedback(response.content.length ? 'Historico carregado.' : 'Usuario encontrado sem historico de moderacao.');
    } catch (error) {
      setHistoricoUsuario([]);
      setErro(error instanceof Error ? error.message : 'Nao foi possivel carregar o historico.');
    } finally {
      setProcessando(false);
    }
  }

  async function confirmarModeracaoUsuario() {
    const id = Number(usuarioId);
    if (!acaoUsuario || !Number.isInteger(id) || id <= 0 || motivoUsuario.trim().length < 10) {
      return;
    }

    setProcessando(true);
    try {
      await moderacaoService.moderarUsuario(id, acaoUsuario, { motivo: motivoUsuario.trim() });
      setFeedback(`Usuario recebeu acao: ${acaoUsuarioLabels[acaoUsuario]}.`);
      setModalUsuarioAberto(false);
      setMotivoUsuario('');
      await carregarHistoricoUsuario();
      await carregarDados();
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Nao foi possivel moderar o usuario.');
    } finally {
      setProcessando(false);
    }
  }

  async function confirmarRemocaoComentario() {
    const id = Number(comentarioId);
    if (!Number.isInteger(id) || id <= 0 || motivoComentario.trim().length < 10) {
      return;
    }

    setProcessando(true);
    try {
      await moderacaoService.removerComentario(id, { motivo: motivoComentario.trim() });
      setFeedback('Comentario removido por moderacao.');
      setModalComentarioAberto(false);
      setMotivoComentario('');
      setComentarioId('');
      await carregarDados();
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Nao foi possivel remover o comentario.');
    } finally {
      setProcessando(false);
    }
  }

  function abrirModeracaoUsuario(acao: AcaoModeracaoUsuario) {
    const id = Number(usuarioId);
    if (!Number.isInteger(id) || id <= 0) {
      setErro('Informe um ID de usuario valido antes de aplicar a acao.');
      return;
    }

    setAcaoUsuario(acao);
    setMotivoUsuario('');
    setModalUsuarioAberto(true);
  }

  if (carregando) {
    return (
      <div className="p-6">
        <Card className="p-8 text-center text-sm text-muted-foreground">
          Carregando painel de moderacao...
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground">Painel de Moderacao</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Revise sinalizacoes, arquive relatos indevidos e aplique acoes em moradores.
        </p>
      </div>

      {(erro || feedback) && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            erro ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700'
          }`}
        >
          {erro || feedback}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          label="Sinalizacoes pendentes"
          value={resumo?.sinalizacoesPendentes ?? 0}
          icon={<AlertTriangle className="w-5 h-5" />}
          tone="bg-red-100 text-red-700"
        />
        <StatCard
          label="Denuncias arquivadas"
          value={resumo?.denunciasArquivadasModeracao ?? 0}
          icon={<Archive className="w-5 h-5" />}
          tone="bg-slate-100 text-slate-700"
        />
        <StatCard
          label="Comentarios removidos"
          value={resumo?.comentariosRemovidosModeracao ?? 0}
          icon={<Trash2 className="w-5 h-5" />}
          tone="bg-purple-100 text-purple-700"
        />
        <StatCard
          label="Usuarios suspensos"
          value={resumo?.usuariosSuspensosModeracao ?? 0}
          icon={<Ban className="w-5 h-5" />}
          tone="bg-orange-100 text-orange-700"
        />
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="w-5 h-5 text-primary" />
            Sinalizacoes pendentes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar por ID, titulo, motivo ou autor..."
              className="pl-9"
            />
          </div>

          {sinalizacoesFiltradas.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="Nenhuma sinalizacao pendente"
              description="Todas as sinalizacoes foram analisadas."
              iconColor="text-green-600"
              iconBgColor="bg-green-100"
            />
          ) : (
            <div className="space-y-3">
              {sinalizacoesFiltradas.map((sinalizacao) => (
                <div
                  key={sinalizacao.id}
                  className="rounded-xl border border-border p-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between"
                >
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="bg-red-100 text-red-700">
                        {motivoLabels[sinalizacao.motivo]}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Denuncia #{sinalizacao.denunciaId}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(sinalizacao.criadoEm)}
                      </span>
                    </div>
                    <h3 className="font-semibold text-foreground line-clamp-1">
                      {sinalizacao.denunciaTitulo}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{sinalizacao.comentario}</p>
                    <p className="text-xs text-muted-foreground">Reportado por: {sinalizacao.autorNome}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 lg:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => navigate(`/moderador/relato/${sinalizacao.denunciaId}`)}
                    >
                      <Eye className="w-4 h-4" />
                      Ver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={processando}
                      onClick={() => marcarAnalisada(sinalizacao)}
                    >
                      Analisada
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="gap-2"
                      onClick={() => {
                        setSinalizacaoSelecionada(sinalizacao);
                        setMotivoArquivamento('');
                        setModalArquivarAberto(true);
                      }}
                    >
                      <Archive className="w-4 h-4" />
                      Arquivar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-primary" />
              Moderacao de usuario
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              O backend permite moderar usuario por ID. Moderadores comuns so podem agir sobre contas MORADOR.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                value={usuarioId}
                onChange={(event) => setUsuarioId(event.target.value)}
                inputMode="numeric"
                placeholder="ID do usuario"
              />
              <Button variant="outline" disabled={processando} onClick={carregarHistoricoUsuario}>
                Carregar historico
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Button variant="outline" className="gap-2" onClick={() => abrirModeracaoUsuario('ADVERTENCIA')}>
                <ShieldAlert className="w-4 h-4" />
                Advertir
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => abrirModeracaoUsuario('SUSPENSAO')}>
                <Ban className="w-4 h-4" />
                Suspender
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => abrirModeracaoUsuario('REATIVACAO')}>
                <UserCheck className="w-4 h-4" />
                Reativar
              </Button>
            </div>
            <HistoryList historico={historicoUsuario} />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Remover comentario
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Use quando um comentario especifico violar as regras. A remocao exige o ID do comentario.
            </p>
            <Input
              value={comentarioId}
              onChange={(event) => setComentarioId(event.target.value)}
              inputMode="numeric"
              placeholder="ID do comentario"
            />
            <Button
              variant="destructive"
              className="gap-2"
              onClick={() => {
                const id = Number(comentarioId);
                if (!Number.isInteger(id) || id <= 0) {
                  setErro('Informe um ID de comentario valido.');
                  return;
                }
                setMotivoComentario('');
                setModalComentarioAberto(true);
              }}
            >
              <Trash2 className="w-4 h-4" />
              Remover comentario
            </Button>
          </CardContent>
        </Card>
      </div>

      <Dialog open={modalArquivarAberto} onOpenChange={setModalArquivarAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Arquivar denuncia</DialogTitle>
            <DialogDescription>{sinalizacaoSelecionada?.denunciaTitulo}</DialogDescription>
          </DialogHeader>
          <ReasonTextarea value={motivoArquivamento} onChange={setMotivoArquivamento} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalArquivarAberto(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={motivoArquivamento.trim().length < 10 || processando}
              onClick={confirmarArquivamento}
            >
              Arquivar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={modalUsuarioAberto} onOpenChange={setModalUsuarioAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{acaoUsuario ? acaoUsuarioLabels[acaoUsuario] : 'Moderar usuario'}</DialogTitle>
            <DialogDescription>Usuario #{usuarioId}</DialogDescription>
          </DialogHeader>
          <ReasonTextarea value={motivoUsuario} onChange={setMotivoUsuario} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalUsuarioAberto(false)}>
              Cancelar
            </Button>
            <Button disabled={motivoUsuario.trim().length < 10 || processando} onClick={confirmarModeracaoUsuario}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={modalComentarioAberto} onOpenChange={setModalComentarioAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover comentario</DialogTitle>
            <DialogDescription>Comentario #{comentarioId}</DialogDescription>
          </DialogHeader>
          <ReasonTextarea value={motivoComentario} onChange={setMotivoComentario} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalComentarioAberto(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={motivoComentario.trim().length < 10 || processando}
              onClick={confirmarRemocaoComentario}
            >
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon: ReactNode;
  tone: string;
}) {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${tone}`}>{icon}</div>
        <div className="min-w-0">
          <p className="text-2xl font-display font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground line-clamp-2">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ReasonTextarea({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <Label className="mb-2 block">Motivo</Label>
      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        placeholder="Descreva o motivo da acao com clareza."
      />
      <p className="mt-1 text-xs text-muted-foreground">{value.trim().length}/10 caracteres minimos</p>
    </div>
  );
}

function HistoryList({ historico }: { historico: ModeracaoResponseDTO[] }) {
  if (historico.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
        Nenhum historico carregado.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {historico.map((item) => (
        <div key={item.id} className="rounded-lg border border-border p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge variant="secondary">
              {item.acaoUsuario ? acaoUsuarioLabels[item.acaoUsuario] : item.tipoAlvo}
            </Badge>
            <span className="text-xs text-muted-foreground">{formatDateTime(item.criadoEm)}</span>
          </div>
          <p className="mt-2 text-sm text-foreground">{item.motivo}</p>
          <p className="mt-1 text-xs text-muted-foreground">Moderador: {item.moderadorNome}</p>
        </div>
      ))}
    </div>
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}
