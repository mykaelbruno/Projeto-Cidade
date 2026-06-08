package com.mykael.prefeitura.core.denuncia;

import com.mykael.prefeitura.core.categoria.Categoria;
import com.mykael.prefeitura.core.categoria.CategoriaRepository;
import com.mykael.prefeitura.core.bairro.Bairro;
import com.mykael.prefeitura.core.bairro.BairroRepository;
import com.mykael.prefeitura.core.denuncia.dto.DenunciaCreateRequestDTO;
import com.mykael.prefeitura.core.denuncia.dto.DenunciaSemelhanteResponseDTO;
import com.mykael.prefeitura.core.organizacao.Organizacao;
import com.mykael.prefeitura.core.organizacao.OrganizacaoRepository;
import com.mykael.prefeitura.core.organizacao.TipoOrganizacao;
import com.mykael.prefeitura.core.usuario.Usuario;
import com.mykael.prefeitura.core.usuario.UsuarioRepository;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
public class DenunciaSemelhanteService {

	private static final double RAIO_SEMELHANCA_METROS = 500.0;
	private static final double LIMIAR_TEXTO_SEM_COORDENADA = 0.25;
	private static final int LIMITE_CANDIDATAS = 50;
	private static final int LIMITE_RESPOSTA = 5;

	private final DenunciaRepository denunciaRepository;
	private final CategoriaRepository categoriaRepository;
	private final UsuarioRepository usuarioRepository;
	private final OrganizacaoRepository organizacaoRepository;
	private final BairroRepository bairroRepository;

	public DenunciaSemelhanteService(
			DenunciaRepository denunciaRepository,
			CategoriaRepository categoriaRepository,
			UsuarioRepository usuarioRepository,
			OrganizacaoRepository organizacaoRepository,
			BairroRepository bairroRepository
	) {
		this.denunciaRepository = denunciaRepository;
		this.categoriaRepository = categoriaRepository;
		this.usuarioRepository = usuarioRepository;
		this.organizacaoRepository = organizacaoRepository;
		this.bairroRepository = bairroRepository;
	}

	@Transactional(readOnly = true)
	public List<DenunciaSemelhanteResponseDTO> buscarSemelhantes(DenunciaCreateRequestDTO request, Long autorId) {
		validarCoordenadas(request.latitude(), request.longitude());
		Categoria categoria = categoriaRepository.findById(request.categoriaId())
				.filter(Categoria::isAtiva)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Categoria ativa nao encontrada."));
		LocalizacaoBusca localizacao = validarLocalizacaoDaBusca(request, autorId);

		List<Denuncia> candidatas = denunciaRepository.findCandidatasSemelhantes(
				categoria.getId(),
				localizacao.cidade(),
				localizacao.bairro(),
				statusesAtivos(),
				PageRequest.of(0, LIMITE_CANDIDATAS)
		);

		Set<String> tokensNovos = tokens(request.titulo() + " " + request.descricao());
		String ruaNova = normalizar(request.rua());
		boolean possuiCoordenadaNova = request.latitude() != null && request.longitude() != null;

		return candidatas.stream()
				.map(denuncia -> avaliarCandidata(denuncia, request, tokensNovos, ruaNova, possuiCoordenadaNova))
				.flatMap(Optional::stream)
				.sorted(Comparator
						.comparingInt(DenunciaSemelhanteResponseDTO::pontuacaoSemelhanca).reversed()
						.thenComparing(DenunciaSemelhanteResponseDTO::criadoEm, Comparator.reverseOrder()))
				.limit(LIMITE_RESPOSTA)
				.toList();
	}

	private Optional<DenunciaSemelhanteResponseDTO> avaliarCandidata(
			Denuncia denuncia,
			DenunciaCreateRequestDTO request,
			Set<String> tokensNovos,
			String ruaNova,
			boolean possuiCoordenadaNova
	) {
		Double distanciaMetros = calcularDistanciaQuandoPossivel(request, denuncia);
		boolean possuiCoordenadaCandidata = denuncia.getLatitude() != null && denuncia.getLongitude() != null;
		if (possuiCoordenadaNova && possuiCoordenadaCandidata && distanciaMetros > RAIO_SEMELHANCA_METROS) {
			return Optional.empty();
		}

		Set<String> tokensCandidata = tokens(denuncia.getTitulo() + " " + denuncia.getDescricao());
		double semelhancaTexto = calcularSimilaridade(tokensNovos, tokensCandidata);
		boolean mesmaRua = StringUtils.hasText(ruaNova) && ruaNova.equals(normalizar(denuncia.getRua()));
		if ((!possuiCoordenadaNova || !possuiCoordenadaCandidata)
				&& !mesmaRua
				&& semelhancaTexto < LIMIAR_TEXTO_SEM_COORDENADA) {
			return Optional.empty();
		}

		int percentualTexto = (int) Math.round(semelhancaTexto * 100);
		List<String> motivos = montarMotivos(distanciaMetros, percentualTexto, mesmaRua);
		int pontuacao = calcularPontuacao(distanciaMetros, percentualTexto, mesmaRua, denuncia);

		return Optional.of(DenunciaSemelhanteResponseDTO.from(
				denuncia,
				distanciaMetros == null ? null : Math.round(distanciaMetros * 10.0) / 10.0,
				percentualTexto,
				pontuacao,
				motivos
		));
	}

	private int calcularPontuacao(Double distanciaMetros, int percentualTexto, boolean mesmaRua, Denuncia denuncia) {
		int pontuacao = 35;
		if (distanciaMetros != null) {
			pontuacao += distanciaMetros <= 100 ? 30 : 20;
		}
		if (mesmaRua) {
			pontuacao += 15;
		}
		pontuacao += Math.min(25, percentualTexto / 2);
		pontuacao += Math.min(10, denuncia.getQuantidadeConfirmacoes() + denuncia.getQuantidadeUrgencias());
		return Math.min(100, pontuacao);
	}

	private List<String> montarMotivos(Double distanciaMetros, int percentualTexto, boolean mesmaRua) {
		List<String> motivos = new ArrayList<>();
		motivos.add("Mesma categoria");
		motivos.add("Mesmo bairro");
		motivos.add("Denuncia ainda ativa");
		if (distanciaMetros != null) {
			motivos.add("Localizacao proxima");
		}
		if (mesmaRua) {
			motivos.add("Mesma rua");
		}
		if (percentualTexto >= 25) {
			motivos.add("Texto parecido");
		}
		return motivos;
	}

	private Double calcularDistanciaQuandoPossivel(DenunciaCreateRequestDTO request, Denuncia denuncia) {
		if (request.latitude() == null
				|| request.longitude() == null
				|| denuncia.getLatitude() == null
				|| denuncia.getLongitude() == null) {
			return null;
		}
		return distanciaEmMetros(request.latitude(), request.longitude(), denuncia.getLatitude(), denuncia.getLongitude());
	}

	private double distanciaEmMetros(double latitudeOrigem, double longitudeOrigem, double latitudeDestino, double longitudeDestino) {
		double raioTerraMetros = 6_371_000.0;
		double origemRad = Math.toRadians(latitudeOrigem);
		double destinoRad = Math.toRadians(latitudeDestino);
		double diferencaLatitude = Math.toRadians(latitudeDestino - latitudeOrigem);
		double diferencaLongitude = Math.toRadians(longitudeDestino - longitudeOrigem);
		double a = Math.sin(diferencaLatitude / 2) * Math.sin(diferencaLatitude / 2)
				+ Math.cos(origemRad) * Math.cos(destinoRad)
				* Math.sin(diferencaLongitude / 2) * Math.sin(diferencaLongitude / 2);
		double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		return raioTerraMetros * c;
	}

	private double calcularSimilaridade(Set<String> tokensNovos, Set<String> tokensCandidata) {
		if (tokensNovos.isEmpty() || tokensCandidata.isEmpty()) {
			return 0.0;
		}
		Set<String> intersecao = new HashSet<>(tokensNovos);
		intersecao.retainAll(tokensCandidata);
		Set<String> uniao = new HashSet<>(tokensNovos);
		uniao.addAll(tokensCandidata);
		return (double) intersecao.size() / uniao.size();
	}

	private Set<String> tokens(String texto) {
		String normalizado = normalizar(texto);
		if (!StringUtils.hasText(normalizado)) {
			return Set.of();
		}
		Set<String> tokens = new HashSet<>();
		for (String token : normalizado.split("\\s+")) {
			if (token.length() >= 4) {
				tokens.add(token);
			}
		}
		return tokens;
	}

	private String normalizar(String texto) {
		if (!StringUtils.hasText(texto)) {
			return "";
		}
		String semAcentos = Normalizer.normalize(texto, Normalizer.Form.NFD)
				.replaceAll("\\p{M}", "");
		return semAcentos.toLowerCase(Locale.ROOT)
				.replaceAll("[^a-z0-9 ]", " ")
				.replaceAll("\\s+", " ")
				.trim();
	}

	private List<StatusDenuncia> statusesAtivos() {
		return EnumSet.of(
				StatusDenuncia.ABERTO,
				StatusDenuncia.EM_ANALISE,
				StatusDenuncia.ENCAMINHADO,
				StatusDenuncia.EM_ANDAMENTO,
				StatusDenuncia.PROGRAMADO,
				StatusDenuncia.REABERTO
		).stream().toList();
	}

	private void validarCoordenadas(Double latitude, Double longitude) {
		if ((latitude == null) != (longitude == null)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Latitude e longitude devem ser informadas juntas.");
		}
		if (latitude != null && (latitude < -90 || latitude > 90)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Latitude invalida.");
		}
		if (longitude != null && (longitude < -180 || longitude > 180)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Longitude invalida.");
		}
	}

	private LocalizacaoBusca validarLocalizacaoDaBusca(DenunciaCreateRequestDTO request, Long autorId) {
		Usuario autor = usuarioRepository.findById(autorId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario autenticado nao encontrado."));
		if (!StringUtils.hasText(autor.getCidade())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Usuario nao possui cidade cadastrada.");
		}

		String cidadeUsuario = autor.getCidade().trim();
		Organizacao prefeitura;
		if (request.prefeituraId() != null) {
			prefeitura = organizacaoRepository.findById(request.prefeituraId())
					.filter(Organizacao::isAtiva)
					.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Prefeitura ativa nao encontrada."));
			if (prefeitura.getTipo() != TipoOrganizacao.PREFEITURA) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Organizacao informada nao e uma prefeitura.");
			}
			if (!prefeitura.getCidade().equalsIgnoreCase(cidadeUsuario)) {
				throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Morador so pode buscar denuncias semelhantes da propria cidade.");
			}
		} else {
			if (!StringUtils.hasText(request.cidade()) || !request.cidade().trim().equalsIgnoreCase(cidadeUsuario)) {
				throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Morador so pode buscar denuncias semelhantes da propria cidade.");
			}
			prefeitura = organizacaoRepository.findByTipoAndAtivaTrue(TipoOrganizacao.PREFEITURA)
					.stream()
					.filter(item -> item.getCidade().equalsIgnoreCase(cidadeUsuario))
					.findFirst()
					.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Prefeitura ativa da cidade do morador nao encontrada."));
		}

		Bairro bairro;
		if (request.bairroId() != null) {
			bairro = bairroRepository.findByIdAndPrefeituraIdAndAtivoTrue(request.bairroId(), prefeitura.getId())
					.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bairro ativo nao encontrado nesta prefeitura."));
		} else {
			bairro = bairroRepository.findByPrefeituraIdAndNomeIgnoreCaseAndAtivoTrue(prefeitura.getId(), request.bairro().trim())
					.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bairro ativo nao encontrado nesta prefeitura."));
		}

		return new LocalizacaoBusca(prefeitura.getCidade(), bairro.getNome());
	}

	private record LocalizacaoBusca(String cidade, String bairro) {
	}
}
