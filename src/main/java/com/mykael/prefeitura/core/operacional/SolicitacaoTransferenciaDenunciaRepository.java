package com.mykael.prefeitura.core.operacional;

import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SolicitacaoTransferenciaDenunciaRepository
		extends JpaRepository<SolicitacaoTransferenciaDenuncia, Long> {

	boolean existsByDenunciaIdAndStatus(Long denunciaId, StatusSolicitacaoTransferencia status);

	long countByPrefeituraIdAndStatus(Long prefeituraId, StatusSolicitacaoTransferencia status);

	long countByOrganizacaoOrigemIdAndStatus(Long organizacaoOrigemId, StatusSolicitacaoTransferencia status);

	Page<SolicitacaoTransferenciaDenuncia> findByPrefeituraIdAndStatus(
			Long prefeituraId,
			StatusSolicitacaoTransferencia status,
			Pageable pageable
	);

	Optional<SolicitacaoTransferenciaDenuncia> findByIdAndStatus(
			Long id,
			StatusSolicitacaoTransferencia status
	);
}
