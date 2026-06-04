package com.mykael.prefeitura.core.feed;

import com.mykael.prefeitura.core.denuncia.Denuncia;
import com.mykael.prefeitura.core.denuncia.StatusDenuncia;
import java.time.Instant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

public interface FeedDenunciaRepository extends Repository<Denuncia, Long> {

	@Query(value = """
			select d from Denuncia d
			where (:cidade is null or lower(d.cidade) = :cidade)
			and (:bairro is null or lower(d.bairro) = :bairro)
			and (:status is null or d.status = :status)
			and (:status is not null or d.status <> :statusArquivado)
			and (:status is not null or d.conclusaoConfirmadaEm is null)
			and (:categoriaId is null or d.categoria.id = :categoriaId)
			and (:autorExcluidoId is null or d.autor.id <> :autorExcluidoId)
			and (:termo is null or (
				lower(d.titulo) like :termo
				or lower(d.descricao) like :termo
				or lower(d.cidade) like :termo
				or lower(d.bairro) like :termo
				or lower(d.rua) like :termo
				or lower(d.pontoReferencia) like :termo
				or lower(d.categoria.nome) like :termo
			))
			order by d.criadoEm desc, d.id desc
			""", countQuery = """
			select count(d) from Denuncia d
			where (:cidade is null or lower(d.cidade) = :cidade)
			and (:bairro is null or lower(d.bairro) = :bairro)
			and (:status is null or d.status = :status)
			and (:status is not null or d.status <> :statusArquivado)
			and (:status is not null or d.conclusaoConfirmadaEm is null)
			and (:categoriaId is null or d.categoria.id = :categoriaId)
			and (:autorExcluidoId is null or d.autor.id <> :autorExcluidoId)
			and (:termo is null or (
				lower(d.titulo) like :termo
				or lower(d.descricao) like :termo
				or lower(d.cidade) like :termo
				or lower(d.bairro) like :termo
				or lower(d.rua) like :termo
				or lower(d.pontoReferencia) like :termo
				or lower(d.categoria.nome) like :termo
			))
			""")
	Page<Denuncia> buscarRecentes(
			@Param("cidade") String cidade,
			@Param("bairro") String bairro,
			@Param("status") StatusDenuncia status,
			@Param("statusArquivado") StatusDenuncia statusArquivado,
			@Param("categoriaId") Long categoriaId,
			@Param("autorExcluidoId") Long autorExcluidoId,
			@Param("termo") String termo,
			Pageable pageable
	);

	@Query(value = """
			select d from Denuncia d
			where (:cidade is null or lower(d.cidade) = :cidade)
			and (:bairro is null or lower(d.bairro) = :bairro)
			and (:status is null or d.status = :status)
			and (:status is not null or d.status <> :statusArquivado)
			and (:status is not null or d.conclusaoConfirmadaEm is null)
			and (:categoriaId is null or d.categoria.id = :categoriaId)
			and (:autorExcluidoId is null or d.autor.id <> :autorExcluidoId)
			and (:termo is null or (
				lower(d.titulo) like :termo
				or lower(d.descricao) like :termo
				or lower(d.cidade) like :termo
				or lower(d.bairro) like :termo
				or lower(d.rua) like :termo
				or lower(d.pontoReferencia) like :termo
				or lower(d.categoria.nome) like :termo
			))
			order by d.pontuacaoRelevancia desc, d.criadoEm desc, d.id desc
			""", countQuery = """
			select count(d) from Denuncia d
			where (:cidade is null or lower(d.cidade) = :cidade)
			and (:bairro is null or lower(d.bairro) = :bairro)
			and (:status is null or d.status = :status)
			and (:status is not null or d.status <> :statusArquivado)
			and (:status is not null or d.conclusaoConfirmadaEm is null)
			and (:categoriaId is null or d.categoria.id = :categoriaId)
			and (:autorExcluidoId is null or d.autor.id <> :autorExcluidoId)
			and (:termo is null or (
				lower(d.titulo) like :termo
				or lower(d.descricao) like :termo
				or lower(d.cidade) like :termo
				or lower(d.bairro) like :termo
				or lower(d.rua) like :termo
				or lower(d.pontoReferencia) like :termo
				or lower(d.categoria.nome) like :termo
			))
			""")
	Page<Denuncia> buscarEmAlta(
			@Param("cidade") String cidade,
			@Param("bairro") String bairro,
			@Param("status") StatusDenuncia status,
			@Param("statusArquivado") StatusDenuncia statusArquivado,
			@Param("categoriaId") Long categoriaId,
			@Param("autorExcluidoId") Long autorExcluidoId,
			@Param("termo") String termo,
			Pageable pageable
	);

	@Query(value = """
			select d from Denuncia d
			where (:cidade is null or lower(d.cidade) = :cidade)
			and (:bairro is null or lower(d.bairro) = :bairro)
			and (:status is null or d.status = :status)
			and (:status is not null or d.status <> :statusArquivado)
			and (:status is not null or d.conclusaoConfirmadaEm is null)
			and (:categoriaId is null or d.categoria.id = :categoriaId)
			and (:autorExcluidoId is null or d.autor.id <> :autorExcluidoId)
			and (:termo is null or (
				lower(d.titulo) like :termo
				or lower(d.descricao) like :termo
				or lower(d.cidade) like :termo
				or lower(d.bairro) like :termo
				or lower(d.rua) like :termo
				or lower(d.pontoReferencia) like :termo
				or lower(d.categoria.nome) like :termo
			))
			order by (
				case when d.pontuacaoRelevancia > 30 then 30 else d.pontuacaoRelevancia end
				+
				case
					when d.criadoEm >= :limiteSeisHoras then 20
					when d.criadoEm >= :limiteVinteQuatroHoras then 15
					when d.criadoEm >= :limiteSetentaDuasHoras then 10
					when d.criadoEm >= :limiteSeteDias then 5
					else 0
				end
			) desc, d.criadoEm desc, d.id desc
			""", countQuery = """
			select count(d) from Denuncia d
			where (:cidade is null or lower(d.cidade) = :cidade)
			and (:bairro is null or lower(d.bairro) = :bairro)
			and (:status is null or d.status = :status)
			and (:status is not null or d.status <> :statusArquivado)
			and (:status is not null or d.conclusaoConfirmadaEm is null)
			and (:categoriaId is null or d.categoria.id = :categoriaId)
			and (:autorExcluidoId is null or d.autor.id <> :autorExcluidoId)
			and (:termo is null or (
				lower(d.titulo) like :termo
				or lower(d.descricao) like :termo
				or lower(d.cidade) like :termo
				or lower(d.bairro) like :termo
				or lower(d.rua) like :termo
				or lower(d.pontoReferencia) like :termo
				or lower(d.categoria.nome) like :termo
			))
			""")
	Page<Denuncia> buscarMisto(
			@Param("cidade") String cidade,
			@Param("bairro") String bairro,
			@Param("status") StatusDenuncia status,
			@Param("statusArquivado") StatusDenuncia statusArquivado,
			@Param("categoriaId") Long categoriaId,
			@Param("autorExcluidoId") Long autorExcluidoId,
			@Param("termo") String termo,
			@Param("limiteSeisHoras") Instant limiteSeisHoras,
			@Param("limiteVinteQuatroHoras") Instant limiteVinteQuatroHoras,
			@Param("limiteSetentaDuasHoras") Instant limiteSetentaDuasHoras,
			@Param("limiteSeteDias") Instant limiteSeteDias,
			Pageable pageable
	);
}
