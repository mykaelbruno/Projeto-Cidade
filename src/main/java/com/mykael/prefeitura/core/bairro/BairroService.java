package com.mykael.prefeitura.core.bairro;

import com.mykael.prefeitura.core.bairro.dto.BairroCreateRequestDTO;
import com.mykael.prefeitura.core.bairro.dto.BairroResponseDTO;
import com.mykael.prefeitura.core.bairro.dto.BairroUpdateRequestDTO;
import com.mykael.prefeitura.core.organizacao.Organizacao;
import com.mykael.prefeitura.core.organizacao.OrganizacaoRepository;
import com.mykael.prefeitura.core.organizacao.TipoOrganizacao;
import com.mykael.prefeitura.infra.auditoria.AuditoriaService;
import com.mykael.prefeitura.infra.auditoria.TipoAcaoAuditoria;
import com.mykael.prefeitura.infra.auditoria.TipoAlvoAuditoria;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class BairroService {

	private final BairroRepository bairroRepository;
	private final OrganizacaoRepository organizacaoRepository;
	private final AuditoriaService auditoriaService;

	public BairroService(
			BairroRepository bairroRepository,
			OrganizacaoRepository organizacaoRepository,
			AuditoriaService auditoriaService
	) {
		this.bairroRepository = bairroRepository;
		this.organizacaoRepository = organizacaoRepository;
		this.auditoriaService = auditoriaService;
	}

	@Transactional(readOnly = true)
	public List<BairroResponseDTO> listar(Long prefeituraId, boolean apenasAtivos) {
		buscarPrefeitura(prefeituraId);
		List<Bairro> bairros = apenasAtivos
				? bairroRepository.findByPrefeituraIdAndAtivoTrueOrderByNomeAsc(prefeituraId)
				: bairroRepository.findByPrefeituraIdOrderByNomeAsc(prefeituraId);
		return bairros.stream().map(BairroResponseDTO::from).toList();
	}

	@Transactional(readOnly = true)
	public Bairro buscar(Long bairroId) {
		return bairroRepository.findById(bairroId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bairro nao encontrado."));
	}

	@Transactional
	public BairroResponseDTO criar(Long prefeituraId, BairroCreateRequestDTO request) {
		Organizacao prefeitura = buscarPrefeitura(prefeituraId);
		String nome = normalizarNome(request.nome());
		validarNomeDisponivel(prefeitura.getId(), nome, null);

		Bairro bairro = new Bairro();
		bairro.setPrefeitura(prefeitura);
		bairro.setNome(nome);
		bairro.setCentroideLatitude(request.centroideLatitude());
		bairro.setCentroideLongitude(request.centroideLongitude());
		Bairro salvo = bairroRepository.save(bairro);
		auditoriaService.registrar(
				TipoAcaoAuditoria.BAIRRO_CRIADO,
				TipoAlvoAuditoria.BAIRRO,
				salvo.getId(),
				"Bairro criado.",
				"Prefeitura id: " + prefeitura.getId() + ", nome: " + nome
		);
		return BairroResponseDTO.from(salvo);
	}

	@Transactional
	public BairroResponseDTO atualizar(Long bairroId, BairroUpdateRequestDTO request) {
		Bairro bairro = buscar(bairroId);
		String nome = normalizarNome(request.nome());
		validarNomeDisponivel(bairro.getPrefeitura().getId(), nome, bairro.getId());
		bairro.setNome(nome);
		bairro.setCentroideLatitude(request.centroideLatitude());
		bairro.setCentroideLongitude(request.centroideLongitude());
		auditoriaService.registrar(
				TipoAcaoAuditoria.BAIRRO_ATUALIZADO,
				TipoAlvoAuditoria.BAIRRO,
				bairro.getId(),
				"Bairro atualizado.",
				"Prefeitura id: " + bairro.getPrefeitura().getId() + ", nome: " + nome
		);
		return BairroResponseDTO.from(bairro);
	}

	@Transactional
	public BairroResponseDTO alterarAtivo(Long bairroId, boolean ativo) {
		Bairro bairro = buscar(bairroId);
		bairro.setAtivo(ativo);
		auditoriaService.registrar(
				TipoAcaoAuditoria.BAIRRO_ATIVACAO_ALTERADA,
				TipoAlvoAuditoria.BAIRRO,
				bairro.getId(),
				"Situacao ativa do bairro alterada.",
				"Ativo: " + ativo
		);
		return BairroResponseDTO.from(bairro);
	}

	private Organizacao buscarPrefeitura(Long prefeituraId) {
		Organizacao prefeitura = organizacaoRepository.findById(prefeituraId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Prefeitura nao encontrada."));
		if (prefeitura.getTipo() != TipoOrganizacao.PREFEITURA) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Organizacao informada nao e uma prefeitura.");
		}
		return prefeitura;
	}

	private String normalizarNome(String nome) {
		return nome.trim().replaceAll("\\s+", " ");
	}

	private void validarNomeDisponivel(Long prefeituraId, String nome, Long bairroIdAtual) {
		boolean existe = bairroIdAtual == null
				? bairroRepository.existsByPrefeituraIdAndNomeIgnoreCase(prefeituraId, nome)
				: bairroRepository.existsByPrefeituraIdAndNomeIgnoreCaseAndIdNot(prefeituraId, nome, bairroIdAtual);
		if (existe) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Ja existe um bairro com este nome nesta prefeitura.");
		}
	}
}
