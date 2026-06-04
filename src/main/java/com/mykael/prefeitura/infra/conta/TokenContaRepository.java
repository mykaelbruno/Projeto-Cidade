package com.mykael.prefeitura.infra.conta;

import java.time.Instant;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface TokenContaRepository extends JpaRepository<TokenConta, Long> {

	Optional<TokenConta> findByTokenHashAndTipo(String tokenHash, TipoTokenConta tipo);

	@Modifying
	@Query("delete from TokenConta t where t.expiraEm < :agora or t.usadoEm is not null")
	void deletarExpiradosOuUsados(Instant agora);
}
