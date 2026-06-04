package com.mykael.prefeitura.core.timeline;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TimelineDenunciaRepository extends JpaRepository<TimelineDenuncia, Long> {

	Page<TimelineDenuncia> findByDenunciaId(Long denunciaId, Pageable pageable);
}
