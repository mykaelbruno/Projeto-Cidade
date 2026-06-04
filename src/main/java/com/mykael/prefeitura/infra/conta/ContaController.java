package com.mykael.prefeitura.infra.conta;

import com.mykael.prefeitura.infra.conta.dto.ConfirmarVerificacaoEmailRequestDTO;
import com.mykael.prefeitura.infra.conta.dto.MensagemResponseDTO;
import com.mykael.prefeitura.infra.conta.dto.RedefinirSenhaRequestDTO;
import com.mykael.prefeitura.infra.conta.dto.SolicitarRecuperacaoSenhaRequestDTO;
import com.mykael.prefeitura.infra.conta.dto.SolicitarVerificacaoEmailRequestDTO;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/conta")
public class ContaController implements ContaControllerOpenApi {

	private final ContaService contaService;

	public ContaController(ContaService contaService) {
		this.contaService = contaService;
	}

	@Override
	@PostMapping("/verificacao-email/solicitacao")
	public ResponseEntity<MensagemResponseDTO> solicitarVerificacaoEmail(
			@Valid @RequestBody SolicitarVerificacaoEmailRequestDTO request
	) {
		contaService.solicitarVerificacaoEmail(request.email());
		return ResponseEntity.ok(new MensagemResponseDTO("Se a conta existir e precisar de verificacao, enviaremos as instrucoes."));
	}

	@Override
	@PostMapping("/verificacao-email/confirmacao")
	public ResponseEntity<MensagemResponseDTO> confirmarEmail(
			@Valid @RequestBody ConfirmarVerificacaoEmailRequestDTO request
	) {
		contaService.confirmarEmail(request.token());
		return ResponseEntity.ok(new MensagemResponseDTO("E-mail verificado com sucesso."));
	}

	@Override
	@PostMapping("/recuperacao-senha/solicitacao")
	public ResponseEntity<MensagemResponseDTO> solicitarRecuperacaoSenha(
			@Valid @RequestBody SolicitarRecuperacaoSenhaRequestDTO request
	) {
		contaService.solicitarRecuperacaoSenha(request.email());
		return ResponseEntity.ok(new MensagemResponseDTO("Se a conta existir, enviaremos as instrucoes de recuperacao."));
	}

	@Override
	@PostMapping("/recuperacao-senha/redefinicao")
	public ResponseEntity<MensagemResponseDTO> redefinirSenha(@Valid @RequestBody RedefinirSenhaRequestDTO request) {
		contaService.redefinirSenha(request.token(), request.novaSenha());
		return ResponseEntity.ok(new MensagemResponseDTO("Senha redefinida com sucesso."));
	}
}
