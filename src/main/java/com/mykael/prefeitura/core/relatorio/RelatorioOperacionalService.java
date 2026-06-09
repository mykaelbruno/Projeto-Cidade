package com.mykael.prefeitura.core.relatorio;

import com.mykael.prefeitura.core.denuncia.Denuncia;
import com.mykael.prefeitura.core.denuncia.StatusDenuncia;
import com.mykael.prefeitura.core.organizacao.Organizacao;
import com.mykael.prefeitura.core.organizacao.OrganizacaoRepository;
import com.mykael.prefeitura.core.organizacao.TipoOrganizacao;
import com.mykael.prefeitura.core.relatorio.dto.RelatorioCsvResponseDTO;
import com.mykael.prefeitura.core.vinculo.PapelUsuario;
import com.mykael.prefeitura.core.vinculo.VinculoUsuarioOrganizacaoRepository;
import java.nio.charset.StandardCharsets;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class RelatorioOperacionalService {

	private static final int LIMITE_LINHAS_CSV = 5_000;
	private static final String SEPARADOR = ";";
	private static final DateTimeFormatter FORMATADOR_DATA = DateTimeFormatter
			.ofPattern("yyyy-MM-dd HH:mm:ss")
			.withZone(ZoneId.of("America/Sao_Paulo"));

	private final OrganizacaoRepository organizacaoRepository;
	private final VinculoUsuarioOrganizacaoRepository vinculoRepository;
	private final RelatorioDenunciaRepository relatorioDenunciaRepository;

	public RelatorioOperacionalService(
			OrganizacaoRepository organizacaoRepository,
			VinculoUsuarioOrganizacaoRepository vinculoRepository,
			RelatorioDenunciaRepository relatorioDenunciaRepository
	) {
		this.organizacaoRepository = organizacaoRepository;
		this.vinculoRepository = vinculoRepository;
		this.relatorioDenunciaRepository = relatorioDenunciaRepository;
	}

	@Transactional(readOnly = true)
	public RelatorioCsvResponseDTO exportarDenunciasCsv(
			Long organizacaoId,
			Long usuarioId,
			String cidade,
			String bairro,
			StatusDenuncia status,
			Long categoriaId
	) {
		Organizacao organizacao = buscarOrganizacaoAtiva(organizacaoId);
		List<Denuncia> denuncias;
		if (organizacao.getTipo() == TipoOrganizacao.PREFEITURA) {
			exigirAdminPrefeitura(usuarioId, organizacao.getId());
			denuncias = relatorioDenunciaRepository.listarDenunciasDaPrefeitura(
					organizacao.getId(),
					cidade,
					bairro,
					status,
					categoriaId,
					LIMITE_LINHAS_CSV
			);
		} else {
			exigirVinculoAtivo(usuarioId, organizacao.getId());
			denuncias = relatorioDenunciaRepository.listarDenunciasDaSecretaria(
					organizacao.getId(),
					cidade,
					bairro,
					status,
					categoriaId,
					LIMITE_LINHAS_CSV
			);
		}

		return new RelatorioCsvResponseDTO(
				montarNomeArquivo(organizacao),
				gerarCsv(denuncias).getBytes(StandardCharsets.UTF_8)
		);
	}

	private String gerarCsv(List<Denuncia> denuncias) {
		StringBuilder csv = new StringBuilder();
		adicionarLinha(csv, List.of(
				"id",
				"titulo",
				"status",
				"categoria",
				"cidade",
				"bairro",
				"rua",
				"ponto_referencia",
				"organizacao_responsavel",
				"anonima",
				"confirmacoes",
				"urgencias",
				"comentarios",
				"criado_em",
				"atualizado_em"
		));

		for (Denuncia denuncia : denuncias) {
			adicionarLinha(csv, Arrays.asList(
					denuncia.getId(),
					denuncia.getTitulo(),
					denuncia.getStatus(),
					denuncia.getCategoria().getNome(),
					denuncia.getCidade(),
					denuncia.getBairro(),
					denuncia.getRua(),
					denuncia.getPontoReferencia(),
					denuncia.getOrganizacaoResponsavel() == null ? "" : denuncia.getOrganizacaoResponsavel().getNome(),
					denuncia.isAnonima() ? "sim" : "nao",
					denuncia.getQuantidadeConfirmacoes(),
					denuncia.getQuantidadeUrgencias(),
					denuncia.getQuantidadeComentarios(),
					FORMATADOR_DATA.format(denuncia.getCriadoEm()),
					FORMATADOR_DATA.format(denuncia.getAtualizadoEm())
			));
		}

		return csv.toString();
	}

	private void adicionarLinha(StringBuilder csv, List<?> valores) {
		for (int i = 0; i < valores.size(); i++) {
			if (i > 0) {
				csv.append(SEPARADOR);
			}
			csv.append(escaparCsv(valores.get(i)));
		}
		csv.append("\r\n");
	}

	private String escaparCsv(Object valor) {
		if (valor == null) {
			return "";
		}
		String texto = valor.toString();
		boolean precisaAspas = texto.contains(SEPARADOR)
				|| texto.contains("\"")
				|| texto.contains("\n")
				|| texto.contains("\r");
		String escapado = texto.replace("\"", "\"\"");
		return precisaAspas ? "\"" + escapado + "\"" : escapado;
	}

	private String montarNomeArquivo(Organizacao organizacao) {
		String nomeNormalizado = organizacao.getNome()
				.toLowerCase()
				.replaceAll("[^a-z0-9]+", "-")
				.replaceAll("(^-|-$)", "");
		return "denuncias-" + nomeNormalizado + ".csv";
	}

	private Organizacao buscarOrganizacaoAtiva(Long organizacaoId) {
		return organizacaoRepository.findById(organizacaoId)
				.filter(Organizacao::isAtiva)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organizacao ativa nao encontrada."));
	}

	private void exigirAdminPrefeitura(Long usuarioId, Long prefeituraId) {
		boolean possuiVinculo = vinculoRepository.existsByUsuarioIdAndOrganizacaoIdAndPapelAndAtivoTrue(
				usuarioId,
				prefeituraId,
				PapelUsuario.PREFEITURA
		);
		if (!possuiVinculo) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Usuario nao possui permissao sobre esta prefeitura.");
		}
	}

	private void exigirVinculoAtivo(Long usuarioId, Long organizacaoId) {
		if (!vinculoRepository.existsByUsuarioIdAndOrganizacaoIdAndAtivoTrue(usuarioId, organizacaoId)) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Usuario nao possui vinculo ativo com a organizacao informada.");
		}
	}
}
