package com.mykael.prefeitura.core.notificacao;

import java.time.Instant;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotificacaoRepository extends JpaRepository<Notificacao, Long> {

	Page<Notificacao> findByUsuarioId(Long usuarioId, Pageable pageable);

	Page<Notificacao> findByUsuarioIdAndLidaEmIsNull(Long usuarioId, Pageable pageable);

	Optional<Notificacao> findByIdAndUsuarioId(Long id, Long usuarioId);

	@Modifying
	@Query("update Notificacao n set n.lidaEm = :lidaEm where n.usuario.id = :usuarioId and n.lidaEm is null")
	int marcarTodasComoLidas(@Param("usuarioId") Long usuarioId, @Param("lidaEm") Instant lidaEm);
}
