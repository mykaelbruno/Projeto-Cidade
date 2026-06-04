package com.mykael.prefeitura.core.sinalizacao;

import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SinalizacaoDenunciaRepository extends JpaRepository<SinalizacaoDenuncia, Long> {

	boolean existsByDenunciaIdAndAutorId(Long denunciaId, Long autorId);

	long countByStatus(StatusSinalizacaoDenuncia status);

	Page<SinalizacaoDenuncia> findByStatus(StatusSinalizacaoDenuncia status, Pageable pageable);

	Optional<SinalizacaoDenuncia> findByIdAndStatus(Long id, StatusSinalizacaoDenuncia status);
}
