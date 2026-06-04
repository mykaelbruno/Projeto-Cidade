package com.mykael.prefeitura.core.painel;

import com.mykael.prefeitura.core.denuncia.StatusDenuncia;
import com.mykael.prefeitura.core.painel.dto.ContadoresDenunciaDTO;
import com.mykael.prefeitura.core.painel.dto.DistribuicaoDenunciaDTO;
import com.mykael.prefeitura.core.painel.dto.IndicadoresOperacionaisDTO;
import jakarta.persistence.EntityManager;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import org.springframework.stereotype.Repository;

@Repository
public class PainelOperacionalRepository {

	private final EntityManager entityManager;

	public PainelOperacionalRepository(EntityManager entityManager) {
		this.entityManager = entityManager;
	}

	public ContadoresDenunciaDTO contarDenunciasDaPrefeitura(Long prefeituraId) {
		return contar(filtroPrefeitura(), prefeituraId);
	}

	public ContadoresDenunciaDTO contarDenunciasDaSecretaria(Long secretariaId) {
		return contar("where d.organizacaoResponsavel.id = :organizacaoId", secretariaId);
	}

	public IndicadoresOperacionaisDTO calcularIndicadoresDaPrefeitura(Long prefeituraId) {
		return calcularIndicadores(filtroPrefeitura(), prefeituraId);
	}

	public IndicadoresOperacionaisDTO calcularIndicadoresDaSecretaria(Long secretariaId) {
		return calcularIndicadores("where d.organizacaoResponsavel.id = :organizacaoId", secretariaId);
	}

	public List<DistribuicaoDenunciaDTO> listarBairrosDaPrefeitura(Long prefeituraId, int limite) {
		return listarDistribuicao(
				"d.bairro",
				filtroPrefeitura(),
				prefeituraId,
				limite
		);
	}

	public List<DistribuicaoDenunciaDTO> listarBairrosDaSecretaria(Long secretariaId, int limite) {
		return listarDistribuicao(
				"d.bairro",
				"where d.organizacaoResponsavel.id = :organizacaoId",
				secretariaId,
				limite
		);
	}

	public List<DistribuicaoDenunciaDTO> listarCategoriasDaPrefeitura(Long prefeituraId, int limite) {
		return listarDistribuicao(
				"d.categoria.nome",
				filtroPrefeitura(),
				prefeituraId,
				limite
		);
	}

	public List<DistribuicaoDenunciaDTO> listarCategoriasDaSecretaria(Long secretariaId, int limite) {
		return listarDistribuicao(
				"d.categoria.nome",
				"where d.organizacaoResponsavel.id = :organizacaoId",
				secretariaId,
				limite
		);
	}

	private ContadoresDenunciaDTO contar(String filtro, Long organizacaoId) {
		Object[] row = (Object[]) entityManager.createQuery("""
				select
					count(d),
					coalesce(sum(case when d.status = :aberto then 1 else 0 end), 0),
					coalesce(sum(case when d.status = :emAnalise then 1 else 0 end), 0),
					coalesce(sum(case when d.status = :encaminhado then 1 else 0 end), 0),
					coalesce(sum(case when d.status = :emAndamento then 1 else 0 end), 0),
					coalesce(sum(case when d.status = :programado then 1 else 0 end), 0),
					coalesce(sum(case when d.status = :concluido and d.conclusaoConfirmadaEm is null then 1 else 0 end), 0),
					coalesce(sum(case when d.status = :concluido and d.conclusaoConfirmadaEm is not null then 1 else 0 end), 0),
					coalesce(sum(case when d.status = :reaberto then 1 else 0 end), 0),
					coalesce(sum(case when d.status = :arquivado then 1 else 0 end), 0)
				from Denuncia d
				""" + filtro)
				.setParameter("organizacaoId", organizacaoId)
				.setParameter("aberto", StatusDenuncia.ABERTO)
				.setParameter("emAnalise", StatusDenuncia.EM_ANALISE)
				.setParameter("encaminhado", StatusDenuncia.ENCAMINHADO)
				.setParameter("emAndamento", StatusDenuncia.EM_ANDAMENTO)
				.setParameter("programado", StatusDenuncia.PROGRAMADO)
				.setParameter("concluido", StatusDenuncia.CONCLUIDO)
				.setParameter("reaberto", StatusDenuncia.REABERTO)
				.setParameter("arquivado", StatusDenuncia.ARQUIVADO)
				.getSingleResult();

		return new ContadoresDenunciaDTO(
				toLong(row[0]),
				toLong(row[1]),
				toLong(row[2]),
				toLong(row[3]),
				toLong(row[4]),
				toLong(row[5]),
				toLong(row[6]),
				toLong(row[7]),
				toLong(row[8]),
				toLong(row[9])
		);
	}

	private IndicadoresOperacionaisDTO calcularIndicadores(String filtro, Long organizacaoId) {
		Object[] row = (Object[]) entityManager.createQuery("""
				select
					count(d),
					coalesce(sum(case when d.conclusaoConfirmadaEm is not null then 1 else 0 end), 0),
					coalesce(sum(case when d.status = :reaberto then 1 else 0 end), 0)
				from Denuncia d
				""" + filtro)
				.setParameter("organizacaoId", organizacaoId)
				.setParameter("reaberto", StatusDenuncia.REABERTO)
				.getSingleResult();

		long total = toLong(row[0]);
		long concluidasConfirmadas = toLong(row[1]);
		long reabertas = toLong(row[2]);

		return new IndicadoresOperacionaisDTO(
				calcularTaxa(concluidasConfirmadas, total),
				calcularTaxa(reabertas, total),
				calcularTempoMedioConfirmacaoHoras(filtro, organizacaoId)
		);
	}

	private Double calcularTempoMedioConfirmacaoHoras(String filtro, Long organizacaoId) {
		List<Object[]> rows = entityManager.createQuery("""
				select d.criadoEm, d.conclusaoConfirmadaEm
				from Denuncia d
				""" + filtro + """
				and d.conclusaoConfirmadaEm is not null
				""", Object[].class)
				.setParameter("organizacaoId", organizacaoId)
				.getResultList();

		if (rows.isEmpty()) {
			return null;
		}

		double mediaHoras = rows.stream()
				.mapToLong(row -> Duration.between((Instant) row[0], (Instant) row[1]).toMinutes())
				.average()
				.orElse(0.0) / 60.0;
		return Math.round(mediaHoras * 100.0) / 100.0;
	}

	private List<DistribuicaoDenunciaDTO> listarDistribuicao(
			String campo,
			String filtro,
			Long organizacaoId,
			int limite
	) {
		List<Object[]> rows = entityManager.createQuery("""
				select %s, count(d)
				from Denuncia d
				%s
				group by %s
				order by count(d) desc, %s asc
				""".formatted(campo, filtro, campo, campo), Object[].class)
				.setParameter("organizacaoId", organizacaoId)
				.setMaxResults(limite)
				.getResultList();

		return rows.stream()
				.map(row -> new DistribuicaoDenunciaDTO((String) row[0], toLong(row[1])))
				.toList();
	}

	private String filtroPrefeitura() {
		return """
				left join d.organizacaoResponsavel organizacao
				left join organizacao.organizacaoPai prefeitura
				where (organizacao.id = :organizacaoId
				or prefeitura.id = :organizacaoId)
				""";
	}

	private double calcularTaxa(long parte, long total) {
		if (total == 0) {
			return 0.0;
		}
		return Math.round(((double) parte * 100.0 / total) * 100.0) / 100.0;
	}

	private long toLong(Object value) {
		return ((Number) value).longValue();
	}
}
