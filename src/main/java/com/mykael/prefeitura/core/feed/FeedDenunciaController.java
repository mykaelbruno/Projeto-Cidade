package com.mykael.prefeitura.core.feed;

import com.mykael.prefeitura.core.denuncia.StatusDenuncia;
import com.mykael.prefeitura.core.feed.dto.FeedDenunciaFiltroDTO;
import com.mykael.prefeitura.core.feed.dto.FeedDenunciaResponseDTO;
import com.mykael.prefeitura.infra.security.UsuarioAutenticado;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/feed/denuncias")
public class FeedDenunciaController implements FeedDenunciaControllerOpenApi {

	private final FeedDenunciaService feedDenunciaService;

	public FeedDenunciaController(FeedDenunciaService feedDenunciaService) {
		this.feedDenunciaService = feedDenunciaService;
	}

	@Override
	@GetMapping
	@PreAuthorize("isAuthenticated()")
	public Page<FeedDenunciaResponseDTO> listar(
			@RequestParam(required = false) String cidade,
			@RequestParam(required = false) String bairro,
			@RequestParam(required = false) StatusDenuncia status,
			@RequestParam(required = false) Long categoriaId,
			@RequestParam(required = false, defaultValue = "MISTO") ModoOrdenacaoFeed modo,
			@RequestParam(required = false, defaultValue = "false") Boolean excluirProprias,
			@RequestParam(required = false) String termo,
			@AuthenticationPrincipal Jwt jwt,
			@PageableDefault(size = 20) Pageable pageable
	) {
		return feedDenunciaService.listar(
				new FeedDenunciaFiltroDTO(cidade, bairro, status, categoriaId, modo, excluirProprias, termo),
				UsuarioAutenticado.from(jwt),
				pageable
		);
	}
}
