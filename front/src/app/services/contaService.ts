import { apiRequest } from './apiClient';

interface MensagemResponseDTO {
  mensagem: string;
}

export const contaService = {
  solicitarRecuperacaoSenha(email: string) {
    return apiRequest<MensagemResponseDTO>('/api/conta/recuperacao-senha/solicitacao', {
      method: 'POST',
      body: { email },
    });
  },

  redefinirSenha(token: string, novaSenha: string) {
    return apiRequest<MensagemResponseDTO>('/api/conta/recuperacao-senha/redefinicao', {
      method: 'POST',
      body: { token, novaSenha },
    });
  },

  confirmarEmail(token: string) {
    return apiRequest<MensagemResponseDTO>('/api/conta/verificacao-email/confirmacao', {
      method: 'POST',
      body: { token },
    });
  },
};
