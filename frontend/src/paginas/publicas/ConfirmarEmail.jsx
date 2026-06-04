import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import cliente from '../../api/cliente';

const ConfirmarEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [mensagemErro, setMensagemErro] = useState(
    token ? '' : 'Token de verificação de e-mail ausente. Verifique o link enviado em sua caixa de entrada.'
  );

  const confirmarEmailMutacao = useMutation({
    mutationFn: async (tokenConfirmacao) => {
      const response = await cliente.post('/api/conta/verificacao-email/confirmacao', { token: tokenConfirmacao });
      return response.data;
    },
    onSuccess: (data) => {
      setMensagemSucesso(data?.mensagem || 'Sua conta foi verificada e ativada com sucesso! Você já pode realizar o login.');
    },
    onError: (err) => {
      setMensagemErro(err.response?.data?.mensagem || 'Falha ao confirmar e-mail. O token de verificação pode ter expirado ou ser inválido.');
    }
  });

  useEffect(() => {
    if (token) {
      confirmarEmailMutacao.mutate(token);
    }
  }, [token, confirmarEmailMutacao]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-blue-600 tracking-tight">
          Cidade Ativa
        </h2>
        <h3 className="mt-2 text-center text-sm font-semibold text-gray-500">
          Validação e Ativação de Conta
        </h3>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-gray-200 shadow-xs rounded-2xl sm:px-10 text-center space-y-6">
          
          {confirmarEmailMutacao.isPending && (
            <div className="space-y-4 py-4">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
              <p className="text-sm font-medium text-gray-600">Verificando seus dados de ativação, por favor aguarde...</p>
            </div>
          )}

          {!confirmarEmailMutacao.isPending && mensagemSucesso && (
            <div className="space-y-4 py-4">
              <div className="h-12 w-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto text-2xl font-bold">
                ✓
              </div>
              <h4 className="text-lg font-bold text-gray-900">E-mail verificado!</h4>
              <p className="text-xs text-gray-600 leading-relaxed max-w-xs mx-auto">
                {mensagemSucesso}
              </p>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-2.5 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  Ir para o Login
                </Link>
              </div>
            </div>
          )}

          {!confirmarEmailMutacao.isPending && mensagemErro && (
            <div className="space-y-4 py-4">
              <div className="h-12 w-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto text-2xl font-bold">
                ⚠️
              </div>
              <h4 className="text-lg font-bold text-gray-900">Falha na verificação</h4>
              <p className="text-xs text-red-600 leading-relaxed max-w-xs mx-auto">
                {mensagemErro}
              </p>
              <div className="pt-2 space-y-3">
                <p className="text-[10px] text-gray-400">
                  Caso o token tenha expirado, você precisará solicitar um novo e-mail de confirmação.
                </p>
                <Link
                  to="/login"
                  className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-6 py-2.5 rounded-lg border border-gray-300 transition-colors cursor-pointer"
                >
                  Voltar para o Login
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ConfirmarEmail;
