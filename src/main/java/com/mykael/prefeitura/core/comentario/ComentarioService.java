package com.mykael.prefeitura.core.comentario;

import com.mykael.prefeitura.core.comentario.dto.ComentarioCreateRequestDTO;
import com.mykael.prefeitura.core.comentario.dto.ComentarioResponseDTO;
import com.mykael.prefeitura.core.comentario.dto.RespostaOficialCreateRequestDTO;
import com.mykael.prefeitura.core.denuncia.Denuncia;
import com.mykael.prefeitura.core.denuncia.DenunciaRepository;
import com.mykael.prefeitura.core.denuncia.VisibilidadeDenunciaService;
import com.mykael.prefeitura.core.organizacao.Organizacao;
import com.mykael.prefeitura.core.organizacao.OrganizacaoRepository;
import com.mykael.prefeitura.core.timeline.TimelineDenunciaService;
import com.mykael.prefeitura.core.usuario.Usuario;
import com.mykael.prefeitura.core.usuario.UsuarioRepository;
import com.mykael.prefeitura.core.vinculo.VinculoUsuarioOrganizacaoRepository;
import com.mykael.prefeitura.core.vinculo.VinculoUsuarioOrganizacao;
import com.mykael.prefeitura.core.vinculo.PapelUsuario;
import com.mykael.prefeitura.core.usuario.PerfilUsuario;
import com.mykael.prefeitura.infra.antispam.AntispamService;
import com.mykael.prefeitura.infra.security.UsuarioAutenticado;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ComentarioService {

	private final ComentarioRepository comentarioRepository;
	private final DenunciaRepository denunciaRepository;
	private final UsuarioRepository usuarioRepository;
	private final OrganizacaoRepository organizacaoRepository;
	private final VinculoUsuarioOrganizacaoRepository vinculoRepository;
	private final TimelineDenunciaService timelineDenunciaService;
	private final AntispamService antispamService;
	private final VisibilidadeDenunciaService visibilidadeDenunciaService;

	public ComentarioService(
			ComentarioRepository comentarioRepository,
			DenunciaRepository denunciaRepository,
			UsuarioRepository usuarioRepository,
			OrganizacaoRepository organizacaoRepository,
			VinculoUsuarioOrganizacaoRepository vinculoRepository,
			TimelineDenunciaService timelineDenunciaService,
			AntispamService antispamService,
			VisibilidadeDenunciaService visibilidadeDenunciaService
	) {
		this.comentarioRepository = comentarioRepository;
		this.denunciaRepository = denunciaRepository;
		this.usuarioRepository = usuarioRepository;
		this.organizacaoRepository = organizacaoRepository;
		this.vinculoRepository = vinculoRepository;
		this.timelineDenunciaService = timelineDenunciaService;
		this.antispamService = antispamService;
		this.visibilidadeDenunciaService = visibilidadeDenunciaService;
	}

	@Transactional
	public ComentarioResponseDTO comentar(Long denunciaId, Long autorId, ComentarioCreateRequestDTO request) {
		Denuncia denuncia = buscarDenuncia(denunciaId);
		Usuario autor = buscarUsuarioAtivo(autorId);
		validarComentarioAntispam(denunciaId, autorId, request.conteudo());

		Comentario comentario = new Comentario();
		comentario.setDenuncia(denuncia);
		comentario.setAutor(autor);
		comentario.setConteudo(request.conteudo().trim());
		comentario.setOficial(false);
		denuncia.incrementarComentarios();
		timelineDenunciaService.registrarComentarioAdicionado(denuncia, autor);

		Comentario salvo = comentarioRepository.save(comentario);
		return ComentarioResponseDTO.from(salvo, visibilidadeDenunciaService.deveOcultarAutorMorador(denuncia, autor.getId()));
	}

	@Transactional
	public ComentarioResponseDTO responderOficialmente(
			Long denunciaId,
			Long autorId,
			RespostaOficialCreateRequestDTO request
	) {
		Denuncia denuncia = buscarDenuncia(denunciaId);
		Usuario autor = buscarUsuarioAtivo(autorId);
		validarComentarioAntispam(denunciaId, autorId, request.conteudo());
		Organizacao organizacao = organizacaoRepository.findById(request.organizacaoId())
				.filter(Organizacao::isAtiva)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organizacao ativa nao encontrada."));

		if (autor.getPerfilGlobal() != PerfilUsuario.ADMIN_APP && 
				!organizacao.getCidade().equalsIgnoreCase(denuncia.getCidade())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Esta organizacao pertence a outra cidade e nao pode responder a este relato.");
		}

		boolean possuiPermissao = false;
		if (autor.getPerfilGlobal() == PerfilUsuario.ADMIN_APP) {
			possuiPermissao = true;
		} else {
			boolean vinculoDireto = vinculoRepository.existsByUsuarioIdAndOrganizacaoIdAndAtivoTrue(autorId, organizacao.getId());
			if (vinculoDireto) {
				possuiPermissao = true;
			} else {
				List<VinculoUsuarioOrganizacao> vinculos = vinculoRepository.findByUsuarioIdAndAtivoTrue(autorId);
				for (VinculoUsuarioOrganizacao v : vinculos) {
					if (v.getPapel() == PapelUsuario.ADMIN_PREFEITURA) {
						Long prefeituraId = v.getOrganizacao().getId();
						if (organizacao.getOrganizacaoPai() != null && organizacao.getOrganizacaoPai().getId().equals(prefeituraId)) {
							possuiPermissao = true;
							break;
						}
					}
				}
			}
		}
		if (!possuiPermissao) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Usuario nao possui permissao para responder em nome da organizacao informada.");
		}

		Comentario comentario = new Comentario();
		comentario.setDenuncia(denuncia);
		comentario.setAutor(autor);
		comentario.setConteudo(request.conteudo().trim());
		comentario.setOficial(true);
		comentario.setOrganizacao(organizacao);
		denuncia.incrementarComentarios();
		timelineDenunciaService.registrarRespostaOficial(denuncia, autor, organizacao);

		return ComentarioResponseDTO.from(comentarioRepository.save(comentario));
	}

	@Transactional(readOnly = true)
	public Page<ComentarioResponseDTO> listarPorDenuncia(Long denunciaId, UsuarioAutenticado usuario, Pageable pageable) {
		Denuncia denuncia = buscarDenuncia(denunciaId);
		visibilidadeDenunciaService.exigirPodeVisualizar(denuncia, usuario);
		return comentarioRepository.findByDenunciaIdAndRemovidoEmIsNull(denunciaId, pageable)
				.map(comentario -> ComentarioResponseDTO.from(
						comentario,
						!comentario.isOficial() && visibilidadeDenunciaService.deveOcultarAutorMorador(denuncia, comentario.getAutor().getId())
				));
	}

	private Denuncia buscarDenuncia(Long denunciaId) {
		return denunciaRepository.findById(denunciaId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Denuncia nao encontrada."));
	}

	private Usuario buscarUsuarioAtivo(Long usuarioId) {
		return usuarioRepository.findById(usuarioId)
				.filter(Usuario::isAtivo)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario autenticado nao encontrado ou inativo."));
	}

	private void validarComentarioAntispam(Long denunciaId, Long autorId, String conteudo) {
		antispamService.validarConteudoComentario(conteudo);
		antispamService.inicioJanelaComentarioRepetido().ifPresent(inicioJanela -> {
			String assinaturaNova = antispamService.assinatura(conteudo);
			List<String> assinaturasRecentes = comentarioRepository.findRecentesDoAutorNaDenuncia(
							denunciaId,
							autorId,
							inicioJanela
					).stream()
					.map(comentario -> antispamService.assinatura(comentario.getConteudo()))
					.toList();
			antispamService.validarComentarioNaoRepetido(assinaturaNova, assinaturasRecentes);
		});
	}
}
