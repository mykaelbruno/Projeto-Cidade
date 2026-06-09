package com.mykael.prefeitura.core.operacional;

import com.mykael.prefeitura.core.denuncia.dto.DenunciaResponseDTO;
import com.mykael.prefeitura.core.denuncia.StatusDenuncia;
import com.mykael.prefeitura.core.operacional.dto.AlterarResponsavelDenunciaRequestDTO;
import com.mykael.prefeitura.core.operacional.dto.SolicitacaoTransferenciaAprovacaoRequestDTO;
import com.mykael.prefeitura.core.operacional.dto.SolicitacaoTransferenciaCreateRequestDTO;
import com.mykael.prefeitura.core.operacional.dto.SolicitacaoTransferenciaRecusaRequestDTO;
import com.mykael.prefeitura.core.operacional.dto.SolicitacaoTransferenciaResponseDTO;
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
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/operacional")
public class OperacionalDenunciaController implements OperacionalDenunciaControllerOpenApi {

	private final OperacionalDenunciaService operacionalService;

	public OperacionalDenunciaController(OperacionalDenunciaService operacionalService) {
		this.operacionalService = operacionalService;
	}

	@Override
	@GetMapping("/organizacoes/{organizacaoId}/denuncias")
	@PreAuthorize("hasAnyRole('PREFEITURA', 'SECRETARIA', 'ADMIN')")
	public Page<DenunciaResponseDTO> listarDenunciasDaOrganizacao(
			@PathVariable Long organizacaoId,
			@RequestParam(required = false) String cidade,
			@RequestParam(required = false) String bairro,
			@RequestParam(required = false) StatusDenuncia status,
			@RequestParam(required = false) Long categoriaId,
			@RequestParam(required = false) Long organizacaoResponsavelId,
			@RequestParam(required = false) String termo,
			@AuthenticationPrincipal Jwt jwt,
			@PageableDefault(size = 20, sort = "criadoEm", direction = Sort.Direction.DESC) Pageable pageable
	) {
		return operacionalService.listarDenunciasDaOrganizacao(
				organizacaoId,
				Long.valueOf(jwt.getSubject()),
				cidade,
				bairro,
				status,
				categoriaId,
				organizacaoResponsavelId,
				termo,
				pageable
		);
	}

	@Override
	@PostMapping("/denuncias/{denunciaId}/solicitacoes-transferencia")
	@PreAuthorize("hasRole('SECRETARIA')")
	public ResponseEntity<SolicitacaoTransferenciaResponseDTO> solicitarTransferencia(
			@PathVariable Long denunciaId,
			@Valid @RequestBody SolicitacaoTransferenciaCreateRequestDTO request,
			@AuthenticationPrincipal Jwt jwt
	) {
		SolicitacaoTransferenciaResponseDTO response = operacionalService.solicitarTransferencia(
				denunciaId,
				Long.valueOf(jwt.getSubject()),
				request
		);
		return ResponseEntity.status(201).body(response);
	}

	@Override
	@GetMapping("/prefeituras/{prefeituraId}/solicitacoes-transferencia")
	@PreAuthorize("hasRole('PREFEITURA')")
	public Page<SolicitacaoTransferenciaResponseDTO> listarSolicitacoesDaPrefeitura(
			@PathVariable Long prefeituraId,
			@RequestParam(required = false) StatusSolicitacaoTransferencia status,
			@AuthenticationPrincipal Jwt jwt,
			@PageableDefault(size = 20, sort = "criadoEm", direction = Sort.Direction.DESC) Pageable pageable
	) {
		return operacionalService.listarSolicitacoesDaPrefeitura(
				prefeituraId,
				Long.valueOf(jwt.getSubject()),
				status,
				pageable
		);
	}

	@Override
	@PostMapping("/solicitacoes-transferencia/{solicitacaoId}/aprovacao")
	@PreAuthorize("hasRole('PREFEITURA')")
	public ResponseEntity<SolicitacaoTransferenciaResponseDTO> aprovarTransferencia(
			@PathVariable Long solicitacaoId,
			@Valid @RequestBody SolicitacaoTransferenciaAprovacaoRequestDTO request,
			@AuthenticationPrincipal Jwt jwt
	) {
		return ResponseEntity.ok(operacionalService.aprovarTransferencia(
				solicitacaoId,
				Long.valueOf(jwt.getSubject()),
				request
		));
	}

	@Override
	@PostMapping("/solicitacoes-transferencia/{solicitacaoId}/recusa")
	@PreAuthorize("hasRole('PREFEITURA')")
	public ResponseEntity<SolicitacaoTransferenciaResponseDTO> recusarTransferencia(
			@PathVariable Long solicitacaoId,
			@Valid @RequestBody SolicitacaoTransferenciaRecusaRequestDTO request,
			@AuthenticationPrincipal Jwt jwt
	) {
		return ResponseEntity.ok(operacionalService.recusarTransferencia(
				solicitacaoId,
				Long.valueOf(jwt.getSubject()),
				request
		));
	}

	@Override
	@PatchMapping("/denuncias/{denunciaId}/responsavel")
	@PreAuthorize("hasRole('PREFEITURA')")
	public ResponseEntity<DenunciaResponseDTO> alterarResponsavelPelaPrefeitura(
			@PathVariable Long denunciaId,
			@Valid @RequestBody AlterarResponsavelDenunciaRequestDTO request,
			@AuthenticationPrincipal Jwt jwt
	) {
		return ResponseEntity.ok(operacionalService.alterarResponsavelPelaPrefeitura(
				denunciaId,
				Long.valueOf(jwt.getSubject()),
				request
		));
	}
}
