import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import cliente from '../../api/cliente';

const schemaSolicitacao = zod.object({
  email: zod.string().email('Digite um e-mail válido'),
});

const schemaRedefinicao = zod.object({
  token: zod.string().min(1, 'O token é obrigatório'),
  novaSenha: zod.string().min(8, 'A nova senha deve ter pelo menos 8 caracteres'),
});

const RecuperarSenha = () => {
  const [estagio, setEstagio] = useState('SOLICITACAO'); // SOLICITACAO ou REDEFINICAO
  const [mensagemSucesso, setMensagemSucesso] = useState(null);
  const [erro, setErro] = useState(null);
  const [loading, setLoading] = useState(false);

  const formSolicitacao = useForm({ resolver: zodResolver(schemaSolicitacao) });
  const formRedefinicao = useForm({ resolver: zodResolver(schemaRedefinicao) });

  const handleSolicitar = async (dados) => {
    setErro(null);
    setLoading(true);
    try {
      const response = await cliente.post('/api/conta/recuperacao-senha/solicitacao', dados);
      setMensagemSucesso(response.data.mensagem || 'Solicitação enviada. Verifique os logs do console backend se o SMTP estiver desligado!');
      setEstagio('REDEFINICAO');
    } catch (err) {
      setErro(err.response?.data?.mensagem || 'Erro ao processar solicitação.');
    } finally {
      setLoading(false);
    }
  };

  const handleRedefinir = async (dados) => {
    setErro(null);
    setLoading(true);
    try {
      await cliente.post('/api/conta/recuperacao-senha/redefinicao', dados);
      setMensagemSucesso('Senha redefinida com sucesso! Agora você já pode fazer login.');
      setEstagio('CONCLUIDO');
    } catch (err) {
      setErro(err.response?.data?.mensagem || 'Erro ao redefinir senha. Verifique se o token é válido ou já expirou.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-4xl font-extrabold text-blue-600 tracking-tight flex justify-center items-center gap-2">
          <span>🏙️</span> Cidade Ativa
        </h1>
        <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
          Recuperação de Senha
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-lg sm:px-10 border border-gray-200">
          {erro && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm font-medium">
              ⚠️ {erro}
            </div>
          )}

          {mensagemSucesso && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-sm font-medium">
              ℹ️ {mensagemSucesso}
            </div>
          )}

          {estagio === 'SOLICITACAO' && (
            <form className="space-y-6" onSubmit={formSolicitacao.handleSubmit(handleSolicitar)}>
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                  Digite o e-mail cadastrado
                </label>
                <input
                  id="email"
                  type="email"
                  {...formSolicitacao.register('email')}
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-xs placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                  placeholder="exemplo@cidade.com"
                />
                {formSolicitacao.formState.errors.email && (
                  <p className="mt-1 text-xs text-red-600 font-semibold">
                    {formSolicitacao.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-xs text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-hidden disabled:bg-blue-400 cursor-pointer"
                >
                  {loading ? 'Processando...' : 'Solicitar Redefinição'}
                </button>
              </div>
            </form>
          )}

          {estagio === 'REDEFINICAO' && (
            <form className="space-y-6" onSubmit={formRedefinicao.handleSubmit(handleRedefinir)}>
              <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-xs leading-relaxed mb-2 font-medium">
                💡 <strong>Dica de desenvolvimento:</strong> O token foi enviado para o seu e-mail ou registrado nos logs do console do backend Spring Boot (se `MAIL_ENABLED=false`). Copie e cole abaixo.
              </div>
              
              <div>
                <label htmlFor="token" className="block text-sm font-semibold text-gray-700">
                  Token de Recuperação
                </label>
                <input
                  id="token"
                  type="text"
                  {...formRedefinicao.register('token')}
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-xs focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                  placeholder="Cole o token do console aqui"
                />
                {formRedefinicao.formState.errors.token && (
                  <p className="mt-1 text-xs text-red-600 font-semibold">
                    {formRedefinicao.formState.errors.token.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="novaSenha" className="block text-sm font-semibold text-gray-700">
                  Nova Senha
                </label>
                <input
                  id="novaSenha"
                  type="password"
                  {...formRedefinicao.register('novaSenha')}
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-xs focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                  placeholder="Mínimo de 8 caracteres"
                />
                {formRedefinicao.formState.errors.novaSenha && (
                  <p className="mt-1 text-xs text-red-600 font-semibold">
                    {formRedefinicao.formState.errors.novaSenha.message}
                  </p>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-xs text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-hidden disabled:bg-blue-400 cursor-pointer"
                >
                  {loading ? 'Redefinindo...' : 'Alterar Senha'}
                </button>
              </div>
            </form>
          )}

          {estagio === 'CONCLUIDO' && (
            <div className="text-center pt-2">
              <Link
                to="/login"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-xs text-sm font-bold text-white bg-blue-600 hover:bg-blue-700"
              >
                Voltar para o Login
              </Link>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm font-semibold text-blue-600 hover:text-blue-500">
              Voltar ao Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecuperarSenha;
