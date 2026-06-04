import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { useAuth } from '../../contextos/AuthContext';
import cliente from '../../api/cliente';

const schemaCadastro = zod.object({
  nome: zod.string().min(2, 'O nome deve ter pelo menos 2 caracteres').max(100, 'Máximo de 100 caracteres'),
  email: zod.string().email('Digite um e-mail válido').max(150, 'Máximo de 150 caracteres'),
  username: zod.string()
    .min(3, 'Mínimo de 3 caracteres')
    .max(50, 'Máximo de 50 caracteres')
    .regex(/^[a-zA-Z0-9._-]+$/, 'Apenas letras, números, ponto, underline ou hífen'),
  senha: zod.string().min(8, 'Mínimo de 8 caracteres').max(72, 'Máximo de 72 caracteres'),
  telefone: zod.string().max(20, 'Máximo de 20 caracteres').optional().or(zod.literal('')),
  cidade: zod.string().min(1, 'Selecione sua cidade'),
  bairro: zod.string().min(1, 'Digite seu bairro').max(100),
});

const Cadastro = () => {
  const { cadastrar } = useAuth();
  const navigate = useNavigate();
  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState(false);
  const [loading, setLoading] = useState(false);
  const [prefeituras, setPrefeituras] = useState([]);
  const [carregandoPrefeituras, setCarregandoPrefeituras] = useState(true);

  useEffect(() => {
    const buscarPrefeituras = async () => {
      try {
        const response = await cliente.get('/api/organizacoes/prefeituras');
        setPrefeituras(response.data || []);
      } catch (err) {
        console.error('Erro ao buscar prefeituras:', err);
      } finally {
        setCarregandoPrefeituras(false);
      }
    };
    buscarPrefeituras();
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schemaCadastro),
    defaultValues: {
      cidade: '',
    }
  });

  const onSubmit = async (dados) => {
    setErro(null);
    setLoading(true);
    try {
      await cadastrar(dados);
      setSucesso(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setErro(err.mensagem || 'Falha ao registrar cadastro. Tente outro e-mail ou username.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-10 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-4xl font-extrabold text-blue-600 tracking-tight flex justify-center items-center gap-2">
          <span>🏙️</span> Cidade Ativa
        </h1>
        <h2 className="mt-4 text-center text-2xl font-bold text-gray-900">
          Criar sua conta de morador
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Ou{' '}
          <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500">
            já possui uma conta? Faça login
          </Link>
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-lg sm:px-10 border border-gray-200">
          {erro && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm font-medium">
              ⚠️ {erro}
            </div>
          )}

          {sucesso && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-sm font-medium">
              🎉 Cadastro realizado com sucesso! Redirecionando...
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            
            {/* Nome Completo */}
            <div>
              <label htmlFor="nome" className="block text-sm font-semibold text-gray-700">
                Nome completo
              </label>
              <input
                id="nome"
                type="text"
                {...register('nome')}
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-xs focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                placeholder="Seu nome"
              />
              {errors.nome && <p className="mt-1 text-xs text-red-600 font-semibold">{errors.nome.message}</p>}
            </div>

            {/* Email e Username */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-xs focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                  placeholder="exemplo@cidade.com"
                />
                {errors.email && <p className="mt-1 text-xs text-red-600 font-semibold">{errors.email.message}</p>}
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-semibold text-gray-700">
                  Nome de usuário (Username)
                </label>
                <input
                  id="username"
                  type="text"
                  {...register('username')}
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-xs focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                  placeholder="morador123"
                />
                {errors.username && <p className="mt-1 text-xs text-red-600 font-semibold">{errors.username.message}</p>}
              </div>
            </div>

            {/* Senha e Telefone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="senha" className="block text-sm font-semibold text-gray-700">
                  Senha
                </label>
                <input
                  id="senha"
                  type="password"
                  {...register('senha')}
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-xs focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                  placeholder="No mínimo 8 digitos"
                />
                {errors.senha && <p className="mt-1 text-xs text-red-600 font-semibold">{errors.senha.message}</p>}
              </div>

              <div>
                <label htmlFor="telefone" className="block text-sm font-semibold text-gray-700">
                  Telefone (Opcional)
                </label>
                <input
                  id="telefone"
                  type="text"
                  {...register('telefone')}
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-xs focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                  placeholder="(83) 99999-9999"
                />
                {errors.telefone && <p className="mt-1 text-xs text-red-600 font-semibold">{errors.telefone.message}</p>}
              </div>
            </div>

            {/* Cidade e Bairro */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="cidade" className="block text-sm font-semibold text-gray-700">
                  Cidade
                </label>
                {carregandoPrefeituras ? (
                  <div className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-400 text-sm animate-pulse">
                    Carregando cidades cadastradas...
                  </div>
                ) : prefeituras.length === 0 ? (
                  <div className="mt-1 block w-full px-3 py-2 border border-red-300 rounded-lg bg-red-50 text-red-600 text-xs font-semibold">
                    Nenhuma prefeitura ativa cadastrada no sistema.
                  </div>
                ) : (
                  <select
                    id="cidade"
                    {...register('cidade')}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-xs focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 bg-white"
                  >
                    <option value="">Selecione sua cidade</option>
                    {prefeituras.map((pref) => (
                      <option key={pref.id} value={pref.cidade}>
                        {pref.cidade} - {pref.estado}
                      </option>
                    ))}
                  </select>
                )}
                {errors.cidade && <p className="mt-1 text-xs text-red-600 font-semibold">{errors.cidade.message}</p>}
              </div>

              <div>
                <label htmlFor="bairro" className="block text-sm font-semibold text-gray-700">
                  Bairro
                </label>
                <input
                  id="bairro"
                  type="text"
                  {...register('bairro')}
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-xs focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                  placeholder="Seu bairro"
                />
                {errors.bairro && <p className="mt-1 text-xs text-red-600 font-semibold">{errors.bairro.message}</p>}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || sucesso}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-xs text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 cursor-pointer"
              >
                {loading ? 'Cadastrando...' : 'Cadastrar Conta'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Cadastro;
