package com.mykael.prefeitura.core.denuncia;

import com.mykael.prefeitura.core.organizacao.Organizacao;
import com.mykael.prefeitura.core.organizacao.TipoOrganizacao;
import com.mykael.prefeitura.core.vinculo.VinculoUsuarioOrganizacaoRepository;
import com.mykael.prefeitura.infra.security.UsuarioAutenticado;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class VisibilidadeDenunciaService {

	private final VinculoUsuarioOrganizacaoRepository vinculoRepository;

	public VisibilidadeDenunciaService(VinculoUsuarioOrganizacaoRepository vinculoRepository) {
		this.vinculoRepository = vinculoRepository;
	}

	public boolean deveOcultarArquivadasNaListagemGeral(UsuarioAutenticado usuario) {
		return !usuario.moderacaoGlobal() && !usuario.institucional();
	}

	public void exigirPodeVisualizar(Denuncia denuncia, UsuarioAutenticado usuario) {
		if (denuncia.getStatus() != StatusDenuncia.ARQUIVADO || podeVisualizarArquivada(denuncia, usuario)) {
			return;
		}
		throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Denuncia nao encontrada.");
	}

	public boolean podeVisualizarArquivada(Denuncia denuncia, UsuarioAutenticado usuario) {
		return usuario.moderacaoGlobal()
				|| isAutor(denuncia, usuario)
				|| possuiAcessoInstitucional(denuncia, usuario);
	}

	public boolean isAutor(Denuncia denuncia, UsuarioAutenticado usuario) {
		return denuncia.getAutor() != null && denuncia.getAutor().getId().equals(usuario.id());
	}

	public boolean deveOcultarAutorMorador(Denuncia denuncia, Long autorId) {
		return denuncia.isAnonima()
				&& denuncia.getAutor() != null
				&& denuncia.getAutor().getId().equals(autorId);
	}

	private boolean possuiAcessoInstitucional(Denuncia denuncia, UsuarioAutenticado usuario) {
		Organizacao responsavel = denuncia.getOrganizacaoResponsavel();
		if (responsavel == null) {
			return false;
		}

		if (vinculoRepository.existsByUsuarioIdAndOrganizacaoIdAndAtivoTrue(usuario.id(), responsavel.getId())) {
			return true;
		}

		if (responsavel.getTipo() == TipoOrganizacao.SECRETARIA && responsavel.getOrganizacaoPai() != null) {
			return vinculoRepository.existsByUsuarioIdAndOrganizacaoIdAndAtivoTrue(
					usuario.id(),
					responsavel.getOrganizacaoPai().getId()
			);
		}

		return false;
	}
}
