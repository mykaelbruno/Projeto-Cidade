package com.mykael.prefeitura.infra.security;

import com.mykael.prefeitura.core.organizacao.Organizacao;
import com.mykael.prefeitura.core.organizacao.OrganizacaoRepository;
import com.mykael.prefeitura.core.organizacao.TipoOrganizacao;
import com.mykael.prefeitura.core.vinculo.PapelUsuario;
import com.mykael.prefeitura.core.vinculo.VinculoUsuarioOrganizacaoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AutorizacaoService {

	private final OrganizacaoRepository organizacaoRepository;
	private final VinculoUsuarioOrganizacaoRepository vinculoRepository;

	public AutorizacaoService(
			OrganizacaoRepository organizacaoRepository,
			VinculoUsuarioOrganizacaoRepository vinculoRepository
	) {
		this.organizacaoRepository = organizacaoRepository;
		this.vinculoRepository = vinculoRepository;
	}

	@Transactional(readOnly = true)
	public void exigirAdminPrefeituraOuAdminApp(Long usuarioId, Long prefeituraId, boolean adminApp) {
		if (adminApp) {
			return;
		}

		boolean possuiVinculo = vinculoRepository
				.existsByUsuarioIdAndOrganizacaoIdAndPapelAndAtivoTrue(usuarioId, prefeituraId, PapelUsuario.ADMIN_PREFEITURA);

		if (!possuiVinculo) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Usuario nao possui permissao sobre esta prefeitura.");
		}
	}

	@Transactional(readOnly = true)
	public void exigirAcessoDaPrefeituraAoDestino(Long usuarioId, Long organizacaoId, boolean adminApp) {
		if (adminApp) {
			return;
		}

		Organizacao organizacao = organizacaoRepository.findById(organizacaoId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organizacao nao encontrada."));

		Long prefeituraId = switch (organizacao.getTipo()) {
			case PREFEITURA -> organizacao.getId();
			case SECRETARIA -> {
				if (organizacao.getOrganizacaoPai() == null || organizacao.getOrganizacaoPai().getTipo() != TipoOrganizacao.PREFEITURA) {
					throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Secretaria sem prefeitura vinculada.");
				}
				yield organizacao.getOrganizacaoPai().getId();
			}
		};

		exigirAdminPrefeituraOuAdminApp(usuarioId, prefeituraId, false);
	}
}
