package com.mykael.prefeitura.core.relatorio;

import com.mykael.prefeitura.core.denuncia.Denuncia;
import com.mykael.prefeitura.core.denuncia.StatusDenuncia;
import jakarta.persistence.EntityManager;
import java.util.List;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

@Repository
public class RelatorioDenunciaRepository {

	private final EntityManager entityManager;

	public RelatorioDenunciaRepository(EntityManager entityManager) {
		this.entityManager = entityManager;
	}

	public List<Denuncia> listarDenunciasDaPrefeitura(
			Long prefeituraId,
			String cidade,
			String bairro,
			StatusDenuncia status,
			Long categoriaId,
			int limite
	) {
		return listar(
				"""
				left join d.organizacaoResponsavel organizacao
				left join organizacao.organizacaoPai prefeitura
				where (organizacao.id = :organizacaoId
				or prefeitura.id = :organizacaoId)
				""",
				prefeituraId,
				cidade,
				bairro,
				status,
				categoriaId,
				limite
		);
	}

	public List<Denuncia> listarDenunciasDaSecretaria(
			Long secretariaId,
			String cidade,
			String bairro,
			StatusDenuncia status,
			Long categoriaId,
			int limite
	) {
		return listar(
				"where d.organizacaoResponsavel.id = :organizacaoId",
				secretariaId,
				cidade,
				bairro,
				status,
				categoriaId,
				limite
		);
	}

	private List<Denuncia> listar(
			String filtroEscopo,
			Long organizacaoId,
			String cidade,
			String bairro,
			StatusDenuncia status,
			Long categoriaId,
			int limite
	) {
		StringBuilder jpql = new StringBuilder("""
				select d
				from Denuncia d
				""").append(filtroEscopo);

		if (StringUtils.hasText(cidade)) {
			jpql.append(" and lower(d.cidade) = :cidade");
		}
		if (StringUtils.hasText(bairro)) {
			jpql.append(" and lower(d.bairro) = :bairro");
		}
		if (status != null) {
			jpql.append(" and d.status = :status");
		}
		if (categoriaId != null) {
			jpql.append(" and d.categoria.id = :categoriaId");
		}
		jpql.append(" order by d.criadoEm desc, d.id desc");

		var query = entityManager.createQuery(jpql.toString(), Denuncia.class)
				.setParameter("organizacaoId", organizacaoId)
				.setMaxResults(limite);

		if (StringUtils.hasText(cidade)) {
			query.setParameter("cidade", cidade.trim().toLowerCase());
		}
		if (StringUtils.hasText(bairro)) {
			query.setParameter("bairro", bairro.trim().toLowerCase());
		}
		if (status != null) {
			query.setParameter("status", status);
		}
		if (categoriaId != null) {
			query.setParameter("categoriaId", categoriaId);
		}

		return query.getResultList();
	}
}
