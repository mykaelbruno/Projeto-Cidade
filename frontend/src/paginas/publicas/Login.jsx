import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { useAuth } from '../../contextos/AuthContext';

const schemaLogin = zod.object({
  identificador: zod.string().min(1, 'Digite seu e-mail ou nome de usuário'),
  senha: zod.string().min(8, 'A senha deve conter no mínimo 8 caracteres'),
});

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [erro, setErro] = useState(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schemaLogin),
  });

  const onSubmit = async (dados) => {
    setErro(null);
    setLoading(true);
    try {
      await login(dados.identificador, dados.senha);
      navigate('/');
    } catch (err) {
      setErro(err.mensagem || 'Falha ao autenticar. Verifique suas credenciais.');
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
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Entrar na sua conta
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Ou{' '}
          <Link to="/cadastro" className="font-semibold text-blue-600 hover:text-blue-500">
            cadastre-se gratuitamente
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-lg sm:px-10 border border-gray-200">
          {erro && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm font-medium">
              ⚠️ {erro}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="identificador" className="block text-sm font-semibold text-gray-700">
                E-mail ou Nome de usuário
              </label>
              <div className="mt-1">
                <input
                  id="identificador"
                  type="text"
                  {...register('identificador')}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-xs placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                  placeholder="exemplo@cidade.com ou morador123"
                />
                {errors.identificador && (
                  <p className="mt-1 text-xs text-red-600 font-semibold">{errors.identificador.message}</p>
                )}
              </div>
            </div>

            <div>
              <div className="flex justify-between">
                <label htmlFor="senha" className="block text-sm font-semibold text-gray-700">
                  Senha
                </label>
                <Link to="/recuperar-senha" className="text-xs font-semibold text-blue-600 hover:text-blue-500">
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="mt-1">
                <input
                  id="senha"
                  type="password"
                  {...register('senha')}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-xs placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                  placeholder="********"
                />
                {errors.senha && (
                  <p className="mt-1 text-xs text-red-600 font-semibold">{errors.senha.message}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-xs text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 cursor-pointer"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
