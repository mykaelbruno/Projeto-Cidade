package com.mykael.prefeitura.core.vinculo;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VinculoUsuarioOrganizacaoRepository extends JpaRepository<VinculoUsuarioOrganizacao, Long> {

	List<VinculoUsuarioOrganizacao> findByUsuarioIdAndAtivoTrue(Long usuarioId);

	List<VinculoUsuarioOrganizacao> findByOrganizacaoIdAndAtivoTrue(Long organizacaoId);

	boolean existsByUsuarioIdAndOrganizacaoIdAndPapelAndAtivoTrue(
			Long usuarioId,
			Long organizacaoId,
			PapelUsuario papel
	);

	boolean existsByUsuarioIdAndOrganizacaoIdAndPapel(
			Long usuarioId,
			Long organizacaoId,
			PapelUsuario papel
	);

	boolean existsByUsuarioIdAndOrganizacaoIdAndAtivoTrue(Long usuarioId, Long organizacaoId);
}
