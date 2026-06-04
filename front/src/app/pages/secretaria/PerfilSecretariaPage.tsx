import { Building2, MapPin, Users, FileText, CheckCircle2, Clock } from 'lucide-react';

export function PerfilSecretariaPage() {
  const secretaria = {
    nome: 'Secretaria de Infraestrutura',
    cidade: 'Mamanguape - PB',
    descricao: 'Responsável pela manutenção de ruas, calçadas, pontes, sinalização viária e demais obras de infraestrutura urbana.',
    usuariosVinculados: 8,
  };

  const usuario = {
    nome: 'Carlos Administrador',
    email: 'carlos.admin@prefeitura.mamanguape.pb.gov.br',
    cargo: 'Administrador da Secretaria',
    telefone: '(83) 99999-9999',
  };

  const stats = [
    { label: 'Relatos Atendidos', value: '156', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Taxa de Conclusão', value: '78%', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Tempo Médio de Resposta', value: '2.3 dias', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: 'Usuários Ativos', value: '8', icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground mb-1">
          Perfil da Secretaria
        </h2>
        <p className="text-sm text-muted-foreground">
          Informações e estatísticas da secretaria vinculada
        </p>
      </div>

      {/* Secretaria Info Card */}
      <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-[#087F5B] to-[#0F4C81] rounded-xl flex items-center justify-center flex-shrink-0">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-display font-bold text-foreground mb-1">
              {secretaria.nome}
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <MapPin className="w-4 h-4" />
              {secretaria.cidade}
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              {secretaria.descricao}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-card rounded-xl p-5 border border-border shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <p className="text-2xl font-display font-bold text-foreground mb-1">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* User Info Card */}
      <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
        <h3 className="text-lg font-display font-semibold text-foreground mb-4">
          Informações do Usuário
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Nome Completo</p>
            <p className="text-sm font-medium text-foreground">{usuario.nome}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Cargo</p>
            <p className="text-sm font-medium text-foreground">{usuario.cargo}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">E-mail</p>
            <p className="text-sm font-medium text-foreground">{usuario.email}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Telefone</p>
            <p className="text-sm font-medium text-foreground">{usuario.telefone}</p>
          </div>
        </div>
      </div>

      {/* App Info */}
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground mb-1">
          Conecta Cidadão v1.0.0
        </p>
        <p className="text-xs text-muted-foreground">
          Painel Operacional da Secretaria
        </p>
      </div>
    </div>
  );
}
