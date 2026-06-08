import { apiRequest } from './apiClient';
import type {
  BairroResponseDTO,
  OrganizacaoResponseDTO,
  OrganizacaoUpdateRequestDTO,
  PrefeituraCreateRequestDTO,
  SecretariaCategoriasUpdateRequestDTO,
  SecretariaCreateRequestDTO,
  UsuarioInstitucionalCreateRequestDTO,
} from '../types/organizacao';
import type { VinculoUsuarioOrganizacaoResponseDTO } from '../types/vinculo';

export const organizacaoService = {
  listar() {
    return apiRequest<OrganizacaoResponseDTO[]>('/api/organizacoes');
  },

  listarPrefeiturasAtivas() {
    return apiRequest<OrganizacaoResponseDTO[]>('/api/organizacoes/prefeituras');
  },

  listarBairrosAtivos(prefeituraId: number) {
    return apiRequest<BairroResponseDTO[]>(`/api/prefeituras/${prefeituraId}/bairros/ativos`);
  },

  listarBairrosParaGestao(prefeituraId: number) {
    return apiRequest<BairroResponseDTO[]>(`/api/prefeituras/${prefeituraId}/bairros`);
  },

  criarBairro(prefeituraId: number, nome: string, centroideLatitude?: number | null, centroideLongitude?: number | null) {
    return apiRequest<BairroResponseDTO>(`/api/prefeituras/${prefeituraId}/bairros`, {
      method: 'POST',
      body: { nome, centroideLatitude, centroideLongitude },
    });
  },

  atualizarBairro(prefeituraId: number, bairroId: number, nome: string, centroideLatitude?: number | null, centroideLongitude?: number | null) {
    return apiRequest<BairroResponseDTO>(`/api/prefeituras/${prefeituraId}/bairros/${bairroId}`, {
      method: 'PUT',
      body: { nome, centroideLatitude, centroideLongitude },
    });
  },

  alterarBairroAtivo(prefeituraId: number, bairroId: number, ativo: boolean) {
    return apiRequest<BairroResponseDTO>(`/api/prefeituras/${prefeituraId}/bairros/${bairroId}/ativacao`, {
      method: 'PATCH',
      body: { ativo },
    });
  },

  criarPrefeitura(payload: PrefeituraCreateRequestDTO) {
    return apiRequest<OrganizacaoResponseDTO>('/api/organizacoes/prefeituras', {
      method: 'POST',
      body: payload,
    });
  },

  criarSecretaria(prefeituraId: number, payload: SecretariaCreateRequestDTO) {
    return apiRequest<OrganizacaoResponseDTO>(
      `/api/organizacoes/prefeituras/${prefeituraId}/secretarias`,
      {
        method: 'POST',
        body: payload,
      },
    );
  },

  atualizar(organizacaoId: number, payload: OrganizacaoUpdateRequestDTO) {
    return apiRequest<OrganizacaoResponseDTO>(`/api/organizacoes/${organizacaoId}`, {
      method: 'PUT',
      body: payload,
    });
  },

  atualizarCategoriasSecretaria(organizacaoId: number, payload: SecretariaCategoriasUpdateRequestDTO) {
    return apiRequest<OrganizacaoResponseDTO>(`/api/organizacoes/${organizacaoId}/categorias`, {
      method: 'PATCH',
      body: payload,
    });
  },

  alterarAtiva(organizacaoId: number, ativo: boolean) {
    return apiRequest<OrganizacaoResponseDTO>(`/api/organizacoes/${organizacaoId}/ativacao`, {
      method: 'PATCH',
      body: { ativo },
    });
  },

  criarUsuarioInstitucional(organizacaoId: number, payload: UsuarioInstitucionalCreateRequestDTO) {
    return apiRequest<VinculoUsuarioOrganizacaoResponseDTO>(
      `/api/organizacoes/${organizacaoId}/usuarios-institucionais`,
      {
        method: 'POST',
        body: payload,
      },
    );
  },
};
