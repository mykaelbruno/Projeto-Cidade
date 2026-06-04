package com.mykael.prefeitura.core.comentario;

import java.time.Instant;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ComentarioRepository extends JpaRepository<Comentario, Long> {

	Page<Comentario> findByDenunciaIdAndRemovidoEmIsNull(Long denunciaId, Pageable pageable);

	@Query("""
			select c from Comentario c
			where c.denuncia.id = :denunciaId
			and c.autor.id = :autorId
			and c.removidoEm is null
			and c.criadoEm >= :criadoEm
			""")
	List<Comentario> findRecentesDoAutorNaDenuncia(
			@Param("denunciaId") Long denunciaId,
			@Param("autorId") Long autorId,
			@Param("criadoEm") Instant criadoEm
	);
}
