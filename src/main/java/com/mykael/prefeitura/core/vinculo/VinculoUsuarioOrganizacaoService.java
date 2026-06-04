package com.mykael.prefeitura.core.vinculo;

import com.mykael.prefeitura.core.organizacao.Organizacao;
import com.mykael.prefeitura.core.organizacao.OrganizacaoRepository;
import com.mykael.prefeitura.core.organizacao.TipoOrganizacao;
import com.mykael.prefeitura.core.usuario.PerfilUsuario;
import com.mykael.prefeitura.core.usuario.Usuario;
import com.mykael.prefeitura.core.usuario.UsuarioRepository;
import com.mykael.prefeitura.core.vinculo.dto.VinculoUsuarioOrganizacaoCreateRequestDTO;
import com.mykael.prefeitura.core.vinculo.dto.VinculoTransferenciaSecretariaRequestDTO;
import com.mykael.prefeitura.core.vinculo.dto.VinculoUsuarioOrganizacaoUpdateRequestDTO;
import com.mykael.prefeitura.infra.auditoria.AuditoriaService;
import com.mykael.prefeitura.infra.auditoria.TipoAcaoAuditoria;
import com.mykael.prefeitura.infra.auditoria.TipoAlvoAuditoria;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class VinculoUsuarioOrganizacaoService {

	private final VinculoUsuarioOrganizacaoRepository vinculoRepository;
	private final OrganizacaoRepository organizacaoRepository;
	private final UsuarioRepository usuarioRepository;
	private final AuditoriaService auditoriaService;

	public VinculoUsuarioOrganizacaoService(
			VinculoUsuarioOrganizacaoRepository vinculoRepository,
			OrganizacaoRepository organizacaoRepository,
			UsuarioRepository usuarioRepository,
			AuditoriaService auditoriaService
	) {
		this.vinculoRepository = vinculoRepository;
		this.organizacaoRepository = organizacaoRepository;
		this.usuarioRepository = usuarioRepository;
		this.auditoriaService = auditoriaService;
	}

	@Transactional(readOnly = true)
	public List<VinculoUsuarioOrganizacao> listarTodos() {
		return vinculoRepository.findAll();
	}

	@Transactional(readOnly = true)
	public List<VinculoUsuarioOrganizacao> listarPorOrganizacao(Long organizacaoId) {
		return vinculoRepository.findByOrganizacaoIdAndAtivoTrue(organizacaoId);
	}

	@Transactional(readOnly = true)
	public VinculoUsuarioOrganizacao buscar(Long vinculoId) {
		return vinculoRepository.findById(vinculoId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vinculo nao encontrado."));
	}

	@Transactional(readOnly = true)
	public List<VinculoUsuarioOrganizacao> listarPorUsuario(Long usuarioId) {
		return vinculoRepository.findByUsuarioIdAndAtivoTrue(usuarioId);
	}

	@Transactional
	public VinculoUsuarioOrganizacao criar(VinculoUsuarioOrganizacaoCreateRequestDTO request) {
		Usuario usuario = usuarioRepository.findById(request.usuarioId())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario nao encontrado."));
		Organizacao organizacao = organizacaoRepository.findById(request.organizacaoId())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organizacao nao encontrada."));

		validarUsuarioPodeReceberVinculo(usuario);
		validarOrganizacaoAtiva(organizacao);
		validarPapelPermitidoNaOrganizacao(organizacao, request.papel());

		if (!vinculoRepository.findByUsuarioIdAndAtivoTrue(usuario.getId()).isEmpty()) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Usuario ja possui vinculo institucional ativo.");
		}
		if (vinculoRepository.existsByUsuarioIdAndOrganizacaoIdAndPapel(usuario.getId(), organizacao.getId(), request.papel())) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Usuario ja possui vinculo com esta organizacao e papel.");
		}

		VinculoUsuarioOrganizacao vinculo = new VinculoUsuarioOrganizacao();
		vinculo.setUsuario(usuario);
		vinculo.setOrganizacao(organizacao);
		vinculo.setPapel(request.papel());
		vinculo.setAtivo(request.ativo() == null || request.ativo());

		VinculoUsuarioOrganizacao salvo = vinculoRepository.save(vinculo);
		auditoriaService.registrar(
				TipoAcaoAuditoria.VINCULO_ATUALIZADO,
				TipoAlvoAuditoria.VINCULO,
				salvo.getId(),
				"Vinculo institucional criado para usuario existente.",
				"Usuario id: " + usuario.getId()
						+ ", organizacao id: " + organizacao.getId()
						+ ", papel: " + request.papel()
		);
		return salvo;
	}

	@Transactional
	public VinculoUsuarioOrganizacao atualizar(Long vinculoId, VinculoUsuarioOrganizacaoUpdateRequestDTO request) {
		VinculoUsuarioOrganizacao vinculo = buscar(vinculoId);
		validarPapelPermitidoNaOrganizacao(vinculo.getOrganizacao(), request.papel());
		vinculo.setPapel(request.papel());
		vinculo.setAtivo(request.ativo());
		auditoriaService.registrar(
				TipoAcaoAuditoria.VINCULO_ATUALIZADO,
				TipoAlvoAuditoria.VINCULO,
				vinculo.getId(),
				"Vinculo institucional atualizado.",
				"Usuario id: " + vinculo.getUsuario().getId()
						+ ", organizacao id: " + vinculo.getOrganizacao().getId()
						+ ", papel: " + request.papel()
						+ ", ativo: " + request.ativo()
		);
		return vinculo;
	}

	@Transactional
	public VinculoUsuarioOrganizacao transferirSecretaria(Long vinculoId, VinculoTransferenciaSecretariaRequestDTO request) {
		VinculoUsuarioOrganizacao vinculo = buscar(vinculoId);
		Organizacao origem = vinculo.getOrganizacao();
		Organizacao destino = organizacaoRepository.findById(request.secretariaDestinoId())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Secretaria de destino nao encontrada."));

		validarTransferenciaSecretaria(vinculo, origem, destino);

		if (vinculoRepository.existsByUsuarioIdAndOrganizacaoIdAndPapel(
				vinculo.getUsuario().getId(),
				destino.getId(),
				vinculo.getPapel()
		)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Usuario ja possui vinculo com esta secretaria e papel.");
		}

		vinculo.setOrganizacao(destino);
		auditoriaService.registrar(
				TipoAcaoAuditoria.VINCULO_ORGANIZACAO_ALTERADA,
				TipoAlvoAuditoria.VINCULO,
				vinculo.getId(),
				"Vinculo institucional transferido para outra secretaria.",
				"Usuario id: " + vinculo.getUsuario().getId()
						+ ", origem id: " + origem.getId()
						+ ", destino id: " + destino.getId()
						+ ", papel: " + vinculo.getPapel()
		);
		return vinculo;
	}

	private void validarPapelPermitidoNaOrganizacao(Organizacao organizacao, PapelUsuario papel) {
		if (organizacao.getTipo() == TipoOrganizacao.PREFEITURA && papel != PapelUsuario.ADMIN_PREFEITURA) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Prefeitura aceita apenas ADMIN_PREFEITURA.");
		}
		if (organizacao.getTipo() == TipoOrganizacao.SECRETARIA
				&& papel != PapelUsuario.ADMIN_SECRETARIA
				&& papel != PapelUsuario.ATENDENTE_SECRETARIA) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Secretaria aceita apenas ADMIN_SECRETARIA ou ATENDENTE_SECRETARIA.");
		}
	}

	private void validarOrganizacaoAtiva(Organizacao organizacao) {
		if (!organizacao.isAtiva()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Organizacao precisa estar ativa para receber vinculo.");
		}
	}

	private void validarUsuarioPodeReceberVinculo(Usuario usuario) {
		if (!usuario.isAtivo()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Usuario precisa estar ativo para receber vinculo.");
		}
		if (usuario.getPerfilGlobal() != PerfilUsuario.MORADOR) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Apenas usuarios com perfil MORADOR podem receber vinculo institucional.");
		}
	}

	private void validarTransferenciaSecretaria(
			VinculoUsuarioOrganizacao vinculo,
			Organizacao origem,
			Organizacao destino
	) {
		if (origem.getTipo() != TipoOrganizacao.SECRETARIA) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Apenas vinculos de secretaria podem ser transferidos por este endpoint.");
		}
		if (destino.getTipo() != TipoOrganizacao.SECRETARIA) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Destino precisa ser uma secretaria.");
		}
		if (!destino.isAtiva()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Secretaria de destino precisa estar ativa.");
		}
		if (origem.getId().equals(destino.getId())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Secretaria de destino deve ser diferente da secretaria atual.");
		}
		if (origem.getOrganizacaoPai() == null || destino.getOrganizacaoPai() == null
				|| !origem.getOrganizacaoPai().getId().equals(destino.getOrganizacaoPai().getId())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Transferencia permitida apenas entre secretarias da mesma prefeitura.");
		}
		validarPapelPermitidoNaOrganizacao(destino, vinculo.getPapel());
	}
}
