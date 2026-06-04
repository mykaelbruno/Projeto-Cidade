package com.mykael.prefeitura.core.sinalizacao;

import com.mykael.prefeitura.core.sinalizacao.dto.SinalizacaoDenunciaRequestDTO;
import com.mykael.prefeitura.core.sinalizacao.dto.SinalizacaoDenunciaResponseDTO;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SinalizacaoDenunciaController implements SinalizacaoDenunciaControllerOpenApi {

	private final SinalizacaoDenunciaService sinalizacaoService;

	public SinalizacaoDenunciaController(SinalizacaoDenunciaService sinalizacaoService) {
		this.sinalizacaoService = sinalizacaoService;
	}

	@Override
	@PostMapping("/api/denuncias/{denunciaId}/sinalizacoes")
	@PreAuthorize("isAuthenticated()")
	public ResponseEntity<SinalizacaoDenunciaResponseDTO> sinalizar(
			@PathVariable Long denunciaId,
			@Valid @RequestBody SinalizacaoDenunciaRequestDTO request,
			@AuthenticationPrincipal Jwt jwt
	) {
		SinalizacaoDenunciaResponseDTO response = sinalizacaoService.sinalizar(
				denunciaId,
				Long.valueOf(jwt.getSubject()),
				request
		);
		return ResponseEntity.status(201).body(response);
	}

	@Override
	@GetMapping("/api/moderacoes/sinalizacoes-denuncia")
	@PreAuthorize("hasAnyRole('ADMIN_APP', 'MODERADOR')")
	public Page<SinalizacaoDenunciaResponseDTO> listarParaModeracao(
			@RequestParam(required = false) StatusSinalizacaoDenuncia status,
			@PageableDefault(size = 20, sort = "criadoEm", direction = Sort.Direction.DESC) Pageable pageable
	) {
		return sinalizacaoService.listar(status, pageable);
	}

	@Override
	@PostMapping("/api/moderacoes/sinalizacoes-denuncia/{sinalizacaoId}/analise")
	@PreAuthorize("hasAnyRole('ADMIN_APP', 'MODERADOR')")
	public ResponseEntity<SinalizacaoDenunciaResponseDTO> marcarComoAnalisada(
			@PathVariable Long sinalizacaoId,
			@AuthenticationPrincipal Jwt jwt
	) {
		return ResponseEntity.ok(sinalizacaoService.marcarComoAnalisada(
				sinalizacaoId,
				Long.valueOf(jwt.getSubject())
		));
	}
}
