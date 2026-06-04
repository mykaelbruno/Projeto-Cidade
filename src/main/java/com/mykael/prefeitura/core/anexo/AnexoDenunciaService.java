package com.mykael.prefeitura.core.anexo;

import com.mykael.prefeitura.core.anexo.dto.AnexoDenunciaResponseDTO;
import com.mykael.prefeitura.core.denuncia.Denuncia;
import com.mykael.prefeitura.core.denuncia.DenunciaRepository;
import com.mykael.prefeitura.core.timeline.TimelineDenunciaService;
import com.mykael.prefeitura.core.usuario.Usuario;
import com.mykael.prefeitura.core.usuario.UsuarioRepository;
import com.mykael.prefeitura.core.denuncia.VisibilidadeDenunciaService;
import com.mykael.prefeitura.infra.security.UsuarioAutenticado;
import com.mykael.prefeitura.infra.storage.ArquivoArmazenado;
import com.mykael.prefeitura.infra.storage.StorageService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AnexoDenunciaService {

	private final AnexoDenunciaRepository anexoRepository;
	private final DenunciaRepository denunciaRepository;
	private final UsuarioRepository usuarioRepository;
	private final StorageService storageService;
	private final TimelineDenunciaService timelineDenunciaService;
	private final VisibilidadeDenunciaService visibilidadeDenunciaService;

	public AnexoDenunciaService(
			AnexoDenunciaRepository anexoRepository,
			DenunciaRepository denunciaRepository,
			UsuarioRepository usuarioRepository,
			StorageService storageService,
			TimelineDenunciaService timelineDenunciaService,
			VisibilidadeDenunciaService visibilidadeDenunciaService
	) {
		this.anexoRepository = anexoRepository;
		this.denunciaRepository = denunciaRepository;
		this.usuarioRepository = usuarioRepository;
		this.storageService = storageService;
		this.timelineDenunciaService = timelineDenunciaService;
		this.visibilidadeDenunciaService = visibilidadeDenunciaService;
	}

	@Transactional
	public AnexoDenunciaResponseDTO anexar(Long denunciaId, Long usuarioId, MultipartFile arquivo) {
		Denuncia denuncia = buscarDenuncia(denunciaId);
		Usuario autor = buscarUsuarioAtivo(usuarioId);
		exigirAutorDaDenuncia(denuncia, usuarioId);

		ArquivoArmazenado arquivoArmazenado = storageService.salvarAnexoDenuncia(denunciaId, arquivo);
		try {
			AnexoDenuncia anexo = new AnexoDenuncia();
			anexo.setDenuncia(denuncia);
			anexo.setAutor(autor);
			anexo.setNomeOriginal(arquivoArmazenado.nomeOriginal());
			anexo.setNomeArmazenado(arquivoArmazenado.nomeArmazenado());
			anexo.setCaminhoArquivo(arquivoArmazenado.caminhoRelativo());
			anexo.setContentType(arquivoArmazenado.contentType());
			anexo.setTamanhoBytes(arquivoArmazenado.tamanhoBytes());

			AnexoDenuncia salvo = anexoRepository.save(anexo);
			timelineDenunciaService.registrarAnexoAdicionado(denuncia, autor);
			return AnexoDenunciaResponseDTO.from(salvo, visibilidadeDenunciaService.deveOcultarAutorMorador(denuncia, autor.getId()));
		} catch (RuntimeException exception) {
			storageService.removerAnexoDenuncia(arquivoArmazenado.caminhoRelativo());
			throw exception;
		}
	}

	@Transactional(readOnly = true)
	public Page<AnexoDenunciaResponseDTO> listar(Long denunciaId, UsuarioAutenticado usuario, Pageable pageable) {
		Denuncia denuncia = buscarDenuncia(denunciaId);
		visibilidadeDenunciaService.exigirPodeVisualizar(denuncia, usuario);
		return anexoRepository.findByDenunciaId(denunciaId, pageable)
				.map(anexo -> AnexoDenunciaResponseDTO.from(
						anexo,
						visibilidadeDenunciaService.deveOcultarAutorMorador(denuncia, anexo.getAutor().getId())
				));
	}

	@Transactional(readOnly = true)
	public ArquivoDenunciaDTO carregarArquivo(Long denunciaId, Long anexoId, UsuarioAutenticado usuario) {
		AnexoDenuncia anexo = anexoRepository.findByIdAndDenunciaId(anexoId, denunciaId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Anexo da denuncia nao encontrado."));
		visibilidadeDenunciaService.exigirPodeVisualizar(anexo.getDenuncia(), usuario);
		return new ArquivoDenunciaDTO(
				storageService.carregarAnexoDenuncia(anexo.getCaminhoArquivo()),
				anexo.getNomeOriginal(),
				anexo.getContentType()
		);
	}

	private Denuncia buscarDenuncia(Long denunciaId) {
		return denunciaRepository.findById(denunciaId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Denuncia nao encontrada."));
	}

	private Usuario buscarUsuarioAtivo(Long usuarioId) {
		return usuarioRepository.findById(usuarioId)
				.filter(Usuario::isAtivo)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario autenticado nao encontrado ou inativo."));
	}

	private void exigirAutorDaDenuncia(Denuncia denuncia, Long usuarioId) {
		if (!denuncia.getAutor().getId().equals(usuarioId)) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Apenas o autor da denuncia pode adicionar anexos.");
		}
	}
}
