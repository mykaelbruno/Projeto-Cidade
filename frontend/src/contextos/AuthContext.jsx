/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useContext } from 'react';
import cliente from '../api/cliente';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  const processarUsuario = (usuarioData, papeis = [], vinculosOperacionais = []) => {
    if (!usuarioData) return null;
    const user = { ...usuarioData, vinculosOperacionais };
    if (papeis.includes('ROLE_ADMIN_PREFEITURA')) {
      user.perfilGlobal = 'ADMIN_PREFEITURA';
    } else if (papeis.includes('ROLE_ADMIN_SECRETARIA')) {
      user.perfilGlobal = 'ADMIN_SECRETARIA';
    } else if (papeis.includes('ROLE_ATENDENTE_SECRETARIA')) {
      user.perfilGlobal = 'ATENDENTE_SECRETARIA';
    }
    return user;
  };

  const verificarSessao = async () => {
    try {
      const response = await cliente.get('/api/auth/me');
      if (response.data && response.data.usuario) {
        setUsuario(processarUsuario(response.data.usuario, response.data.papeis, response.data.vinculosOperacionais));
      } else {
        setUsuario(null);
      }
    } catch {
      setUsuario(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ativo = true;
    const inicializar = async () => {
      try {
        const response = await cliente.get('/api/auth/me');
        if (ativo) {
          if (response.data && response.data.usuario) {
            setUsuario(processarUsuario(response.data.usuario, response.data.papeis, response.data.vinculosOperacionais));
          } else {
            setUsuario(null);
          }
        }
      } catch {
        if (ativo) setUsuario(null);
      } finally {
        if (ativo) setLoading(false);
      }
    };
    inicializar();
    return () => {
      ativo = false;
    };
  }, []);

  const login = async (identificador, senha) => {
    try {
      const response = await cliente.post('/api/auth/login', { identificador, senha });
      await verificarSessao();
      return response.data;
    } catch (error) {
      throw error.response?.data || { mensagem: 'Erro ao realizar login.' };
    }
  };

  const cadastrar = async (dados) => {
    try {
      const response = await cliente.post('/api/auth/cadastro-morador', dados);
      await verificarSessao();
      return response.data;
    } catch (error) {
      throw error.response?.data || { mensagem: 'Erro ao realizar cadastro.' };
    }
  };

  const logout = async () => {
    try {
      await cliente.post('/api/auth/logout');
    } catch (error) {
      console.error('Erro ao fazer logout no servidor:', error);
    } finally {
      setUsuario(null);
    }
  };

  return (
    <AuthContext.Provider value={{ usuario, loading, login, cadastrar, logout, verificarSessao }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
