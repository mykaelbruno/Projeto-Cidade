package com.mykael.prefeitura.core.relatorio;

import com.mykael.prefeitura.core.denuncia.StatusDenuncia;
import com.mykael.prefeitura.core.relatorio.dto.RelatorioCsvResponseDTO;
import java.nio.charset.StandardCharsets;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/relatorios")
public class RelatorioOperacionalController implements RelatorioOperacionalControllerOpenApi {

	private final RelatorioOperacionalService relatorioOperacionalService;

	public RelatorioOperacionalController(RelatorioOperacionalService relatorioOperacionalService) {
		this.relatorioOperacionalService = relatorioOperacionalService;
	}

	@Override
	@GetMapping(value = "/operacional/organizacoes/{organizacaoId}/denuncias.csv", produces = "text/csv")
	@PreAuthorize("hasAnyRole('PREFEITURA', 'SECRETARIA')")
	public ResponseEntity<byte[]> exportarDenunciasCsv(
			@PathVariable Long organizacaoId,
			@RequestParam(required = false) String cidade,
			@RequestParam(required = false) String bairro,
			@RequestParam(required = false) StatusDenuncia status,
			@RequestParam(required = false) Long categoriaId,
			@AuthenticationPrincipal Jwt jwt
	) {
		RelatorioCsvResponseDTO relatorio = relatorioOperacionalService.exportarDenunciasCsv(
				organizacaoId,
				Long.valueOf(jwt.getSubject()),
				cidade,
				bairro,
				status,
				categoriaId
		);

		return ResponseEntity.ok()
				.contentType(new MediaType("text", "csv", StandardCharsets.UTF_8))
				.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + relatorio.nomeArquivo() + "\"")
				.body(relatorio.conteudo());
	}
}
