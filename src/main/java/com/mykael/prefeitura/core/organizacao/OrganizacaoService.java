package com.mykael.prefeitura.core.organizacao;

import com.mykael.prefeitura.core.organizacao.dto.PrefeituraCreateRequestDTO;
import com.mykael.prefeitura.core.organizacao.dto.OrganizacaoUpdateRequestDTO;
import com.mykael.prefeitura.core.organizacao.dto.SecretariaCreateRequestDTO;
import com.mykael.prefeitura.core.organizacao.dto.SecretariaCategoriasUpdateRequestDTO;
import com.mykael.prefeitura.core.organizacao.dto.UsuarioInstitucionalCreateRequestDTO;
import com.mykael.prefeitura.core.usuario.PerfilUsuario;
import com.mykael.prefeitura.core.usuario.Usuario;
import com.mykael.prefeitura.core.usuario.UsuarioRepository;
import com.mykael.prefeitura.core.vinculo.PapelUsuario;
import com.mykael.prefeitura.core.vinculo.VinculoUsuarioOrganizacao;
import com.mykael.prefeitura.core.vinculo.VinculoUsuarioOrganizacaoRepository;
import com.mykael.prefeitura.infra.auditoria.AuditoriaService;
import com.mykael.prefeitura.infra.auditoria.TipoAcaoAuditoria;
import com.mykael.prefeitura.infra.auditoria.TipoAlvoAuditoria;
import com.mykael.prefeitura.core.categoria.Categoria;
import com.mykael.prefeitura.core.categoria.CategoriaRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class OrganizacaoService {

	private final OrganizacaoRepository organizacaoRepository;
	private final UsuarioRepository usuarioRepository;
	private final VinculoUsuarioOrganizacaoRepository vinculoRepository;
	private final PasswordEncoder passwordEncoder;
	private final AuditoriaService auditoriaService;
	private final CategoriaRepository categoriaRepository;

	public OrganizacaoService(
			OrganizacaoRepository organizacaoRepository,
			UsuarioRepository usuarioRepository,
			VinculoUsuarioOrganizacaoRepository vinculoRepository,
			PasswordEncoder passwordEncoder,
			AuditoriaService auditoriaService,
			CategoriaRepository categoriaRepository
	) {
		this.organizacaoRepository = organizacaoRepository;
		this.usuarioRepository = usuarioRepository;
		this.vinculoRepository = vinculoRepository;
		this.passwordEncoder = passwordEncoder;
		this.auditoriaService = auditoriaService;
		this.categoriaRepository = categoriaRepository;
	}

	@Transactional(readOnly = true)
	public List<Organizacao> listarTodas() {
		return organizacaoRepository.findAll();
	}

	@Transactional(readOnly = true)
	public List<Organizacao> listarPrefeiturasAtivas() {
		return organizacaoRepository.findByTipoAndAtivaTrue(TipoOrganizacao.PREFEITURA);
	}

	@Transactional
	public Organizacao criarPrefeitura(PrefeituraCreateRequestDTO request) {
		if (organizacaoRepository.existsByTipoAndCidadeIgnoreCaseAndEstadoIgnoreCase(TipoOrganizacao.PREFEITURA, request.cidade().trim(), request.estado().trim())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ja existe uma prefeitura cadastrada para esta cidade e estado.");
		}

		Organizacao prefeitura = new Organizacao();
		prefeitura.setNome(request.nome().trim());
		prefeitura.setTipo(TipoOrganizacao.PREFEITURA);
		prefeitura.setCidade(request.cidade().trim());
		prefeitura.setEstado(request.estado().trim().toUpperCase());
		prefeitura.setVerificada(request.verificada());
		Organizacao salva = organizacaoRepository.save(prefeitura);
		auditoriaService.registrar(
				TipoAcaoAuditoria.ORGANIZACAO_CRIADA,
				TipoAlvoAuditoria.ORGANIZACAO,
				salva.getId(),
				"Prefeitura criada.",
				"Nome: " + salva.getNome()
		);
		return salva;
	}

	@Transactional
	public Organizacao criarSecretaria(Long prefeituraId, SecretariaCreateRequestDTO request) {
		Organizacao prefeitura = buscarPrefeitura(prefeituraId);
		if (!prefeitura.isAtiva()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A prefeitura pai selecionada nao esta ativa.");
		}

		Organizacao secretaria = new Organizacao();
		secretaria.setNome(request.nome().trim());
		secretaria.setTipo(TipoOrganizacao.SECRETARIA);
		secretaria.setCidade(prefeitura.getCidade());
		secretaria.setEstado(prefeitura.getEstado());
		secretaria.setOrganizacaoPai(prefeitura);
		secretaria.setVerificada(prefeitura.isVerificada());
		Organizacao salva = organizacaoRepository.save(secretaria);

		if (request.categoriasIds() != null && !request.categoriasIds().isEmpty()) {
			List<Categoria> categorias = categoriaRepository.findAllById(request.categoriasIds());
			for (Categoria cat : categorias) {
				cat.setOrganizacaoResponsavelPadrao(salva);
				categoriaRepository.save(cat);
			}
		}

		auditoriaService.registrar(
				TipoAcaoAuditoria.ORGANIZACAO_CRIADA,
				TipoAlvoAuditoria.ORGANIZACAO,
				salva.getId(),
				"Secretaria criada.",
				"Prefeitura id: " + prefeitura.getId()
		);
		return salva;
	}

	@Transactional
	public Organizacao atualizarOrganizacao(Long organizacaoId, OrganizacaoUpdateRequestDTO request) {
		Organizacao organizacao = buscarOrganizacao(organizacaoId);
		
		if (organizacao.getTipo() == TipoOrganizacao.PREFEITURA) {
			if (organizacaoRepository.existsByTipoAndCidadeIgnoreCaseAndEstadoIgnoreCaseAndIdNot(
					TipoOrganizacao.PREFEITURA, request.cidade().trim(), request.estado().trim(), organizacaoId)) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ja existe outra prefeitura cadastrada para esta cidade e estado.");
			}
			organizacao.setNome(request.nome().trim());
			organizacao.setCidade(request.cidade().trim());
			organizacao.setEstado(request.estado().trim().toUpperCase());
			organizacao.setVerificada(request.verificada());
			
			// Propagate city/state changes to all child secretarias
			List<Organizacao> secretarias = organizacaoRepository.findByOrganizacaoPai(organizacao);
			for (Organizacao sec : secretarias) {
				sec.setCidade(organizacao.getCidade());
				sec.setEstado(organizacao.getEstado());
			}
		} else if (organizacao.getTipo() == TipoOrganizacao.SECRETARIA) {
			Organizacao prefeituraPai = organizacao.getOrganizacaoPai();
			if (prefeituraPai == null || !prefeituraPai.isAtiva()) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A secretaria deve possuir uma prefeitura pai ativa atrelada a ela.");
			}
			organizacao.setNome(request.nome().trim());
			// Force city/state to match the parent prefeitura
			organizacao.setCidade(prefeituraPai.getCidade());
			organizacao.setEstado(prefeituraPai.getEstado());
			organizacao.setVerificada(request.verificada());
		}
		
		auditoriaService.registrar(
				TipoAcaoAuditoria.ORGANIZACAO_ATUALIZADA,
				TipoAlvoAuditoria.ORGANIZACAO,
				organizacao.getId(),
				"Organizacao atualizada.",
				"Nome atual: " + organizacao.getNome()
		);
		return organizacao;
	}

	@Transactional
	public Organizacao alterarAtiva(Long organizacaoId, boolean ativa) {
		Organizacao organizacao = buscarOrganizacao(organizacaoId);
		
		if (organizacao.getTipo() == TipoOrganizacao.SECRETARIA && ativa) {
			Organizacao prefeituraPai = organizacao.getOrganizacaoPai();
			if (prefeituraPai == null || !prefeituraPai.isAtiva()) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nao e possivel ativar uma secretaria cuja prefeitura pai esta inativa.");
			}
		}
		
		organizacao.setAtiva(ativa);
		
		if (organizacao.getTipo() == TipoOrganizacao.PREFEITURA && !ativa) {
			List<Organizacao> secretarias = organizacaoRepository.findByOrganizacaoPai(organizacao);
			for (Organizacao sec : secretarias) {
				sec.setAtiva(false);
			}
		}
		
		auditoriaService.registrar(
				TipoAcaoAuditoria.ORGANIZACAO_ATIVACAO_ALTERADA,
				TipoAlvoAuditoria.ORGANIZACAO,
				organizacao.getId(),
				"Situacao ativa da organizacao alterada.",
				"Ativa: " + ativa
		);
		return organizacao;
	}

	@Transactional
	public Organizacao atualizarCategoriasSecretaria(Long secretariaId, SecretariaCategoriasUpdateRequestDTO request) {
		Organizacao secretaria = buscarOrganizacao(secretariaId);
		if (secretaria.getTipo() != TipoOrganizacao.SECRETARIA) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Organizacao informada nao e uma secretaria.");
		}

		List<Long> categoriasIds = request.categoriasIds() == null ? List.of() : request.categoriasIds();
		List<Categoria> atuais = categoriaRepository.findByOrganizacaoResponsavelPadraoId(secretaria.getId());
		for (Categoria categoria : atuais) {
			if (!categoriasIds.contains(categoria.getId())) {
				categoria.setOrganizacaoResponsavelPadrao(null);
			}
		}

		if (!categoriasIds.isEmpty()) {
			List<Categoria> novas = categoriaRepository.findAllById(categoriasIds);
			if (novas.size() != categoriasIds.stream().distinct().count()) {
				throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Uma ou mais categorias nao foram encontradas.");
			}
			for (Categoria categoria : novas) {
				if (!categoria.isAtiva()) {
					throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Apenas categorias ativas podem ser vinculadas a secretaria.");
				}
				categoria.setOrganizacaoResponsavelPadrao(secretaria);
			}
		}

		auditoriaService.registrar(
				TipoAcaoAuditoria.ORGANIZACAO_ATUALIZADA,
				TipoAlvoAuditoria.ORGANIZACAO,
				secretaria.getId(),
				"Categorias atendidas pela secretaria atualizadas.",
				"Categorias ids: " + categoriasIds
		);
		return secretaria;
	}

	@Transactional
	public VinculoUsuarioOrganizacao criarUsuarioInstitucional(Long organizacaoId, UsuarioInstitucionalCreateRequestDTO request) {
		Organizacao organizacao = organizacaoRepository.findById(organizacaoId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organizacao nao encontrada."));
		validarPapelPermitidoNaOrganizacao(organizacao, request.papel());
		validarEmailEUsernameDisponiveis(request.email(), request.username());

		Usuario usuario = new Usuario();
		usuario.setNome(request.nome().trim());
		usuario.setEmail(request.email().trim().toLowerCase());
		usuario.setUsername(request.username().trim().toLowerCase());
		usuario.setSenhaHash(passwordEncoder.encode(request.senha()));
		usuario.setTelefone(request.telefone());
		usuario.setCidade(organizacao.getCidade());
		usuario.setBairro("Institucional");
		usuario.setPerfilGlobal(PerfilUsuario.MORADOR);

		Usuario usuarioSalvo = usuarioRepository.save(usuario);

		VinculoUsuarioOrganizacao vinculo = new VinculoUsuarioOrganizacao();
		vinculo.setUsuario(usuarioSalvo);
		vinculo.setOrganizacao(organizacao);
		vinculo.setPapel(request.papel());
		VinculoUsuarioOrganizacao salvo = vinculoRepository.save(vinculo);
		auditoriaService.registrar(
				TipoAcaoAuditoria.USUARIO_INSTITUCIONAL_CRIADO,
				TipoAlvoAuditoria.VINCULO,
				salvo.getId(),
				"Usuario institucional criado e vinculado.",
				"Usuario id: " + usuarioSalvo.getId() + ", organizacao id: " + organizacao.getId() + ", papel: " + request.papel()
		);
		return salvo;
	}

	private Organizacao buscarPrefeitura(Long prefeituraId) {
		Organizacao prefeitura = organizacaoRepository.findById(prefeituraId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Prefeitura nao encontrada."));
		if (prefeitura.getTipo() != TipoOrganizacao.PREFEITURA) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Organizacao informada nao e uma prefeitura.");
		}
		return prefeitura;
	}

	private Organizacao buscarOrganizacao(Long organizacaoId) {
		return organizacaoRepository.findById(organizacaoId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organizacao nao encontrada."));
	}

	private void validarPapelPermitidoNaOrganizacao(Organizacao organizacao, PapelUsuario papel) {
		if (organizacao.getTipo() == TipoOrganizacao.PREFEITURA && papel != PapelUsuario.ADMIN_PREFEITURA) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Prefeitura aceita apenas ADMIN_PREFEITURA.");
		}
		if (organizacao.getTipo() == TipoOrganizacao.SECRETARIA
				&& papel != PapelUsuario.ADMIN_SECRETARIA
				&& papel != PapelUsuario.ATENDENTE_SECRETARIA) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Secretaria aceita apenas ADMIN_SECRETARIA ou ATENDENTE_SECRETARIA.");
		}
	}

	private void validarEmailEUsernameDisponiveis(String email, String username) {
		if (usuarioRepository.existsByEmail(email.trim().toLowerCase())) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Email ja cadastrado.");
		}
		if (usuarioRepository.existsByUsername(username.trim().toLowerCase())) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Username ja cadastrado.");
		}
	}
}
