package com.mykael.prefeitura.core.anexo;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AnexoDenunciaRepository extends JpaRepository<AnexoDenuncia, Long> {

	interface CapaDenunciaProjection {
		Long getDenunciaId();
		Long getAnexoId();
	}

	Page<AnexoDenuncia> findByDenunciaId(Long denunciaId, Pageable pageable);

	Optional<AnexoDenuncia> findByIdAndDenunciaId(Long id, Long denunciaId);

	boolean existsByNomeArmazenado(String nomeArmazenado);

	@Query("""
			select a.denuncia.id as denunciaId, a.id as anexoId
			from AnexoDenuncia a
			where a.denuncia.id in :denunciasIds
			and lower(a.contentType) like 'image/%'
			and a.id = (
				select min(a2.id)
				from AnexoDenuncia a2
				where a2.denuncia.id = a.denuncia.id
				and lower(a2.contentType) like 'image/%'
			)
			""")
	List<CapaDenunciaProjection> buscarCapasPorDenunciasIds(@Param("denunciasIds") Collection<Long> denunciasIds);
}
