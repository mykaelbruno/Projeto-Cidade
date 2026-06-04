import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import cliente from '../../api/cliente';
import { useAuth } from '../../contextos/AuthContext';

const DashboardAdmin = () => {
  const queryClient = useQueryClient();
  const { usuario } = useAuth();
  const isPrefeituraAdmin = usuario?.perfilGlobal === 'ADMIN_PREFEITURA';

  const [abaAtiva, setAbaAtiva] = useState('ORGANIZACOES'); // ORGANIZACOES, CATEGORIAS, AUDITORIA

  // Estados de Formulário - Prefeitura
  const [nomePrefeitura, setNomePrefeitura] = useState('');
  const [cidadePrefeitura, setCidadePrefeitura] = useState('');
  const [estadoPrefeitura, setEstadoPrefeitura] = useState('PB');

  // Estados de Formulário - Secretaria
  const [prefeituraSelecionadaId, setPrefeituraSelecionadaId] = useState('');
  const [nomeSecretaria, setNomeSecretaria] = useState('');
  const [categoriasSecretaria, setCategoriasSecretaria] = useState([]); // FB-17

  // Estados de Formulário - Operador Institucional
  const [opCidade, setOpCidade] = useState(''); // FB-16
  const [orgSelecionadaId, setOrgSelecionadaId] = useState('');
  const [opNome, setOpNome] = useState('');
  const [opEmail, setOpEmail] = useState('');
  const [opUsername, setOpUsername] = useState('');
  const [opSenha, setOpSenha] = useState('');
  const [opTelefone, setOpTelefone] = useState('');
  const [opTipoVinculoSecretaria, setOpTipoVinculoSecretaria] = useState('ATENDENTE'); // FB-16 (ADMIN ou ATENDENTE)

  // Estados de Formulário - Categoria
  const [nomeCategoria, setNomeCategoria] = useState('');
  const [descCategoria, setDescCategoria] = useState('');
  const [responsavelCategoriaId, setResponsavelCategoriaId] = useState('');

  // Estados de Auditoria
  const [paginaAuditoria, setPaginaAuditoria] = useState(0);

  // Estados de modais de edição — Organização (Integração 4)
  const [editOrg, setEditOrg] = useState(null); // { id, nome, tipo }
  const [editOrgNome, setEditOrgNome] = useState('');
  const [editOrgTipo, setEditOrgTipo] = useState('');

  // Estados de modais de edição — Categoria (Integração 5)
  const [editCat, setEditCat] = useState(null); // { id, nome, descricao, responsavelId }
  const [editCatNome, setEditCatNome] = useState('');
  const [editCatDesc, setEditCatDesc] = useState('');
  const [editCatResponsavelId, setEditCatResponsavelId] = useState('');

  // Estados de modais de edição — Vínculo (Integração 6)
  const [editVinculo, setEditVinculo] = useState(null); // { id, papel, ativo }
  const [editVinculoPapel, setEditVinculoPapel] = useState('');

  // 1. Carregar Organizações
  const { data: organizacoes = [], refetch: recarregarOrganizacoes } = useQuery({
    queryKey: ['admin-organizacoes'],
    queryFn: async () => {
      const response = await cliente.get('/api/organizacoes');
      return response.data;
    },
    enabled: abaAtiva === 'ORGANIZACOES' || abaAtiva === 'CATEGORIAS' || abaAtiva === 'USUARIOS',
  });

  const prefeituraDoOperador = organizacoes.find(o => o.tipo === 'PREFEITURA' && o.cidade === usuario?.cidade);

  useEffect(() => {
    if (isPrefeituraAdmin) {
      if (prefeituraDoOperador && !prefeituraSelecionadaId) {
        setTimeout(() => {
          setPrefeituraSelecionadaId(prefeituraDoOperador.id.toString());
        }, 0);
      }
      if (usuario?.cidade && !opCidade) {
        setTimeout(() => {
          setOpCidade(usuario.cidade);
        }, 0);
      }
    }
  }, [isPrefeituraAdmin, prefeituraDoOperador, prefeituraSelecionadaId, usuario, opCidade]);

  // 2. Carregar Categorias
  const { data: categorias = [], refetch: recarregarCategorias } = useQuery({
    queryKey: ['admin-categorias'],
    queryFn: async () => {
      const response = await cliente.get('/api/categorias');
      return response.data;
    },
    enabled: abaAtiva === 'ORGANIZACOES' || abaAtiva === 'CATEGORIAS',
  });

  // 3. Carregar Auditoria
  const { data: auditoriaData } = useQuery({
    queryKey: ['admin-auditorias', paginaAuditoria],
    queryFn: async () => {
      const response = await cliente.get('/api/auditorias', {
        params: {
          page: paginaAuditoria,
          size: 15,
        }
      });
      return response.data;
    },
    enabled: abaAtiva === 'AUDITORIA',
  });
  const auditorias = auditoriaData?.content || [];
  const totalPaginasAuditoria = auditoriaData?.totalPages || 0;

  // 4. Carregar Usuários do Sistema
  const { data: usuariosList = [], refetch: recarregarUsuarios } = useQuery({
    queryKey: ['admin-usuarios'],
    queryFn: async () => {
      const response = await cliente.get('/api/usuarios');
      return response.data;
    },
    enabled: abaAtiva === 'USUARIOS',
  });

  // 5. Carregar Vínculos do Sistema
  const { data: vinculosList = [] } = useQuery({
    queryKey: ['admin-vinculos'],
    queryFn: async () => {
      const response = await cliente.get('/api/vinculos');
      return response.data;
    },
    enabled: abaAtiva === 'USUARIOS',
  });

  const usuariosExibidos = isPrefeituraAdmin
    ? usuariosList.filter(u => u.cidade === usuario?.cidade)
    : usuariosList;

  const vinculosExibidos = isPrefeituraAdmin
    ? vinculosList.filter(v => {
        const org = organizacoes.find(o => o.id === v.organizacaoId);
        return org && org.cidade === usuario?.cidade;
      })
    : vinculosList;

  // MUTAÇÕES
  const ativacaoUsuarioMutacao = useMutation({
    mutationFn: async ({ id, ativo }) => {
      await cliente.patch(`/api/usuarios/${id}/ativacao`, { ativo });
    },
    onSuccess: () => {
      recarregarUsuarios();
      alert('Situação da conta do usuário alterada com sucesso!');
    },
    onError: (err) => alert(err.response?.data?.mensagem || 'Erro ao alterar situação da conta do usuário.'),
  });

  const prefeituraMutacao = useMutation({
    mutationFn: async (dados) => {
      await cliente.post('/api/organizacoes/prefeituras', dados);
    },
    onSuccess: () => {
      setNomePrefeitura('');
      setCidadePrefeitura('');
      recarregarOrganizacoes();
      alert('Prefeitura cadastrada com sucesso!');
    },
    onError: (err) => alert(err.response?.data?.mensagem || 'Erro ao cadastrar prefeitura.'),
  });

  const secretariaMutacao = useMutation({
    mutationFn: async ({ prefeituraId, dados }) => {
      await cliente.post(`/api/organizacoes/prefeituras/${prefeituraId}/secretarias`, dados);
    },
    onSuccess: () => {
      setPrefeituraSelecionadaId('');
      setNomeSecretaria('');
      setCategoriasSecretaria([]);
      recarregarOrganizacoes();
      alert('Secretaria cadastrada com sucesso!');
    },
    onError: (err) => alert(err.response?.data?.mensagem || 'Erro ao cadastrar secretaria.'),
  });

  const operadorMutacao = useMutation({
    mutationFn: async ({ orgId, dados }) => {
      await cliente.post(`/api/organizacoes/${orgId}/usuarios-institucionais`, dados);
    },
    onSuccess: () => {
      setOpCidade('');
      setOrgSelecionadaId('');
      setOpNome('');
      setOpEmail('');
      setOpUsername('');
      setOpSenha('');
      setOpTelefone('');
      setOpTipoVinculoSecretaria('ATENDENTE');
      alert('Operador institucional cadastrado com sucesso!');
    },
    onError: (err) => alert(err.response?.data?.mensagem || 'Erro ao cadastrar operador.'),
  });

  const categoriaMutacao = useMutation({
    mutationFn: async (dados) => {
      await cliente.post('/api/categorias', dados);
    },
    onSuccess: () => {
      setNomeCategoria('');
      setDescCategoria('');
      setResponsavelCategoriaId('');
      recarregarCategorias();
      alert('Categoria criada com sucesso!');
    },
    onError: (err) => alert(err.response?.data?.mensagem || 'Erro ao criar categoria.'),
  });

  // MUTAÇÃO: Editar Organização (PUT) — Integração 4
  const editarOrgMutacao = useMutation({
    mutationFn: async ({ id, dados }) => {
      await cliente.put(`/api/organizacoes/${id}`, dados);
    },
    onSuccess: () => {
      setEditOrg(null);
      queryClient.invalidateQueries({ queryKey: ['admin-organizacoes'] });
    },
    onError: (err) => alert(err.response?.data?.mensagem || 'Erro ao editar organização.'),
  });

  // MUTAÇÃO: Ativar/Desativar Organização (PATCH) — Integração 4
  const ativacaoOrgMutacao = useMutation({
    mutationFn: async ({ id, ativo }) => {
      await cliente.patch(`/api/organizacoes/${id}/ativacao`, { ativo });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-organizacoes'] });
    },
    onError: (err) => alert(err.response?.data?.mensagem || 'Erro ao alterar status da organização.'),
  });

  // MUTAÇÃO: Editar Categoria (PUT) — Integração 5
  const editarCatMutacao = useMutation({
    mutationFn: async ({ id, dados }) => {
      await cliente.put(`/api/categorias/${id}`, dados);
    },
    onSuccess: () => {
      setEditCat(null);
      queryClient.invalidateQueries({ queryKey: ['admin-categorias'] });
    },
    onError: (err) => alert(err.response?.data?.mensagem || 'Erro ao editar categoria.'),
  });

  // MUTAÇÃO: Ativar/Desativar Categoria (PATCH) — Integração 5
  const ativacaoCatMutacao = useMutation({
    mutationFn: async ({ id, ativa }) => {
      await cliente.patch(`/api/categorias/${id}/ativacao`, { ativa });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categorias'] });
    },
    onError: (err) => alert(err.response?.data?.mensagem || 'Erro ao alterar status da categoria.'),
  });

  // MUTAÇÃO: Editar Vínculo (PUT) — Integração 6
  const editarVinculoMutacao = useMutation({
    mutationFn: async ({ id, dados }) => {
      await cliente.put(`/api/vinculos/${id}`, dados);
    },
    onSuccess: () => {
      setEditVinculo(null);
      queryClient.invalidateQueries({ queryKey: ['admin-vinculos'] });
    },
    onError: (err) => alert(err.response?.data?.mensagem || 'Erro ao editar vínculo.'),
  });

  const handleCriarPrefeitura = (e) => {
    e.preventDefault();
    if (!nomePrefeitura || !cidadePrefeitura || !estadoPrefeitura) return;
    prefeituraMutacao.mutate({
      nome: nomePrefeitura,
      cidade: cidadePrefeitura,
      estado: estadoPrefeitura,
      verificada: true,
    });
  };

  const handleCriarSecretaria = (e) => {
    e.preventDefault();
    if (!prefeituraSelecionadaId || !nomeSecretaria) return;
    secretariaMutacao.mutate({
      prefeituraId: Number(prefeituraSelecionadaId),
      dados: { nome: nomeSecretaria, categoriasIds: categoriasSecretaria },
    });
  };

  const handleCriarOperador = (e) => {
    e.preventDefault();
    const org = organizacoes.find(o => o.id === Number(orgSelecionadaId));
    if (!org) return;
    const papelFinal = org.tipo === 'PREFEITURA' 
      ? 'ADMIN_PREFEITURA' 
      : (opTipoVinculoSecretaria === 'ADMIN' ? 'ADMIN_SECRETARIA' : 'ATENDENTE_SECRETARIA');

    if (!orgSelecionadaId || !opNome || !opEmail || !opUsername || !opSenha || !papelFinal) return;
    operadorMutacao.mutate({
      orgId: Number(orgSelecionadaId),
      dados: {
        nome: opNome,
        email: opEmail,
        username: opUsername,
        senha: opSenha,
        telefone: opTelefone || '',
        papel: papelFinal,
      }
    });
  };

  const handleCriarCategoria = (e) => {
    e.preventDefault();
    if (!nomeCategoria || !descCategoria) return;
    categoriaMutacao.mutate({
      nome: nomeCategoria,
      descricao: descCategoria,
      organizacaoResponsavelPadraoId: responsavelCategoriaId ? Number(responsavelCategoriaId) : null,
    });
  };

  const formataData = (dataStr) => {
    return new Date(dataStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const abrirEditOrg = (org) => {
    setEditOrg(org);
    setEditOrgNome(org.nome);
    setEditOrgTipo(org.tipo);
  };

  const handleSalvarOrg = (e) => {
    e.preventDefault();
    if (!editOrgNome.trim()) return;
    editarOrgMutacao.mutate({ id: editOrg.id, dados: { nome: editOrgNome, tipo: editOrgTipo } });
  };

  const abrirEditCat = (cat) => {
    setEditCat(cat);
    setEditCatNome(cat.nome);
    setEditCatDesc(cat.descricao || '');
    setEditCatResponsavelId(cat.organizacaoResponsavelPadraoId || '');
  };

  const handleSalvarCat = (e) => {
    e.preventDefault();
    if (!editCatNome.trim() || !editCatDesc.trim()) return;
    editarCatMutacao.mutate({
      id: editCat.id,
      dados: {
        nome: editCatNome,
        descricao: editCatDesc,
        organizacaoResponsavelPadraoId: editCatResponsavelId ? Number(editCatResponsavelId) : null,
      },
    });
  };

  const abrirEditVinculo = (v) => {
    setEditVinculo(v);
    setEditVinculoPapel(v.papel);
  };

  const handleSalvarVinculo = (e) => {
    e.preventDefault();
    editarVinculoMutacao.mutate({
      id: editVinculo.id,
      dados: { papel: editVinculoPapel, ativo: editVinculo.ativo },
    });
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Menu Superior - Abas */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-6 text-sm font-semibold">
          <button
            onClick={() => setAbaAtiva('ORGANIZACOES')}
            className={`pb-3 border-b-2 transition-colors cursor-pointer ${
              abaAtiva === 'ORGANIZACOES' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Organizações & Operadores
          </button>
          {!isPrefeituraAdmin && (
            <button
              onClick={() => setAbaAtiva('CATEGORIAS')}
              className={`pb-3 border-b-2 transition-colors cursor-pointer ${
                abaAtiva === 'CATEGORIAS' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              Categorias Globais
            </button>
          )}
          <button
            onClick={() => setAbaAtiva('USUARIOS')}
            className={`pb-3 border-b-2 transition-colors cursor-pointer ${
              abaAtiva === 'USUARIOS' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Usuários & Vínculos
          </button>
          {!isPrefeituraAdmin && (
            <button
              onClick={() => setAbaAtiva('AUDITORIA')}
              className={`pb-3 border-b-2 transition-colors cursor-pointer ${
                abaAtiva === 'AUDITORIA' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              Auditoria Geral
            </button>
          )}
        </nav>
      </div>

      {/* ABA 1: ORGANIZACOES E OPERADORES */}
      {abaAtiva === 'ORGANIZACOES' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Formulários Administrativos (Esquerda) */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* 1. Cadastrar Prefeitura */}
            {!isPrefeituraAdmin && (
              <div className="bg-white border border-gray-200 shadow-xs rounded-xl p-5 space-y-3">
                <h3 className="text-sm font-bold text-gray-900">🏢 Cadastrar Nova Prefeitura</h3>
                <form onSubmit={handleCriarPrefeitura} className="space-y-3">
                  <div>
                    <input
                      type="text"
                      value={nomePrefeitura}
                      onChange={(e) => setNomePrefeitura(e.target.value)}
                      placeholder="Nome da prefeitura"
                      className="w-full text-xs border border-gray-300 rounded-lg p-2 text-gray-900"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={cidadePrefeitura}
                      onChange={(e) => setCidadePrefeitura(e.target.value)}
                      placeholder="Cidade"
                      className="col-span-2 text-xs border border-gray-300 rounded-lg p-2 text-gray-900"
                      required
                    />
                    <input
                      type="text"
                      value={estadoPrefeitura}
                      onChange={(e) => setEstadoPrefeitura(e.target.value)}
                      placeholder="UF"
                      maxLength={2}
                      className="text-xs border border-gray-300 rounded-lg p-2 text-gray-900 text-center"
                      required
                    />
                  </div>
                  <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-1.5 rounded-lg text-xs cursor-pointer shadow-xs">
                    Criar Prefeitura
                  </button>
                </form>
              </div>
            )}

            {/* 2. Cadastrar Secretaria */}
            <div className="bg-white border border-gray-200 shadow-xs rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-gray-900">📁 Cadastrar Nova Secretaria</h3>
              <form onSubmit={handleCriarSecretaria} className="space-y-3">
                <div>
                  <select
                    value={prefeituraSelecionadaId}
                    onChange={(e) => setPrefeituraSelecionadaId(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-lg p-2 text-gray-900 disabled:bg-gray-150"
                    required
                    disabled={isPrefeituraAdmin}
                  >
                    <option value="">Selecione a prefeitura...</option>
                    {organizacoes.filter(o => o.tipo === 'PREFEITURA').map(o => (
                      <option key={o.id} value={o.id}>{o.nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <input
                    type="text"
                    value={nomeSecretaria}
                    onChange={(e) => setNomeSecretaria(e.target.value)}
                    placeholder="Nome da secretaria (Ex: Secretaria de Saúde)"
                    className="w-full text-xs border border-gray-300 rounded-lg p-2 text-gray-900"
                    required
                  />
                </div>
                {/* Checklist de Categorias a Associar (FB-17) */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold text-gray-500 uppercase block">Categorias de Relatos Atendidos</span>
                  {categorias.length === 0 ? (
                    <span className="text-[10px] text-gray-400 italic block">Nenhuma categoria global cadastrada.</span>
                  ) : (
                    <div className="grid grid-cols-2 gap-1.5 max-h-24 overflow-y-auto border border-gray-200 rounded-lg p-2 bg-gray-50">
                      {categorias.filter(c => c.ativa !== false).map(cat => (
                        <label key={cat.id} className="flex items-center gap-1.5 text-[10px] text-gray-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={categoriasSecretaria.includes(cat.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setCategoriasSecretaria([...categoriasSecretaria, cat.id]);
                              } else {
                                setCategoriasSecretaria(categoriasSecretaria.filter(id => id !== cat.id));
                              }
                            }}
                            className="rounded-sm border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="truncate">{cat.nome}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-1.5 rounded-lg text-xs cursor-pointer shadow-xs">
                  Criar Secretaria
                </button>
              </form>
            </div>

            {/* 3. Cadastrar Operador Institucional */}
            {(() => {
              const prefeituras = organizacoes.filter(o => o.tipo === 'PREFEITURA');
              const cidadesDisponiveis = Array.from(new Set(prefeituras.map(p => p.cidade).filter(Boolean)));

              return (
                <div className="bg-white border border-gray-200 shadow-xs rounded-xl p-5 space-y-3">
                  <h3 className="text-sm font-bold text-gray-900">👤 Cadastrar Operador Institucional</h3>
                  <form onSubmit={handleCriarOperador} className="space-y-3">
                    
                    {/* Seletor Dinâmico de Cidades e Organização (FB-16) */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Cidade</label>
                        <select
                          value={opCidade}
                          onChange={(e) => {
                            setOpCidade(e.target.value);
                            setOrgSelecionadaId('');
                          }}
                          className="w-full text-xs border border-gray-300 rounded-lg p-2 text-gray-900 cursor-pointer disabled:bg-gray-150"
                          required
                          disabled={isPrefeituraAdmin}
                        >
                          <option value="">Selecione...</option>
                          {cidadesDisponiveis.map(cidade => (
                            <option key={cidade} value={cidade}>{cidade}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Organização</label>
                        <select
                          value={orgSelecionadaId}
                          onChange={(e) => setOrgSelecionadaId(e.target.value)}
                          className="w-full text-xs border border-gray-300 rounded-lg p-2 text-gray-900 cursor-pointer"
                          required
                          disabled={!opCidade}
                        >
                          <option value="">Selecione...</option>
                          {organizacoes
                            .filter(o => o.cidade === opCidade && o.ativo !== false)
                            .map(o => (
                              <option key={o.id} value={o.id}>{o.nome} ({o.tipo})</option>
                            ))}
                        </select>
                      </div>
                    </div>

                    {/* Exibição condicional do Switch de Vínculo na Secretaria (FB-16) */}
                    {(() => {
                      const org = organizacoes.find(o => o.id === Number(orgSelecionadaId));
                      if (org && org.tipo === 'SECRETARIA') {
                        return (
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 space-y-1">
                            <span className="text-[10px] font-bold text-gray-500 uppercase block">Tipo de Vínculo</span>
                            <div className="flex gap-4">
                              <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
                                <input
                                  type="radio"
                                  name="opTipoVinculoSecretaria"
                                  value="ATENDENTE"
                                  checked={opTipoVinculoSecretaria === 'ATENDENTE'}
                                  onChange={() => setOpTipoVinculoSecretaria('ATENDENTE')}
                                  className="text-indigo-600 focus:ring-indigo-500"
                                />
                                <span>Atendente</span>
                              </label>
                              <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
                                <input
                                  type="radio"
                                  name="opTipoVinculoSecretaria"
                                  value="ADMIN"
                                  checked={opTipoVinculoSecretaria === 'ADMIN'}
                                  onChange={() => setOpTipoVinculoSecretaria('ADMIN')}
                                  className="text-indigo-600 focus:ring-indigo-500"
                                />
                                <span>Administrador</span>
                              </label>
                            </div>
                          </div>
                        );
                      }
                      if (org && org.tipo === 'PREFEITURA') {
                        return (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-[10px] text-blue-800 font-medium">
                            ℹ️ O operador de prefeitura receberá o papel de <strong>Admin Prefeitura</strong>.
                          </div>
                        );
                      }
                      return null;
                    })()}

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={opNome}
                        onChange={(e) => setOpNome(e.target.value)}
                        placeholder="Nome completo"
                        className="text-xs border border-gray-300 rounded-lg p-2 text-gray-900"
                        required
                      />
                      <input
                        type="email"
                        value={opEmail}
                        onChange={(e) => setOpEmail(e.target.value)}
                        placeholder="E-mail institucional"
                        className="text-xs border border-gray-300 rounded-lg p-2 text-gray-900"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={opUsername}
                        onChange={(e) => setOpUsername(e.target.value)}
                        placeholder="Username"
                        className="text-xs border border-gray-300 rounded-lg p-2 text-gray-900"
                        required
                      />
                      <input
                        type="password"
                        value={opSenha}
                        onChange={(e) => setOpSenha(e.target.value)}
                        placeholder="Senha temporária"
                        className="text-xs border border-gray-300 rounded-lg p-2 text-gray-900"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={opTelefone}
                        onChange={(e) => setOpTelefone(e.target.value)}
                        placeholder="Telefone"
                        className="w-full text-xs border border-gray-300 rounded-lg p-2 text-gray-900"
                      />
                    </div>
                    <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-1.5 rounded-lg text-xs cursor-pointer shadow-xs">
                      Criar Operador
                    </button>
                  </form>
                </div>
              );
            })()}

          </div>

          {/* Listagem de Organizações Cadastradas (Direita) */}
          <div className="bg-white border border-gray-200 shadow-xs rounded-xl p-6 lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-gray-950 flex items-center gap-1.5">
              <span>📋</span> Lista Geral de Organizações e Cidades
            </h3>

            {/* Modal de Edição de Organização */}
            {editOrg && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 space-y-3 mb-2">
                <h4 className="text-xs font-bold text-indigo-950">✏️ Editar Organização #{editOrg.id}</h4>
                <form onSubmit={handleSalvarOrg} className="space-y-3">
                  <input
                    type="text"
                    value={editOrgNome}
                    onChange={(e) => setEditOrgNome(e.target.value)}
                    placeholder="Nome da organização"
                    className="w-full text-xs border border-gray-300 rounded-lg p-2 text-gray-900"
                    required
                  />
                  <select
                    value={editOrgTipo}
                    onChange={(e) => setEditOrgTipo(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-lg p-2 text-gray-900 cursor-pointer"
                  >
                    <option value="PREFEITURA">PREFEITURA</option>
                    <option value="SECRETARIA">SECRETARIA</option>
                  </select>
                  <div className="flex gap-2 justify-end">
                    <button type="button" onClick={() => setEditOrg(null)} className="text-xs bg-white border border-gray-300 px-3 py-1.5 rounded-lg cursor-pointer">Cancelar</button>
                    <button type="submit" disabled={editarOrgMutacao.isPending} className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg cursor-pointer disabled:opacity-60">
                      {editarOrgMutacao.isPending ? 'Salvando...' : 'Salvar'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {organizacoes.length === 0 ? (
              <p className="text-xs text-gray-500 italic py-6 text-center">Nenhuma organização cadastrada.</p>
            ) : (
              <div className="space-y-4">
                {(() => {
                  const prefeituras = organizacoes.filter(org => {
                    if (org.tipo !== 'PREFEITURA') return false;
                    if (isPrefeituraAdmin) {
                      return org.cidade === usuario?.cidade;
                    }
                    return true;
                  });
                  const prefeituraIds = prefeituras.map(p => p.id);
                  const secretariasAvulsas = isPrefeituraAdmin ? [] : organizacoes.filter(org => org.tipo === 'SECRETARIA' && (!org.organizacaoPaiId || !prefeituraIds.includes(org.organizacaoPaiId)));

                  return (
                    <>
                      {/* Loop de Prefeituras */}
                      {prefeituras.map(prefeitura => {
                        const secretariasPrefeitura = organizacoes.filter(org => org.tipo === 'SECRETARIA' && org.organizacaoPaiId === prefeitura.id);

                        return (
                          <div key={prefeitura.id} className="border border-gray-200 rounded-xl overflow-hidden shadow-xs bg-white">
                            {/* Prefeitura Header */}
                            <div className="bg-gray-50 px-4 py-3 flex justify-between items-center border-b border-gray-200">
                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-sm font-bold text-gray-900">{prefeitura.nome}</span>
                                  <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-semibold text-[9px]">PREFEITURA</span>
                                  <span className={`px-2 py-0.5 rounded-md font-semibold text-[9px] ${
                                    prefeitura.ativo !== false ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                  }`}>
                                    {prefeitura.ativo !== false ? 'Ativa' : 'Inativa'}
                                  </span>
                                  <span className="text-[10px] text-gray-400 font-medium">#{prefeitura.id}</span>
                                </div>
                                <p className="text-[11px] text-gray-500 font-medium">Localização: {prefeitura.cidade} - {prefeitura.estado}</p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => abrirEditOrg(prefeitura)}
                                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-md font-bold text-[10px] cursor-pointer"
                                >
                                  Editar
                                </button>
                                <button
                                  onClick={() => ativacaoOrgMutacao.mutate({ id: prefeitura.id, ativo: !(prefeitura.ativo !== false) })}
                                  className={`px-2.5 py-1 rounded-md font-bold text-[10px] cursor-pointer transition-colors ${
                                    prefeitura.ativo !== false
                                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                      : 'bg-green-50 text-green-600 hover:bg-green-100'
                                  }`}
                                >
                                  {prefeitura.ativo !== false ? 'Desativar' : 'Ativar'}
                                </button>
                              </div>
                            </div>

                            {/* Secretarias da Prefeitura */}
                            <div className="p-4 bg-white space-y-3">
                              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                <span>↳</span> Secretarias Vinculadas ({secretariasPrefeitura.length})
                              </h4>
                              {secretariasPrefeitura.length === 0 ? (
                                <p className="text-xs text-gray-400 italic pl-3 py-1">Nenhuma secretaria vinculada.</p>
                              ) : (
                                <div className="pl-3 border-l border-gray-200 space-y-2">
                                  {secretariasPrefeitura.map(sec => (
                                    <div key={sec.id} className="flex justify-between items-center p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100/80 border border-gray-100 transition-colors">
                                      <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                          <span className="font-semibold text-gray-800 text-xs">{sec.nome}</span>
                                          <span className={`px-1.5 py-0.5 rounded-md font-semibold text-[8px] ${
                                            sec.ativo !== false ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                          }`}>
                                            {sec.ativo !== false ? 'Ativa' : 'Inativa'}
                                          </span>
                                          <span className="text-[9px] text-gray-400 font-medium">#{sec.id}</span>
                                        </div>
                                      </div>
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => abrirEditOrg(sec)}
                                          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md font-bold text-[9px] cursor-pointer"
                                        >
                                          Editar
                                        </button>
                                        <button
                                          onClick={() => ativacaoOrgMutacao.mutate({ id: sec.id, ativo: !(sec.ativo !== false) })}
                                          className={`px-2 py-0.5 rounded-md font-bold text-[9px] cursor-pointer transition-colors ${
                                            sec.ativo !== false
                                              ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                              : 'bg-green-50 text-green-600 hover:bg-green-100'
                                          }`}
                                        >
                                          {sec.ativo !== false ? 'Desativar' : 'Ativar'}
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {/* Secretarias Avulsas / Legado */}
                      {secretariasAvulsas.length > 0 && (
                        <div className="border border-dashed border-gray-300 rounded-xl overflow-hidden bg-gray-50/50 p-4 space-y-3">
                          <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                            ⚠️ Secretarias Sem Prefeitura Vinculada ({secretariasAvulsas.length})
                          </h4>
                          <div className="space-y-2">
                            {secretariasAvulsas.map(sec => (
                              <div key={sec.id} className="flex justify-between items-center p-2.5 bg-white rounded-lg border border-gray-200 shadow-2xs hover:bg-gray-50 transition-colors">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-800 text-xs">{sec.nome}</span>
                                    <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-md font-semibold text-[8px]">SECRETARIA</span>
                                    <span className={`px-1.5 py-0.5 rounded-md font-semibold text-[8px] ${
                                      sec.ativo !== false ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                    }`}>
                                      {sec.ativo !== false ? 'Ativa' : 'Inativa'}
                                    </span>
                                    <span className="text-[9px] text-gray-400 font-medium">#{sec.id}</span>
                                  </div>
                                  <p className="text-[10px] text-gray-400">Localização: {sec.cidade} - {sec.estado}</p>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => abrirEditOrg(sec)}
                                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md font-bold text-[9px] cursor-pointer"
                                  >
                                    Editar
                                  </button>
                                  <button
                                    onClick={() => ativacaoOrgMutacao.mutate({ id: sec.id, ativo: !(sec.ativo !== false) })}
                                    className={`px-2.5 py-1 rounded-md font-bold text-[9px] cursor-pointer transition-colors ${
                                      sec.ativo !== false
                                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                                    }`}
                                  >
                                    {sec.ativo !== false ? 'Desativar' : 'Ativar'}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ABA 2: CATEGORIAS */}
      {abaAtiva === 'CATEGORIAS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Formulário Categoria (Esquerda) */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 shadow-xs rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-gray-900">💡 Criar Nova Categoria de Denúncia</h3>
              <form onSubmit={handleCriarCategoria} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Nome da Categoria</label>
                  <input
                    type="text"
                    value={nomeCategoria}
                    onChange={(e) => setNomeCategoria(e.target.value)}
                    placeholder="Ex: Iluminação Pública"
                    className="w-full text-xs border border-gray-300 rounded-lg p-2 text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Descrição</label>
                  <textarea
                    rows={3}
                    value={descCategoria}
                    onChange={(e) => setDescCategoria(e.target.value)}
                    placeholder="Explique o escopo de problemas atendidos por esta categoria."
                    className="w-full text-xs border border-gray-300 rounded-lg p-2 text-gray-900 focus:outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Órgão Responsável Padrão (Opcional)</label>
                  <select
                    value={responsavelCategoriaId}
                    onChange={(e) => setResponsavelCategoriaId(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-lg p-2 text-gray-900"
                  >
                    <option value="">Selecione...</option>
                    {organizacoes.map(org => (
                      <option key={org.id} value={org.id}>{org.nome} ({org.tipo})</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-2 rounded-lg text-xs cursor-pointer shadow-xs">
                  Criar Categoria
                </button>
              </form>
            </div>
          </div>

          {/* Listagem Categorias (Direita) */}
          <div className="bg-white border border-gray-200 shadow-xs rounded-xl p-6 lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-gray-950 flex items-center gap-1.5">
              <span>📋</span> Lista de Categorias Globais
            </h3>

            {/* Modal de Edição de Categoria */}
            {editCat && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 space-y-3 mb-2">
                <h4 className="text-xs font-bold text-indigo-950">✏️ Editar Categoria #{editCat.id}</h4>
                <form onSubmit={handleSalvarCat} className="space-y-3">
                  <input
                    type="text"
                    value={editCatNome}
                    onChange={(e) => setEditCatNome(e.target.value)}
                    placeholder="Nome da categoria"
                    className="w-full text-xs border border-gray-300 rounded-lg p-2 text-gray-900"
                    required
                  />
                  <textarea
                    rows={2}
                    value={editCatDesc}
                    onChange={(e) => setEditCatDesc(e.target.value)}
                    placeholder="Descrição"
                    className="w-full text-xs border border-gray-300 rounded-lg p-2 text-gray-900 focus:outline-hidden"
                    required
                  />
                  <select
                    value={editCatResponsavelId}
                    onChange={(e) => setEditCatResponsavelId(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-lg p-2 text-gray-900 cursor-pointer"
                  >
                    <option value="">Órgão responsável padrão (opcional)</option>
                    {organizacoes.map(org => (
                      <option key={org.id} value={org.id}>{org.nome} ({org.tipo})</option>
                    ))}
                  </select>
                  <div className="flex gap-2 justify-end">
                    <button type="button" onClick={() => setEditCat(null)} className="text-xs bg-white border border-gray-300 px-3 py-1.5 rounded-lg cursor-pointer">Cancelar</button>
                    <button type="submit" disabled={editarCatMutacao.isPending} className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg cursor-pointer disabled:opacity-60">
                      {editarCatMutacao.isPending ? 'Salvando...' : 'Salvar'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {categorias.length === 0 ? (
              <p className="text-xs text-gray-500 italic py-6 text-center">Nenhuma categoria cadastrada.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs text-left text-gray-600">
                  <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-500">
                    <tr>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Nome</th>
                      <th className="px-4 py-3">Descrição</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {categorias.map(cat => (
                      <tr key={cat.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-semibold text-gray-900">#{cat.id}</td>
                        <td className="px-4 py-3 font-bold text-gray-800">{cat.nome}</td>
                        <td className="px-4 py-3 text-gray-500 italic max-w-sm truncate">{cat.descricao}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-md font-semibold ${
                            cat.ativa ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                          }`}>
                            {cat.ativa ? 'Ativa' : 'Desativada'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button
                            onClick={() => abrirEditCat(cat)}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-md font-bold text-[10px] cursor-pointer"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => ativacaoCatMutacao.mutate({ id: cat.id, ativa: !cat.ativa })}
                            className={`px-2.5 py-1 rounded-md font-bold text-[10px] cursor-pointer transition-colors ${
                              cat.ativa
                                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                : 'bg-green-50 text-green-600 hover:bg-green-100'
                            }`}
                          >
                            {cat.ativa ? 'Desativar' : 'Ativar'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ABA 3: AUDITORIA */}
      {abaAtiva === 'AUDITORIA' && (
        <div className="bg-white border border-gray-200 shadow-xs rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-gray-950 flex items-center gap-1.5">
            <span>⏳</span> Log de Eventos e Auditoria Institucional
          </h3>

          {auditorias.length === 0 ? (
            <p className="text-xs text-gray-500 italic py-6 text-center">Nenhum evento auditado encontrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-[11px] text-left text-gray-600">
                <thead className="bg-gray-50 text-[9px] uppercase font-bold text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Ação</th>
                    <th className="px-4 py-3">Ator</th>
                    <th className="px-4 py-3">Descrição</th>
                    <th className="px-4 py-3">Detalhes</th>
                    <th className="px-4 py-3">IP / Endpoint</th>
                    <th className="px-4 py-3">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {auditorias.map(aud => (
                    <tr key={aud.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-bold text-indigo-700">{aud.acao}</td>
                      <td className="px-4 py-3">
                        <span className="font-semibold block text-gray-900">ID Ator: #{aud.atorId}</span>
                        <span className="text-[9px] text-gray-400 capitalize">{aud.perfilAtor?.toLowerCase().replace('role_', '')}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-800 font-medium">{aud.descricao}</td>
                      <td className="px-4 py-3 text-gray-500 italic max-w-xs truncate">{aud.detalhes}</td>
                      <td className="px-4 py-3">
                        <span className="font-semibold block">{aud.metodoHttp} {aud.caminho}</span>
                        <span className="text-[9px] text-gray-400">IP: {aud.ip}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{formataData(aud.criadoEm)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginação */}
          {totalPaginasAuditoria > 1 && (
            <div className="flex justify-center items-center space-x-2 pt-4">
              <button
                disabled={paginaAuditoria === 0}
                onClick={() => setPaginaAuditoria(p => p - 1)}
                className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-bold bg-white text-gray-700 disabled:opacity-50 cursor-pointer"
              >
                &larr; Anterior
              </button>
              <span className="text-xs font-semibold text-gray-600">
                Página {paginaAuditoria + 1} de {totalPaginasAuditoria}
              </span>
              <button
                disabled={paginaAuditoria + 1 >= totalPaginasAuditoria}
                onClick={() => setPaginaAuditoria(p => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-bold bg-white text-gray-700 disabled:opacity-50 cursor-pointer"
              >
                Próxima &rarr;
              </button>
            </div>
          )}

        </div>
      )}

      {/* ABA 4: USUARIOS E VINCULOS */}
      {abaAtiva === 'USUARIOS' && (
        <div className="space-y-8">
          
          {/* Tabela de Usuários */}
          <div className="bg-white border border-gray-200 shadow-xs rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-gray-950 flex items-center gap-1.5">
              <span>👤</span> Gestão Geral de Contas de Usuários
            </h3>

            {usuariosExibidos.length === 0 ? (
              <p className="text-xs text-gray-500 italic py-6 text-center">Nenhum usuário cadastrado.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs text-left text-gray-600">
                  <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-500">
                    <tr>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Nome</th>
                      <th className="px-4 py-3">Username / E-mail</th>
                      <th className="px-4 py-3">Perfil Global</th>
                      <th className="px-4 py-3">Cidade / Bairro</th>
                      <th className="px-4 py-3">Situação</th>
                      <th className="px-4 py-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {usuariosExibidos.map(u => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-semibold text-gray-900">#{u.id}</td>
                        <td className="px-4 py-3 font-bold text-gray-800">{u.nome}</td>
                        <td className="px-4 py-3">
                          <span className="block font-medium text-gray-700">@{u.username}</span>
                          <span className="block text-[10px] text-gray-400">{u.email}</span>
                        </td>
                        <td className="px-4 py-3 font-semibold">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase ${
                            u.perfilGlobal === 'ADMIN_APP' ? 'bg-indigo-50 text-indigo-700' :
                            u.perfilGlobal === 'MODERADOR' ? 'bg-purple-50 text-purple-700' : 'bg-gray-150 text-gray-700'
                          }`}>
                            {u.perfilGlobal}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{u.cidade || 'N/A'} - {u.bairro || 'N/A'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-md font-semibold ${
                            u.ativo ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                          }`}>
                            {u.ativo ? 'Ativo' : 'Inativo / Suspenso'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => ativacaoUsuarioMutacao.mutate({ id: u.id, ativo: !u.ativo })}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors shadow-2xs ${
                              u.ativo 
                                ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                                : 'bg-green-50 text-green-600 hover:bg-green-100'
                            }`}
                          >
                            {u.ativo ? 'Desativar' : 'Ativar'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Tabela de Vínculos */}
          <div className="bg-white border border-gray-200 shadow-xs rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-gray-950 flex items-center gap-1.5">
              <span>🔄</span> Vínculos Institucionais e Papéis
            </h3>

            {/* Modal de Edição de Vínculo */}
            {editVinculo && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 space-y-3 mb-2">
                <h4 className="text-xs font-bold text-indigo-950">✏️ Editar Vínculo #{editVinculo.id} — {editVinculo.nomeUsuario}</h4>
                <form onSubmit={handleSalvarVinculo} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-600 mb-1">Papel do Servidor</label>
                    <select
                      value={editVinculoPapel}
                      onChange={(e) => setEditVinculoPapel(e.target.value)}
                      className="w-full text-xs border border-gray-300 rounded-lg p-2 text-gray-900 cursor-pointer"
                      required
                    >
                      <option value="ADMIN_PREFEITURA">Admin Prefeitura</option>
                      <option value="ADMIN_SECRETARIA">Admin Secretaria</option>
                      <option value="ATENDENTE_SECRETARIA">Atendente Secretaria</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="vinculo-ativo"
                      checked={editVinculo.ativo}
                      onChange={(e) => setEditVinculo(prev => ({ ...prev, ativo: e.target.checked }))}
                      className="cursor-pointer"
                    />
                    <label htmlFor="vinculo-ativo" className="text-xs font-semibold text-gray-700 cursor-pointer">Vínculo ativo</label>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button type="button" onClick={() => setEditVinculo(null)} className="text-xs bg-white border border-gray-300 px-3 py-1.5 rounded-lg cursor-pointer">Cancelar</button>
                    <button type="submit" disabled={editarVinculoMutacao.isPending} className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg cursor-pointer disabled:opacity-60">
                      {editarVinculoMutacao.isPending ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {vinculosExibidos.length === 0 ? (
              <p className="text-xs text-gray-500 italic py-6 text-center">Nenhum vínculo institucional registrado.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs text-left text-gray-600">
                  <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-500">
                    <tr>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Usuário</th>
                      <th className="px-4 py-3">Organização Associada</th>
                      <th className="px-4 py-3">Papel Atribuído</th>
                      <th className="px-4 py-3">Situação</th>
                      <th className="px-4 py-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {vinculosExibidos.map(v => (
                      <tr key={v.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-semibold text-gray-900">#{v.id}</td>
                        <td className="px-4 py-3 font-bold text-gray-800">
                          {v.nomeUsuario} <span className="text-[10px] text-gray-400 block font-normal">ID: #{v.usuarioId}</span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-800">
                          {v.nomeOrganizacao} <span className="text-[10px] text-gray-400 font-normal block">ID: {v.organizacaoId}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-bold text-[10px]">
                            {v.papel}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-md font-semibold text-[10px] border ${
                            v.ativo ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {v.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => abrirEditVinculo(v)}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-md font-bold text-[10px] cursor-pointer"
                          >
                            Editar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};

export default DashboardAdmin;
