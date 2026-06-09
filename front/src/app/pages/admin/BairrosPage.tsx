import { useCallback, useEffect, useMemo, useState } from 'react';
import { Crosshair, Edit, MapPin, Plus, Power, PowerOff, RefreshCw, Search } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { LocationPickerMap } from '../../components/LocationPickerMap';
import { getApiErrorMessage } from '../../services/apiClient';
import { geocodingService } from '../../services/geocodingService';
import { organizacaoService } from '../../services/organizacaoService';
import { useUser } from '../../contexts/UserContext';
import type { BairroResponseDTO, OrganizacaoResponseDTO } from '../../types/organizacao';

const defaultMapCenter = {
  latitude: -6.8371,
  longitude: -35.1261,
};

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .toLowerCase();
}

export function BairrosPage() {
  const { vinculosOperacionais } = useUser();
  const prefeituraId = vinculosOperacionais.find((vinculo) =>
    vinculo.ativo && vinculo.papel === 'ADMIN_PREFEITURA')?.organizacaoId;

  const [prefeitura, setPrefeitura] = useState<OrganizacaoResponseDTO | null>(null);
  const [bairros, setBairros] = useState<BairroResponseDTO[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [nomeBairro, setNomeBairro] = useState('');
  const [enderecoBusca, setEnderecoBusca] = useState('');
  const [centroideLatitude, setCentroideLatitude] = useState('');
  const [centroideLongitude, setCentroideLongitude] = useState('');
  const [mapCenterLatitude, setMapCenterLatitude] = useState(defaultMapCenter.latitude);
  const [mapCenterLongitude, setMapCenterLongitude] = useState(defaultMapCenter.longitude);
  const [bairroEditando, setBairroEditando] = useState<BairroResponseDTO | null>(null);
  const [nomeEdicao, setNomeEdicao] = useState('');
  const [enderecoBuscaEdicao, setEnderecoBuscaEdicao] = useState('');
  const [centroideLatitudeEdicao, setCentroideLatitudeEdicao] = useState('');
  const [centroideLongitudeEdicao, setCentroideLongitudeEdicao] = useState('');
  const [mapCenterLatitudeEdicao, setMapCenterLatitudeEdicao] = useState(defaultMapCenter.latitude);
  const [mapCenterLongitudeEdicao, setMapCenterLongitudeEdicao] = useState(defaultMapCenter.longitude);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
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
      const [response, organizacoes] = await Promise.all([
        organizacaoService.listarBairrosParaGestao(prefeituraId),
        organizacaoService.listar(),
      ]);

      setBairros(response);

      const prefeituraAtual = organizacoes.find((organizacao) => organizacao.id === prefeituraId) ?? null;
      setPrefeitura(prefeituraAtual);

      const latitudeBase = response[0]?.centroideLatitude ?? defaultMapCenter.latitude;
      const longitudeBase = response[0]?.centroideLongitude ?? defaultMapCenter.longitude;
      setMapCenterLatitude(latitudeBase);
      setMapCenterLongitude(longitudeBase);
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

  function parseCoordenadaOpcional(value: string) {
    const normalized = value.trim().replace(',', '.');
    if (!normalized) {
      return null;
    }

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : Number.NaN;
  }

  function validarCentroide(latitudeValue: string, longitudeValue: string) {
    const latitude = parseCoordenadaOpcional(latitudeValue);
    const longitude = parseCoordenadaOpcional(longitudeValue);

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return { invalido: true, latitude: null, longitude: null };
    }

    if ((latitude === null && longitude !== null) || (latitude !== null && longitude === null)) {
      return { invalido: true, latitude: null, longitude: null };
    }

    if (latitude !== null && (latitude < -90 || latitude > 90)) {
      return { invalido: true, latitude: null, longitude: null };
    }

    if (longitude !== null && (longitude < -180 || longitude > 180)) {
      return { invalido: true, latitude: null, longitude: null };
    }

    return { invalido: false, latitude, longitude };
  }

  function bairroDuplicado(nome: string, bairroAtualId?: number) {
    const normalized = normalize(nome);
    return bairros.some((bairro) => normalize(bairro.nome) === normalized && bairro.id !== bairroAtualId);
  }

  async function buscarCentroidePorEndereco(modo: 'criacao' | 'edicao') {
    const nome = modo === 'criacao' ? nomeBairro : nomeEdicao;
    const endereco = modo === 'criacao' ? enderecoBusca : enderecoBuscaEdicao;

    if (!prefeitura?.cidade || !endereco.trim()) {
      setError('Informe um endereco de referencia para buscar no mapa.');
      return;
    }

    setIsGeocoding(true);
    setError(null);

    try {
      const result = await geocodingService.buscarCoordenadas({
        endereco,
        bairro: nome,
        cidade: prefeitura.cidade,
        estado: prefeitura.estado,
      });

      if (!result) {
        setError('Nao foi possivel localizar esse endereco no mapa.');
        return;
      }

      if (modo === 'criacao') {
        setCentroideLatitude(String(result.latitude));
        setCentroideLongitude(String(result.longitude));
        setMapCenterLatitude(result.latitude);
        setMapCenterLongitude(result.longitude);
        if (result.bairro && !nomeBairro.trim()) {
          setNomeBairro(result.bairro);
        }
      } else {
        setCentroideLatitudeEdicao(String(result.latitude));
        setCentroideLongitudeEdicao(String(result.longitude));
        setMapCenterLatitudeEdicao(result.latitude);
        setMapCenterLongitudeEdicao(result.longitude);
        if (result.bairro && !nomeEdicao.trim()) {
          setNomeEdicao(result.bairro);
        }
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsGeocoding(false);
    }
  }

  async function usarLocalizacaoAtual(modo: 'criacao' | 'edicao') {
    if (!('geolocation' in navigator)) {
      setError('Seu navegador nao oferece suporte a geolocalizacao.');
      return;
    }

    setIsGeocoding(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const result = await geocodingService.buscarEndereco(latitude, longitude);

        if (modo === 'criacao') {
          setCentroideLatitude(String(latitude));
          setCentroideLongitude(String(longitude));
          setMapCenterLatitude(latitude);
          setMapCenterLongitude(longitude);
          if (result?.bairro) {
            setNomeBairro(result.bairro);
          }
          if (result?.endereco) {
            setEnderecoBusca(result.endereco);
          }
        } else {
          setCentroideLatitudeEdicao(String(latitude));
          setCentroideLongitudeEdicao(String(longitude));
          setMapCenterLatitudeEdicao(latitude);
          setMapCenterLongitudeEdicao(longitude);
          if (result?.bairro) {
            setNomeEdicao(result.bairro);
          }
          if (result?.endereco) {
            setEnderecoBuscaEdicao(result.endereco);
          }
        }
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setIsGeocoding(false);
      }
    }, () => {
      setIsGeocoding(false);
      setError('Nao foi possivel acessar sua localizacao atual.');
    }, {
      enableHighAccuracy: true,
      timeout: 10000,
    });
  }

  async function selecionarNoMapa(latitude: number, longitude: number, modo: 'criacao' | 'edicao') {
    setIsGeocoding(true);
    setError(null);

    try {
      const result = await geocodingService.buscarEndereco(latitude, longitude);

      if (modo === 'criacao') {
        setCentroideLatitude(String(latitude));
        setCentroideLongitude(String(longitude));
        setMapCenterLatitude(latitude);
        setMapCenterLongitude(longitude);
        if (result?.bairro) {
          setNomeBairro(result.bairro);
        }
        if (result?.endereco) {
          setEnderecoBusca(result.endereco);
        }
      } else {
        setCentroideLatitudeEdicao(String(latitude));
        setCentroideLongitudeEdicao(String(longitude));
        setMapCenterLatitudeEdicao(latitude);
        setMapCenterLongitudeEdicao(longitude);
        if (result?.bairro) {
          setNomeEdicao(result.bairro);
        }
        if (result?.endereco) {
          setEnderecoBuscaEdicao(result.endereco);
        }
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsGeocoding(false);
    }
  }

  async function criarBairro() {
    if (!prefeituraId || nomeBairro.trim().length < 2) {
      return;
    }

    if (bairroDuplicado(nomeBairro)) {
      setError('Ja existe um bairro com esse nome nesta prefeitura.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const centroide = validarCentroide(centroideLatitude, centroideLongitude);
      if (centroide.invalido) {
        setError('Informe latitude e longitude validas para o centroide, ou deixe os dois campos vazios.');
        return;
      }

      const criado = await organizacaoService.criarBairro(
        prefeituraId,
        nomeBairro.trim(),
        centroide.latitude,
        centroide.longitude,
      );
      setBairros((current) => [...current, criado].sort((a, b) => a.nome.localeCompare(b.nome)));
      setNomeBairro('');
      setEnderecoBusca('');
      setCentroideLatitude('');
      setCentroideLongitude('');
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

    if (bairroDuplicado(nomeEdicao, bairroEditando.id)) {
      setError('Ja existe um bairro com esse nome nesta prefeitura.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const centroide = validarCentroide(centroideLatitudeEdicao, centroideLongitudeEdicao);
      if (centroide.invalido) {
        setError('Informe latitude e longitude validas para o centroide, ou deixe os dois campos vazios.');
        return;
      }

      const atualizado = await organizacaoService.atualizarBairro(
        prefeituraId,
        bairroEditando.id,
        nomeEdicao.trim(),
        centroide.latitude,
        centroide.longitude,
      );
      setBairros((current) => current
        .map((bairro) => bairro.id === atualizado.id ? atualizado : bairro)
        .sort((a, b) => a.nome.localeCompare(b.nome)));
      setBairroEditando(null);
      setNomeEdicao('');
      setEnderecoBuscaEdicao('');
      setCentroideLatitudeEdicao('');
      setCentroideLongitudeEdicao('');
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
  const cidadeExibida = prefeitura ? `${prefeitura.cidade} - ${prefeitura.estado}` : 'Nao carregada';

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">
            Bairros da Cidade
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie os bairros usados pela prefeitura e pelos moradores nos relatos.
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
          <p className="text-2xl font-display font-bold text-emerald-600 mt-1">{ativos}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <p className="text-sm text-muted-foreground">Cidade</p>
          <p className="text-lg font-display font-bold text-foreground mt-1">{cidadeExibida}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-6">
        <div className="bg-card rounded-xl border border-border p-5 space-y-4">
          <div>
            <h3 className="font-display font-semibold text-foreground">Novo bairro</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Informe o nome oficial e, se quiser, use mapa, endereco de referencia ou localizacao atual para preencher o centroide.
            </p>
          </div>

          <LocationPickerMap
            centerLatitude={mapCenterLatitude}
            centerLongitude={mapCenterLongitude}
            markerLatitude={parseCoordenadaOpcional(centroideLatitude)}
            markerLongitude={parseCoordenadaOpcional(centroideLongitude)}
            isUpdating={isGeocoding}
            onPick={(latitude, longitude) => selecionarNoMapa(latitude, longitude, 'criacao')}
          />

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome-bairro">Nome do bairro</Label>
                <Input
                  id="nome-bairro"
                  value={nomeBairro}
                  onChange={(event) => setNomeBairro(event.target.value)}
                  placeholder="Ex: Centro"
                  maxLength={100}
                  className="border-border bg-background/80 shadow-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endereco-busca">Endereco para localizar no mapa</Label>
                <Input
                  id="endereco-busca"
                  value={enderecoBusca}
                  onChange={(event) => setEnderecoBusca(event.target.value)}
                  placeholder="Ex: Praca da Matriz"
                  className="border-border bg-background/80 shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="centroide-latitude">Latitude (opcional)</Label>
                  <Input
                    id="centroide-latitude"
                    value={centroideLatitude}
                    onChange={(event) => setCentroideLatitude(event.target.value)}
                    placeholder="Ex: -6.838"
                    inputMode="decimal"
                    className="border-border bg-background/80 shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="centroide-longitude">Longitude (opcional)</Label>
                  <Input
                    id="centroide-longitude"
                    value={centroideLongitude}
                    onChange={(event) => setCentroideLongitude(event.target.value)}
                    placeholder="Ex: -35.126"
                    inputMode="decimal"
                    className="border-border bg-background/80 shadow-sm"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={() => buscarCentroidePorEndereco('criacao')} disabled={isGeocoding || !enderecoBusca.trim()}>
                  <Search className="mr-2 h-4 w-4" />
                  Buscar no mapa
                </Button>
                <Button type="button" variant="outline" onClick={() => usarLocalizacaoAtual('criacao')} disabled={isGeocoding}>
                  <Crosshair className="mr-2 h-4 w-4" />
                  Localizacao atual
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                O sistema ja impede bairros repetidos nesta prefeitura.
              </p>
            </div>
          </div>

          <Button className="w-full" onClick={criarBairro} disabled={isSaving || nomeBairro.trim().length < 2 || !prefeituraId}>
            <Plus className="w-4 h-4 mr-2" />
            Criar bairro
          </Button>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm">
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
                className="pl-10 border-border bg-background/80 shadow-sm"
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
                      <Badge className={bairro.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}>
                        {bairro.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {bairro.cidade} - {bairro.estado}
                    </p>
                    {bairro.centroideLatitude !== null && bairro.centroideLongitude !== null && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Centroide: {bairro.centroideLatitude.toFixed(5)}, {bairro.centroideLongitude.toFixed(5)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setBairroEditando(bairro);
                      setNomeEdicao(bairro.nome);
                      setEnderecoBuscaEdicao('');
                      setCentroideLatitudeEdicao(bairro.centroideLatitude?.toString() ?? '');
                      setCentroideLongitudeEdicao(bairro.centroideLongitude?.toString() ?? '');
                      setMapCenterLatitudeEdicao(bairro.centroideLatitude ?? mapCenterLatitude);
                      setMapCenterLongitudeEdicao(bairro.centroideLongitude ?? mapCenterLongitude);
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

      <Dialog
        open={Boolean(bairroEditando)}
        onOpenChange={(open) => {
          if (!open) {
            setBairroEditando(null);
            setEnderecoBuscaEdicao('');
            setCentroideLatitudeEdicao('');
            setCentroideLongitudeEdicao('');
          }
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Editar bairro</DialogTitle>
            <DialogDescription>
              Atualize nome, centroide e referencia visual no mapa.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <LocationPickerMap
              centerLatitude={mapCenterLatitudeEdicao}
              centerLongitude={mapCenterLongitudeEdicao}
              markerLatitude={parseCoordenadaOpcional(centroideLatitudeEdicao)}
              markerLongitude={parseCoordenadaOpcional(centroideLongitudeEdicao)}
              isUpdating={isGeocoding}
              onPick={(latitude, longitude) => selecionarNoMapa(latitude, longitude, 'edicao')}
            />
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome-edicao">Nome do bairro</Label>
                  <Input
                    id="nome-edicao"
                    value={nomeEdicao}
                    onChange={(event) => setNomeEdicao(event.target.value)}
                    maxLength={100}
                    className="border-border bg-background/80 shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endereco-busca-edicao">Endereco para localizar no mapa</Label>
                  <Input
                    id="endereco-busca-edicao"
                    value={enderecoBuscaEdicao}
                    onChange={(event) => setEnderecoBuscaEdicao(event.target.value)}
                    className="border-border bg-background/80 shadow-sm"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="centroide-latitude-edicao">Latitude (opcional)</Label>
                    <Input
                      id="centroide-latitude-edicao"
                      value={centroideLatitudeEdicao}
                      onChange={(event) => setCentroideLatitudeEdicao(event.target.value)}
                      inputMode="decimal"
                      className="border-border bg-background/80 shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="centroide-longitude-edicao">Longitude (opcional)</Label>
                    <Input
                      id="centroide-longitude-edicao"
                      value={centroideLongitudeEdicao}
                      onChange={(event) => setCentroideLongitudeEdicao(event.target.value)}
                      inputMode="decimal"
                      className="border-border bg-background/80 shadow-sm"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" onClick={() => buscarCentroidePorEndereco('edicao')} disabled={isGeocoding || !enderecoBuscaEdicao.trim()}>
                    <Search className="mr-2 h-4 w-4" />
                    Buscar no mapa
                  </Button>
                  <Button type="button" variant="outline" onClick={() => usarLocalizacaoAtual('edicao')} disabled={isGeocoding}>
                    <Crosshair className="mr-2 h-4 w-4" />
                    Localizacao atual
                  </Button>
                </div>
              </div>
            </div>
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
