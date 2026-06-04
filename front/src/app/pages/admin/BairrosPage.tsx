import { useCallback, useEffect, useMemo, useState } from 'react';
import { Edit, MapPin, Plus, Power, PowerOff, RefreshCw, Search } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { getApiErrorMessage } from '../../services/apiClient';
import { organizacaoService } from '../../services/organizacaoService';
import { useUser } from '../../contexts/UserContext';
import type { BairroResponseDTO } from '../../types/organizacao';

export function BairrosPage() {
  const { vinculosOperacionais } = useUser();
  const prefeituraId = vinculosOperacionais.find((vinculo) =>
    vinculo.ativo && vinculo.papel === 'ADMIN_PREFEITURA')?.organizacaoId;

  const [bairros, setBairros] = useState<BairroResponseDTO[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [nomeBairro, setNomeBairro] = useState('');
  const [bairroEditando, setBairroEditando] = useState<BairroResponseDTO | null>(null);
  const [nomeEdicao, setNomeEdicao] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const carregarBairros = useCallback(async () => {
    if (!prefeituraId) {
      setIsLoading(false);
      setError('Nao foi encontrado um vinculo ativo de administracao da prefeitura para esta conta.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await organizacaoService.listarBairrosParaGestao(prefeituraId);
      setBairros(response);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [prefeituraId]);

  useEffect(() => {
    carregarBairros();
  }, [carregarBairros]);

  const bairrosFiltrados = useMemo(() => {
    const termo = searchTerm.trim().toLowerCase();
    if (!termo) {
      return bairros;
    }

    return bairros.filter((bairro) =>
      bairro.nome.toLowerCase().includes(termo) ||
      bairro.cidade.toLowerCase().includes(termo) ||
      bairro.estado.toLowerCase().includes(termo));
  }, [bairros, searchTerm]);

  async function criarBairro() {
    if (!prefeituraId || nomeBairro.trim().length < 2) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const criado = await organizacaoService.criarBairro(prefeituraId, nomeBairro.trim());
      setBairros((current) => [...current, criado].sort((a, b) => a.nome.localeCompare(b.nome)));
      setNomeBairro('');
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  async function salvarEdicao() {
    if (!prefeituraId || !bairroEditando || nomeEdicao.trim().length < 2) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const atualizado = await organizacaoService.atualizarBairro(prefeituraId, bairroEditando.id, nomeEdicao.trim());
      setBairros((current) => current
        .map((bairro) => bairro.id === atualizado.id ? atualizado : bairro)
        .sort((a, b) => a.nome.localeCompare(b.nome)));
      setBairroEditando(null);
      setNomeEdicao('');
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  async function alterarAtivo(bairro: BairroResponseDTO) {
    if (!prefeituraId) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const atualizado = await organizacaoService.alterarBairroAtivo(prefeituraId, bairro.id, !bairro.ativo);
      setBairros((current) => current.map((item) => item.id === atualizado.id ? atualizado : item));
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  const ativos = bairros.filter((bairro) => bairro.ativo).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">
            Bairros da Cidade
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie os bairros que aparecem no cadastro de moradores, filtros e criacao de denuncias.
          </p>
        </div>

        <Button variant="outline" onClick={carregarBairros} disabled={isLoading}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <p className="text-sm text-muted-foreground">Bairros cadastrados</p>
          <p className="text-2xl font-display font-bold text-foreground mt-1">{bairros.length}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <p className="text-sm text-muted-foreground">Bairros ativos</p>
          <p className="text-2xl font-display font-bold text-green-600 mt-1">{ativos}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <p className="text-sm text-muted-foreground">Cidade</p>
          <p className="text-lg font-display font-bold text-foreground mt-1">
            {bairros[0] ? `${bairros[0].cidade} - ${bairros[0].estado}` : 'Nao carregada'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-card rounded-xl border border-border p-5 space-y-4">
          <div>
            <h3 className="font-display font-semibold text-foreground">Novo bairro</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Cadastre o nome oficial do bairro.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nome-bairro">Nome do bairro</Label>
            <Input
              id="nome-bairro"
              value={nomeBairro}
              onChange={(event) => setNomeBairro(event.target.value)}
              placeholder="Ex: Centro"
              maxLength={100}
            />
          </div>

          <Button className="w-full" onClick={criarBairro} disabled={isSaving || nomeBairro.trim().length < 2 || !prefeituraId}>
            <Plus className="w-4 h-4 mr-2" />
            Criar bairro
          </Button>
        </div>

        <div className="lg:col-span-2 bg-card rounded-xl border border-border shadow-sm">
          <div className="p-5 border-b border-border space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-display font-semibold text-foreground">Bairros cadastrados</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Bairros inativos deixam de aparecer para moradores.
                </p>
              </div>
              <Badge variant="secondary">{bairrosFiltrados.length} exibidos</Badge>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar bairro..."
                className="pl-10"
              />
            </div>
          </div>

          <div className="divide-y divide-border">
            {isLoading && (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Carregando bairros...
              </div>
            )}

            {!isLoading && bairrosFiltrados.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Nenhum bairro encontrado.
              </div>
            )}

            {!isLoading && bairrosFiltrados.map((bairro) => (
              <div key={bairro.id} className="p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between hover:bg-muted/40 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium text-foreground">{bairro.nome}</h4>
                      <Badge variant={bairro.ativo ? 'default' : 'secondary'} className={bairro.ativo ? 'bg-green-600' : ''}>
                        {bairro.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {bairro.cidade} - {bairro.estado}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setBairroEditando(bairro);
                      setNomeEdicao(bairro.nome);
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => alterarAtivo(bairro)}
                    disabled={isSaving}
                  >
                    {bairro.ativo ? (
                      <>
                        <PowerOff className="w-4 h-4 mr-2" />
                        Desativar
                      </>
                    ) : (
                      <>
                        <Power className="w-4 h-4 mr-2" />
                        Ativar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={Boolean(bairroEditando)} onOpenChange={(open) => !open && setBairroEditando(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar bairro</DialogTitle>
            <DialogDescription>
              Atualize o nome exibido para moradores e operadores.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="nome-edicao">Nome do bairro</Label>
            <Input
              id="nome-edicao"
              value={nomeEdicao}
              onChange={(event) => setNomeEdicao(event.target.value)}
              maxLength={100}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBairroEditando(null)}>Cancelar</Button>
            <Button onClick={salvarEdicao} disabled={isSaving || nomeEdicao.trim().length < 2}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
