package com.mykael.prefeitura.core.interacao;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InteracaoDenunciaRepository extends JpaRepository<InteracaoDenuncia, Long> {

	Optional<InteracaoDenuncia> findByDenunciaIdAndUsuarioIdAndTipo(
			Long denunciaId,
			Long usuarioId,
			TipoInteracaoDenuncia tipo
	);

	boolean existsByDenunciaIdAndUsuarioIdAndTipo(Long denunciaId, Long usuarioId, TipoInteracaoDenuncia tipo);
}
