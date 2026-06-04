package com.mykael.prefeitura.core.denuncia;

import java.time.Instant;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DenunciaRepository extends JpaRepository<Denuncia, Long>, JpaSpecificationExecutor<Denuncia> {

	Page<Denuncia> findByOrganizacaoResponsavelId(Long organizacaoResponsavelId, Pageable pageable);

	@Query("""
			select d from Denuncia d
			where d.autor.id = :autorId
			and d.categoria.id = :categoriaId
			and lower(d.cidade) = lower(:cidade)
			and lower(d.bairro) = lower(:bairro)
			and d.criadoEm >= :criadoEm
			""")
	List<Denuncia> findRecentesParaAntispam(
			@Param("autorId") Long autorId,
			@Param("categoriaId") Long categoriaId,
			@Param("cidade") String cidade,
			@Param("bairro") String bairro,
			@Param("criadoEm") Instant criadoEm
	);

	@Query("""
			select d from Denuncia d
			where d.categoria.id = :categoriaId
			and lower(d.cidade) = lower(:cidade)
			and lower(d.bairro) = lower(:bairro)
			and d.status in :statusesAtivos
			order by d.criadoEm desc
			""")
	List<Denuncia> findCandidatasSemelhantes(
			@Param("categoriaId") Long categoriaId,
			@Param("cidade") String cidade,
			@Param("bairro") String bairro,
			@Param("statusesAtivos") List<StatusDenuncia> statusesAtivos,
			Pageable pageable
	);

	@Query(value = """
			select d from Denuncia d
			left join d.organizacaoResponsavel organizacao
			left join organizacao.organizacaoPai prefeitura
			where organizacao.id = :prefeituraId
			or prefeitura.id = :prefeituraId
			""", countQuery = """
			select count(d) from Denuncia d
			left join d.organizacaoResponsavel organizacao
			left join organizacao.organizacaoPai prefeitura
			where organizacao.id = :prefeituraId
			or prefeitura.id = :prefeituraId
			""")
	Page<Denuncia> findAcessiveisPorPrefeitura(@Param("prefeituraId") Long prefeituraId, Pageable pageable);
}
