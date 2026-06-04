package com.mykael.prefeitura.core.categoria;

import com.mykael.prefeitura.core.categoria.dto.CategoriaCreateRequestDTO;
import com.mykael.prefeitura.core.categoria.dto.CategoriaUpdateRequestDTO;
import com.mykael.prefeitura.core.organizacao.Organizacao;
import com.mykael.prefeitura.core.organizacao.OrganizacaoRepository;
import com.mykael.prefeitura.infra.auditoria.AuditoriaService;
import com.mykael.prefeitura.infra.auditoria.TipoAcaoAuditoria;
import com.mykael.prefeitura.infra.auditoria.TipoAlvoAuditoria;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CategoriaService {

	private final CategoriaRepository categoriaRepository;
	private final OrganizacaoRepository organizacaoRepository;
	private final AuditoriaService auditoriaService;

	public CategoriaService(
			CategoriaRepository categoriaRepository,
			OrganizacaoRepository organizacaoRepository,
			AuditoriaService auditoriaService
	) {
		this.categoriaRepository = categoriaRepository;
		this.organizacaoRepository = organizacaoRepository;
		this.auditoriaService = auditoriaService;
	}

	@Transactional(readOnly = true)
	public List<Categoria> listarTodas() {
		return categoriaRepository.findAll();
	}

	@Transactional
	public Categoria criar(CategoriaCreateRequestDTO request) {
		Categoria categoria = new Categoria();
		categoria.setNome(request.nome().trim());
		categoria.setDescricao(trimOrNull(request.descricao()));
		categoria.setOrganizacaoResponsavelPadrao(buscarOrganizacaoOpcional(request.organizacaoResponsavelPadraoId()));
		Categoria salva = categoriaRepository.save(categoria);
		auditoriaService.registrar(
				TipoAcaoAuditoria.CATEGORIA_CRIADA,
				TipoAlvoAuditoria.CATEGORIA,
				salva.getId(),
				"Categoria criada.",
				"Nome: " + salva.getNome()
		);
		return salva;
	}

	@Transactional
	public Categoria atualizar(Long categoriaId, CategoriaUpdateRequestDTO request) {
		Categoria categoria = buscarCategoria(categoriaId);
		categoria.setNome(request.nome().trim());
		categoria.setDescricao(trimOrNull(request.descricao()));
		categoria.setOrganizacaoResponsavelPadrao(buscarOrganizacaoOpcional(request.organizacaoResponsavelPadraoId()));
		auditoriaService.registrar(
				TipoAcaoAuditoria.CATEGORIA_ATUALIZADA,
				TipoAlvoAuditoria.CATEGORIA,
				categoria.getId(),
				"Categoria atualizada.",
				"Nome atual: " + categoria.getNome()
		);
		return categoria;
	}

	@Transactional
	public Categoria alterarAtiva(Long categoriaId, boolean ativa) {
		Categoria categoria = buscarCategoria(categoriaId);
		categoria.setAtiva(ativa);
		auditoriaService.registrar(
				TipoAcaoAuditoria.CATEGORIA_ATIVACAO_ALTERADA,
				TipoAlvoAuditoria.CATEGORIA,
				categoria.getId(),
				"Situacao ativa da categoria alterada.",
				"Ativa: " + ativa
		);
		return categoria;
	}

	private Categoria buscarCategoria(Long categoriaId) {
		return categoriaRepository.findById(categoriaId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Categoria nao encontrada."));
	}

	private Organizacao buscarOrganizacaoOpcional(Long organizacaoId) {
		if (organizacaoId == null) {
			return null;
		}
		return organizacaoRepository.findById(organizacaoId)
				.filter(Organizacao::isAtiva)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organizacao responsavel padrao nao encontrada ou inativa."));
	}

	private String trimOrNull(String value) {
		return value == null || value.isBlank() ? null : value.trim();
	}
}
