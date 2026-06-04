import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import {
  AlertTriangle,
  Building2,
  FileSearch,
  Link2,
  Plus,
  RefreshCw,
  Shield,
  Tag,
  Users,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { auditoriaService } from '../../services/auditoriaService';
import { categoriaService } from '../../services/categoriaService';
import { getApiErrorMessage } from '../../services/apiClient';
import { moderacaoService } from '../../services/moderacaoService';
import { organizacaoService } from '../../services/organizacaoService';
import { usuarioService } from '../../services/usuarioService';
import type { AuditoriaResponseDTO } from '../../types/auditoria';
import type { CategoriaResponseDTO } from '../../types/categoria';
import type { PainelModeracaoResumoDTO } from '../../types/moderacao';
import type { OrganizacaoResponseDTO } from '../../types/organizacao';
import type { UsuarioResponseDTO } from '../../types/usuario';

const quickActions = [
  {
    label: 'Cadastrar prefeitura',
    description: 'Criar uma prefeitura ativa',
    icon: Building2,
    path: '/admin-app/organizacoes',
    tone: 'bg-purple-100 text-purple-700',
  },
  {
    label: 'Criar usuario global',
    description: 'Admin App, moderador ou morador',
    icon: Users,
    path: '/admin-app/usuarios',
    tone: 'bg-blue-100 text-blue-700',
  },
  {
    label: 'Gerenciar vinculos',
    description: 'Mover usuarios entre organizacoes',
    icon: Link2,
    path: '/admin-app/vinculos',
    tone: 'bg-indigo-100 text-indigo-700',
  },
  {
    label: 'Criar categoria',
    description: 'Configurar tipos de relato',
    icon: Tag,
    path: '/admin-app/categorias',
    tone: 'bg-cyan-100 text-cyan-700',
  },
  {
    label: 'Abrir moderacao',
    description: 'Revisar sinalizacoes pendentes',
    icon: Shield,
    path: '/admin-app/moderacao',
    tone: 'bg-amber-100 text-amber-700',
  },
  {
    label: 'Abrir auditoria',
    description: 'Consultar eventos do sistema',
    icon: FileSearch,
    path: '/admin-app/auditoria',
    tone: 'bg-slate-100 text-slate-700',
  },
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

export function VisaoGeralPage() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState<UsuarioResponseDTO[]>([]);
  const [organizacoes, setOrganizacoes] = useState<OrganizacaoResponseDTO[]>([]);
  const [categorias, setCategorias] = useState<CategoriaResponseDTO[]>([]);
  const [resumoModeracao, setResumoModeracao] = useState<PainelModeracaoResumoDTO | null>(null);
  const [auditorias, setAuditorias] = useState<AuditoriaResponseDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregarResumo = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [
        usuariosResponse,
        organizacoesResponse,
        categoriasResponse,
        moderacaoResponse,
        auditoriasResponse,
      ] = await Promise.all([
        usuarioService.listar(),
        organizacaoService.listar(),
        categoriaService.listar(),
        moderacaoService.resumo(),
        auditoriaService.listar({ page: 0, size: 5 }),
      ]);

      setUsuarios(usuariosResponse);
      setOrganizacoes(organizacoesResponse);
      setCategorias(categoriasResponse);
      setResumoModeracao(moderacaoResponse);
      setAuditorias(auditoriasResponse.content);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarResumo();
  }, [carregarResumo]);

  const totais = useMemo(() => {
    const usuariosAtivos = usuarios.filter((usuario) => usuario.ativo).length;
    const prefeituras = organizacoes.filter((organizacao) => organizacao.tipo === 'PREFEITURA');
    const secretarias = organizacoes.filter((organizacao) => organizacao.tipo === 'SECRETARIA');

    return {
      usuarios: usuarios.length,
      usuariosAtivos,
      prefeituras: prefeituras.length,
      secretarias: secretarias.length,
      categoriasAtivas: categorias.filter((categoria) => categoria.ativa).length,
      sinalizacoesPendentes: resumoModeracao?.sinalizacoesPendentes ?? 0,
    };
  }, [categorias, organizacoes, resumoModeracao, usuarios]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">
            Visao Geral
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Resumo administrativo com dados reais de contas, organizacoes, categorias, moderacao e auditoria.
          </p>
        </div>

        <Button variant="outline" onClick={carregarResumo} disabled={isLoading}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="bg-card rounded-xl border border-border p-6 text-sm text-muted-foreground">
          Carregando resumo administrativo...
        </div>
      )}

      {!isLoading && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <ResumoCard label="Usuarios" value={totais.usuarios} sublabel={`${totais.usuariosAtivos} ativos`} icon={<Users className="w-5 h-5" />} tone="bg-blue-100 text-blue-700" />
            <ResumoCard label="Prefeituras" value={totais.prefeituras} sublabel="organizacoes municipais" icon={<Building2 className="w-5 h-5" />} tone="bg-purple-100 text-purple-700" />
            <ResumoCard label="Secretarias" value={totais.secretarias} sublabel="vinculadas a prefeituras" icon={<Link2 className="w-5 h-5" />} tone="bg-indigo-100 text-indigo-700" />
            <ResumoCard label="Categorias ativas" value={totais.categoriasAtivas} sublabel={`${categorias.length} cadastradas`} icon={<Tag className="w-5 h-5" />} tone="bg-cyan-100 text-cyan-700" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-card rounded-2xl border border-border shadow-sm">
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-display font-semibold text-foreground">
                      Ultimos Eventos Auditados
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Eventos recentes retornados por `/api/auditorias`.
                    </p>
                  </div>
                  <FileSearch className="w-5 h-5 text-primary" />
                </div>
              </div>

              <div className="divide-y divide-border">
                {auditorias.length === 0 && (
                  <div className="p-6 text-sm text-muted-foreground">
                    Nenhum evento de auditoria encontrado.
                  </div>
                )}

                {auditorias.map((auditoria) => (
                  <div key={auditoria.id} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <span className="text-sm font-medium text-foreground">
                        {labelEnum(auditoria.acao)}
                      </span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatDate(auditoria.criadoEm)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {auditoria.descricao}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {labelEnum(auditoria.alvoTipo)} #{auditoria.alvoId ?? '-'} por ator #{auditoria.atorId ?? '-'}
                    </p>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-border">
                <button
                  onClick={() => navigate('/admin-app/auditoria')}
                  className="w-full text-center text-sm font-medium text-primary hover:underline"
                >
                  Ver auditoria completa
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-foreground">
                      Moderacao
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Resumo global real
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <InfoRow label="Sinalizacoes pendentes" value={totais.sinalizacoesPendentes} />
                  <InfoRow label="Sinalizacoes analisadas" value={resumoModeracao?.sinalizacoesAnalisadas ?? 0} />
                  <InfoRow label="Denuncias arquivadas" value={resumoModeracao?.denunciasArquivadasModeracao ?? 0} />
                  <InfoRow label="Comentarios removidos" value={resumoModeracao?.comentariosRemovidosModeracao ?? 0} />
                </div>

                <Button className="w-full mt-6" variant="outline" onClick={() => navigate('/admin-app/moderacao')}>
                  Abrir moderacao
                </Button>
              </div>

              <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
                <h3 className="font-display font-semibold text-foreground mb-4">
                  Acoes Rapidas
                </h3>
                <div className="space-y-2">
                  {quickActions.map((action) => {
                    const Icon = action.icon;

                    return (
                      <button
                        key={action.label}
                        onClick={() => navigate(action.path)}
                        className="w-full flex items-center gap-3 p-3 bg-muted hover:bg-muted/80 rounded-xl transition-colors text-left"
                      >
                        <div className={`p-2 ${action.tone} rounded-lg shrink-0`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-foreground">{action.label}</div>
                          <div className="text-xs text-muted-foreground truncate">{action.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground">
                  Escopo atual do Admin App
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Esta visao foi mantida como painel administrativo simples. Nao ha analytics detalhado aqui por decisao de produto;
                  a prioridade e gerenciar contas, organizacoes, vinculos, categorias, moderacao e auditoria.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ResumoCard({
  label,
  value,
  sublabel,
  icon,
  tone,
}: {
  label: string;
  value: number;
  sublabel: string;
  icon: ReactNode;
  tone: string;
}) {
  return (
    <div className="bg-card rounded-xl md:rounded-2xl border border-border p-3 md:p-5 shadow-sm">
      <div className="flex items-start justify-between mb-2 md:mb-3">
        <div className={`p-2 md:p-2.5 ${tone} rounded-lg md:rounded-xl`}>
          {icon}
        </div>
      </div>
      <div>
        <div className="text-xl md:text-2xl font-display font-bold text-foreground">{value}</div>
        <div className="text-[10px] md:text-xs text-muted-foreground mt-1 line-clamp-2">{label}</div>
        <div className="text-[10px] md:text-xs text-muted-foreground/80 mt-1">{sublabel}</div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-foreground">{label}</span>
      <span className="text-sm font-bold text-foreground">{value}</span>
    </div>
  );
}
