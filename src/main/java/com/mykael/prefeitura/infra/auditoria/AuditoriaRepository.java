package com.mykael.prefeitura.infra.auditoria;

import java.time.Instant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface AuditoriaRepository extends JpaRepository<Auditoria, Long>, JpaSpecificationExecutor<Auditoria> {

	@Modifying
	@Query("delete from Auditoria a where a.criadoEm < :limite")
	void deletarLogsAntigos(Instant limite);
}
