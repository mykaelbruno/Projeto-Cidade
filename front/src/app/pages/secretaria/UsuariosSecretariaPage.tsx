import { useState } from 'react';
import { Users, Mail, Phone, Shield, CheckCircle2, XCircle, Search } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';

const usuarios = [
  {
    id: '1',
    nome: 'Carlos Administrador',
    email: 'carlos.admin@prefeitura.mamanguape.pb.gov.br',
    telefone: '(83) 99999-9999',
    cargo: 'ADMIN_SECRETARIA',
    status: 'ativo',
    relatosGerenciados: 45,
  },
  {
    id: '2',
    nome: 'Ana Paula Silva',
    email: 'ana.silva@prefeitura.mamanguape.pb.gov.br',
    telefone: '(83) 98888-8888',
    cargo: 'ATENDENTE_SECRETARIA',
    status: 'ativo',
    relatosGerenciados: 32,
  },
  {
    id: '3',
    nome: 'João Oliveira',
    email: 'joao.oliveira@prefeitura.mamanguape.pb.gov.br',
    telefone: '(83) 97777-7777',
    cargo: 'ATENDENTE_SECRETARIA',
    status: 'ativo',
    relatosGerenciados: 28,
  },
  {
    id: '4',
    nome: 'Maria Santos',
    email: 'maria.santos@prefeitura.mamanguape.pb.gov.br',
    telefone: '(83) 96666-6666',
    cargo: 'ATENDENTE_SECRETARIA',
    status: 'ativo',
    relatosGerenciados: 25,
  },
  {
    id: '5',
    nome: 'Pedro Costa',
    email: 'pedro.costa@prefeitura.mamanguape.pb.gov.br',
    telefone: '(83) 95555-5555',
    cargo: 'ATENDENTE_SECRETARIA',
    status: 'ativo',
    relatosGerenciados: 18,
  },
  {
    id: '6',
    nome: 'Juliana Ferreira',
    email: 'juliana.ferreira@prefeitura.mamanguape.pb.gov.br',
    telefone: '(83) 94444-4444',
    cargo: 'ATENDENTE_SECRETARIA',
    status: 'inativo',
    relatosGerenciados: 8,
  },
];

const cargoLabels: Record<string, string> = {
  ADMIN_SECRETARIA: 'Administrador da Secretaria',
  ATENDENTE_SECRETARIA: 'Atendente da Secretaria',
};

export function UsuariosSecretariaPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsuarios = usuarios.filter((usuario) =>
    usuario.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
    usuario.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const usuariosAtivos = usuarios.filter(u => u.status === 'ativo').length;
  const usuariosInativos = usuarios.filter(u => u.status === 'inativo').length;

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-1">
          Usuários da Secretaria
        </h2>
        <p className="text-sm text-muted-foreground">
          Usuários vinculados à Secretaria de Infraestrutura
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Total de Usuários</p>
              <p className="text-3xl font-display font-bold text-foreground">
                {usuarios.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Usuários Ativos</p>
              <p className="text-3xl font-display font-bold text-foreground">
                {usuariosAtivos}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Usuários Inativos</p>
              <p className="text-3xl font-display font-bold text-foreground">
                {usuariosInativos}
              </p>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
              <XCircle className="w-6 h-6 text-slate-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsuarios.map((usuario) => (
          <div
            key={usuario.id}
            className="bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-all overflow-hidden"
          >
            {/* Card Header */}
            <div className="p-4 border-b border-border bg-muted/30">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-foreground text-sm line-clamp-1 mb-1">
                    {usuario.nome}
                  </h3>
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      usuario.cargo === 'ADMIN_SECRETARIA'
                        ? 'bg-purple-100 text-purple-700 border-purple-200'
                        : 'bg-blue-100 text-blue-700 border-blue-200'
                    }`}
                  >
                    <Shield className="w-3 h-3 mr-1" />
                    {cargoLabels[usuario.cargo]}
                  </Badge>
                </div>
                <Badge
                  className={`shrink-0 ${
                    usuario.status === 'ativo'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {usuario.status === 'ativo' ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs">
                <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-foreground truncate">{usuario.email}</span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-foreground">{usuario.telefone}</span>
              </div>

              <div className="pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Relatos Gerenciados</span>
                  <span className="text-sm font-bold text-foreground">
                    {usuario.relatosGerenciados}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredUsuarios.length === 0 && (
        <div className="bg-card rounded-xl border border-border shadow-sm">
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">
              Nenhum usuário encontrado com os filtros aplicados.
            </p>
          </div>
        </div>
      )}

      {/* Info Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Observação:</strong> A gestão completa de usuários (criar, editar, desativar) é de responsabilidade da Prefeitura/Admin da Prefeitura. Esta página exibe apenas os usuários vinculados à sua secretaria.
        </p>
      </div>
    </div>
  );
}
