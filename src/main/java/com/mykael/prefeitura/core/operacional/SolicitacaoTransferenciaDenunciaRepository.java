package com.mykael.prefeitura.core.operacional;

import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SolicitacaoTransferenciaDenunciaRepository
		extends JpaRepository<SolicitacaoTransferenciaDenuncia, Long> {

	boolean existsByDenunciaIdAndStatus(Long denunciaId, StatusSolicitacaoTransferencia status);

	@Query("""
			select count(s)
			from SolicitacaoTransferenciaDenuncia s
			where s.prefeitura.id = :prefeituraId
			  and s.status = :status
			""")
	long countByPrefeituraIdAndStatus(
			@Param("prefeituraId") Long prefeituraId,
			@Param("status") StatusSolicitacaoTransferencia status
	);

	@Query("""
			select count(s)
			from SolicitacaoTransferenciaDenuncia s
			where s.organizacaoOrigem.id = :organizacaoOrigemId
			  and s.status = :status
			""")
	long countByOrganizacaoOrigemIdAndStatus(
			@Param("organizacaoOrigemId") Long organizacaoOrigemId,
			@Param("status") StatusSolicitacaoTransferencia status
	);

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
