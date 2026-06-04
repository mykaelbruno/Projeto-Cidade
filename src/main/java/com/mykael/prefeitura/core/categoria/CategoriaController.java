package com.mykael.prefeitura.core.categoria;

import com.mykael.prefeitura.core.comum.dto.AtivacaoRequestDTO;
import com.mykael.prefeitura.core.categoria.dto.CategoriaResponseDTO;
import com.mykael.prefeitura.core.categoria.dto.CategoriaCreateRequestDTO;
import com.mykael.prefeitura.core.categoria.dto.CategoriaUpdateRequestDTO;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/categorias")
public class CategoriaController implements CategoriaControllerOpenApi {

	private final CategoriaService categoriaService;

	public CategoriaController(CategoriaService categoriaService) {
		this.categoriaService = categoriaService;
	}

	@Override
	@GetMapping
	public List<CategoriaResponseDTO> listar() {
		return categoriaService.listarTodas()
				.stream()
				.map(CategoriaResponseDTO::from)
				.toList();
	}

	@Override
	@PostMapping
	@PreAuthorize("hasRole('ADMIN_APP')")
	public ResponseEntity<CategoriaResponseDTO> criar(@Valid @RequestBody CategoriaCreateRequestDTO request) {
		return ResponseEntity.status(201).body(CategoriaResponseDTO.from(categoriaService.criar(request)));
	}

	@Override
	@PutMapping("/{categoriaId}")
	@PreAuthorize("hasRole('ADMIN_APP')")
	public ResponseEntity<CategoriaResponseDTO> atualizar(
			@PathVariable Long categoriaId,
			@Valid @RequestBody CategoriaUpdateRequestDTO request
	) {
		return ResponseEntity.ok(CategoriaResponseDTO.from(categoriaService.atualizar(categoriaId, request)));
	}

	@Override
	@PatchMapping("/{categoriaId}/ativacao")
	@PreAuthorize("hasRole('ADMIN_APP')")
	public ResponseEntity<CategoriaResponseDTO> alterarAtiva(
			@PathVariable Long categoriaId,
			@RequestBody AtivacaoRequestDTO request
	) {
		return ResponseEntity.ok(CategoriaResponseDTO.from(categoriaService.alterarAtiva(categoriaId, request.ativo())));
	}
}
