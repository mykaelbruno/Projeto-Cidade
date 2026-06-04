package com.mykael.prefeitura.core.anexo;

import com.mykael.prefeitura.core.anexo.dto.AnexoDenunciaResponseDTO;
import com.mykael.prefeitura.infra.security.UsuarioAutenticado;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/denuncias/{denunciaId}/anexos")
public class AnexoDenunciaController implements AnexoDenunciaControllerOpenApi {

	private final AnexoDenunciaService anexoDenunciaService;

	public AnexoDenunciaController(AnexoDenunciaService anexoDenunciaService) {
		this.anexoDenunciaService = anexoDenunciaService;
	}

	@Override
	@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	@PreAuthorize("hasRole('MORADOR')")
	public ResponseEntity<AnexoDenunciaResponseDTO> anexar(
			@PathVariable Long denunciaId,
			@RequestPart("arquivo") MultipartFile arquivo,
			@AuthenticationPrincipal Jwt jwt
	) {
		AnexoDenunciaResponseDTO response = anexoDenunciaService.anexar(
				denunciaId,
				Long.valueOf(jwt.getSubject()),
				arquivo
		);
		return ResponseEntity.status(201).body(response);
	}

	@Override
	@GetMapping
	@PreAuthorize("isAuthenticated()")
	public Page<AnexoDenunciaResponseDTO> listar(
			@PathVariable Long denunciaId,
			@AuthenticationPrincipal Jwt jwt,
			@PageableDefault(size = 20, sort = "criadoEm", direction = Sort.Direction.DESC) Pageable pageable
	) {
		return anexoDenunciaService.listar(denunciaId, UsuarioAutenticado.from(jwt), pageable);
	}

	@Override
	@GetMapping("/{anexoId}/arquivo")
	@PreAuthorize("isAuthenticated()")
	public ResponseEntity<Resource> baixarArquivo(
			@PathVariable Long denunciaId,
			@PathVariable Long anexoId,
			@AuthenticationPrincipal Jwt jwt
	) {
		ArquivoDenunciaDTO arquivo = anexoDenunciaService.carregarArquivo(denunciaId, anexoId, UsuarioAutenticado.from(jwt));
		return ResponseEntity.ok()
				.contentType(MediaType.parseMediaType(arquivo.contentType()))
				.header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.inline()
						.filename(arquivo.nomeOriginal())
						.build()
						.toString())
				.body(arquivo.resource());
	}
}
