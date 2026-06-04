import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
  AlertTriangle,
  ArrowRightLeft,
  CheckCircle2,
  Clock,
  FileText,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { operacionalService } from '../../services/operacionalService';
import type { PainelOperacionalResumoDTO } from '../../types/operacional';
import { getOperationalPathPrefix, getVinculoOperacionalAtivo } from '../../utils/operacionalContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { formatHours, formatPercent } from './operacionalLabels';

interface OperationalDashboardProps {
  modo: 'prefeitura' | 'secretaria';
}

export function OperationalDashboard({ modo }: OperationalDashboardProps) {
  const { userType, vinculosOperacionais } = useUser();
  const vinculo = useMemo(
    () => getVinculoOperacionalAtivo(userType, vinculosOperacionais),
    [userType, vinculosOperacionais],
  );
  const [resumo, setResumo] = useState<PainelOperacionalResumoDTO | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!vinculo) {
      setResumo(null);
      setErro('Nao foi possivel carregar seu vinculo operacional. Tente entrar novamente.');
      setCarregando(false);
      return;
    }

    setCarregando(true);
    operacionalService
      .resumo(vinculo.organizacaoId)
      .then((response) => {
        setResumo(response);
        setErro(null);
      })
      .catch((error) => {
        setErro(error instanceof Error ? error.message : 'Nao foi possivel carregar o painel operacional.');
      })
      .finally(() => setCarregando(false));
  }, [vinculo]);

  const titulo = modo === 'prefeitura' ? 'Painel operacional da prefeitura' : 'Painel operacional da secretaria';
  const prefix = getOperationalPathPrefix(userType);

  if (carregando) {
    return (
      <div className="p-6">
        <Card className="p-8 text-center text-sm text-muted-foreground">
          Carregando painel operacional...
        </Card>
      </div>
    );
  }

  if (erro || !resumo) {
    return (
      <div className="p-6">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-foreground">Painel Operacional</h2>
          <p className="mt-2 text-sm text-red-600">{erro}</p>
        </Card>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total de relatos',
      value: resumo.denuncias.total,
      icon: FileText,
      tone: 'bg-blue-100 text-blue-700',
    },
    {
      label: 'Em atendimento',
      value: resumo.denuncias.emAnalise + resumo.denuncias.encaminhadas + resumo.denuncias.emAndamento,
      icon: Clock,
      tone: 'bg-amber-100 text-amber-800',
    },
    {
      label: 'Concluidos confirmados',
      value: resumo.denuncias.concluidasConfirmadas,
      icon: CheckCircle2,
      tone: 'bg-green-100 text-green-700',
    },
    {
      label: 'Reabertos',
      value: resumo.denuncias.reabertas,
      icon: RefreshCw,
      tone: 'bg-red-100 text-red-700',
    },
    {
      label: 'Aguardando confirmacao',
      value: resumo.denuncias.concluidasAguardandoConfirmacao,
      icon: AlertTriangle,
      tone: 'bg-orange-100 text-orange-700',
    },
    {
      label: 'Transferencias pendentes',
      value: resumo.transferenciasPendentes,
      icon: ArrowRightLeft,
      tone: 'bg-purple-100 text-purple-700',
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">{titulo}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {resumo.organizacaoNome} - acompanhamento de relatos, status e transferencias.
          </p>
        </div>
        <Button asChild>
          <Link to={`${prefix}/relatos`}>Gerenciar relatos</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="shadow-sm">
              <CardContent className="p-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="mt-2 text-3xl font-display font-bold text-foreground">{stat.value}</p>
                </div>
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${stat.tone}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Indicadores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Metric label="Conclusao confirmada" value={formatPercent(resumo.indicadores.taxaConclusaoConfirmada)} />
            <Metric label="Taxa de reabertura" value={formatPercent(resumo.indicadores.taxaReabertura)} />
            <Metric
              label="Tempo medio ate confirmacao"
              value={formatHours(resumo.indicadores.tempoMedioConfirmacaoHoras)}
            />
          </CardContent>
        </Card>

        <DistributionCard
          title="Bairros com mais demandas"
          icon={<MapPin className="h-5 w-5 text-primary" />}
          items={resumo.bairrosMaisDemandados}
        />
        <DistributionCard
          title="Categorias com mais demandas"
          icon={<FileText className="h-5 w-5 text-primary" />}
          items={resumo.categoriasMaisDemandadas}
        />
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}

function DistributionCard({
  title,
  icon,
  items,
}: {
  title: string;
  icon: ReactNode;
  items: { nome: string; total: number }[];
}) {
  const maior = Math.max(...items.map((item) => item.total), 1);

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 && <p className="text-sm text-muted-foreground">Sem dados suficientes ainda.</p>}
        {items.map((item) => (
          <div key={item.nome} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">{item.nome}</span>
              <span className="text-muted-foreground">{item.total}</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-primary" style={{ width: `${(item.total / maior) * 100}%` }} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
