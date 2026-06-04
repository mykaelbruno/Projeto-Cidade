package com.mykael.prefeitura.core.interacao;

import com.mykael.prefeitura.core.denuncia.Denuncia;
import com.mykael.prefeitura.core.denuncia.DenunciaRepository;
import com.mykael.prefeitura.core.interacao.dto.InteracaoDenunciaResponseDTO;
import com.mykael.prefeitura.core.usuario.Usuario;
import com.mykael.prefeitura.core.usuario.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class InteracaoDenunciaService {

	private final InteracaoDenunciaRepository interacaoRepository;
	private final DenunciaRepository denunciaRepository;
	private final UsuarioRepository usuarioRepository;

	public InteracaoDenunciaService(
			InteracaoDenunciaRepository interacaoRepository,
			DenunciaRepository denunciaRepository,
			UsuarioRepository usuarioRepository
	) {
		this.interacaoRepository = interacaoRepository;
		this.denunciaRepository = denunciaRepository;
		this.usuarioRepository = usuarioRepository;
	}

	@Transactional
	public InteracaoDenunciaResponseDTO confirmar(Long denunciaId, Long usuarioId) {
		return adicionarInteracao(denunciaId, usuarioId, TipoInteracaoDenuncia.CONFIRMACAO);
	}

	@Transactional
	public InteracaoDenunciaResponseDTO removerConfirmacao(Long denunciaId, Long usuarioId) {
		return removerInteracao(denunciaId, usuarioId, TipoInteracaoDenuncia.CONFIRMACAO);
	}

	@Transactional
	public InteracaoDenunciaResponseDTO marcarUrgente(Long denunciaId, Long usuarioId) {
		return adicionarInteracao(denunciaId, usuarioId, TipoInteracaoDenuncia.URGENCIA);
	}

	@Transactional
	public InteracaoDenunciaResponseDTO removerUrgencia(Long denunciaId, Long usuarioId) {
		return removerInteracao(denunciaId, usuarioId, TipoInteracaoDenuncia.URGENCIA);
	}

	@Transactional(readOnly = true)
	public InteracaoDenunciaResponseDTO obterStatusInteracao(Long denunciaId, Long usuarioId) {
		Denuncia denuncia = buscarDenuncia(denunciaId);
		return montarResposta(denuncia, usuarioId);
	}

	private InteracaoDenunciaResponseDTO adicionarInteracao(
			Long denunciaId,
			Long usuarioId,
			TipoInteracaoDenuncia tipo
	) {
		Denuncia denuncia = buscarDenuncia(denunciaId);
		Usuario usuario = buscarUsuarioAtivo(usuarioId);

		if (denuncia.getAutor().getId().equals(usuarioId)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O autor nao pode apoiar ou marcar urgencia na propria denuncia.");
		}

		boolean jaExiste = interacaoRepository.existsByDenunciaIdAndUsuarioIdAndTipo(denunciaId, usuarioId, tipo);
		if (!jaExiste) {
			InteracaoDenuncia interacao = new InteracaoDenuncia();
			interacao.setDenuncia(denuncia);
			interacao.setUsuario(usuario);
			interacao.setTipo(tipo);
			interacaoRepository.save(interacao);

			if (tipo == TipoInteracaoDenuncia.CONFIRMACAO) {
				denuncia.incrementarConfirmacoes();
			} else {
				denuncia.incrementarUrgencias();
			}
		}

		return montarResposta(denuncia, usuarioId);
	}

	private InteracaoDenunciaResponseDTO removerInteracao(
			Long denunciaId,
			Long usuarioId,
			TipoInteracaoDenuncia tipo
	) {
		Denuncia denuncia = buscarDenuncia(denunciaId);
		buscarUsuarioAtivo(usuarioId);

		interacaoRepository.findByDenunciaIdAndUsuarioIdAndTipo(denunciaId, usuarioId, tipo)
				.ifPresent(interacao -> {
					interacaoRepository.delete(interacao);
					if (tipo == TipoInteracaoDenuncia.CONFIRMACAO) {
						denuncia.decrementarConfirmacoes();
					} else {
						denuncia.decrementarUrgencias();
					}
				});

		return montarResposta(denuncia, usuarioId);
	}

	private InteracaoDenunciaResponseDTO montarResposta(Denuncia denuncia, Long usuarioId) {
		boolean confirmou = interacaoRepository.existsByDenunciaIdAndUsuarioIdAndTipo(
				denuncia.getId(),
				usuarioId,
				TipoInteracaoDenuncia.CONFIRMACAO
		);
		boolean marcouUrgente = interacaoRepository.existsByDenunciaIdAndUsuarioIdAndTipo(
				denuncia.getId(),
				usuarioId,
				TipoInteracaoDenuncia.URGENCIA
		);
		return InteracaoDenunciaResponseDTO.from(denuncia, confirmou, marcouUrgente);
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
}
