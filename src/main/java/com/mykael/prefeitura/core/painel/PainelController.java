package com.mykael.prefeitura.core.painel;

import com.mykael.prefeitura.core.painel.dto.PainelModeracaoResumoDTO;
import com.mykael.prefeitura.core.painel.dto.PainelOperacionalResumoDTO;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/paineis")
public class PainelController implements PainelControllerOpenApi {

	private final PainelService painelService;

	public PainelController(PainelService painelService) {
		this.painelService = painelService;
	}

	@Override
	@GetMapping("/operacional/organizacoes/{organizacaoId}/resumo")
	@PreAuthorize("hasAnyRole('PREFEITURA', 'SECRETARIA')")
	public PainelOperacionalResumoDTO gerarResumoOperacional(
			@PathVariable Long organizacaoId,
			@AuthenticationPrincipal Jwt jwt
	) {
		return painelService.gerarResumoOperacional(organizacaoId, Long.valueOf(jwt.getSubject()));
	}

	@Override
	@GetMapping("/moderacao/resumo")
	@PreAuthorize("hasAnyRole('ADMIN', 'MODERADOR')")
	public PainelModeracaoResumoDTO gerarResumoModeracao() {
		return painelService.gerarResumoModeracao();
	}
}
