package com.mykael.prefeitura.core.moderacao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ModeracaoRepository extends JpaRepository<Moderacao, Long> {

	long countByTipoAlvo(TipoAlvoModeracao tipoAlvo);

	long countByTipoAlvoAndAcaoUsuario(TipoAlvoModeracao tipoAlvo, AcaoModeracaoUsuario acaoUsuario);

	Page<Moderacao> findByUsuarioAlvoIdOrderByCriadoEmDesc(Long usuarioAlvoId, Pageable pageable);
}
