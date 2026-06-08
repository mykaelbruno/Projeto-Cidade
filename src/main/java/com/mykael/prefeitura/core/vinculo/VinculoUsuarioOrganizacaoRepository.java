package com.mykael.prefeitura.core.vinculo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import java.util.List;

public interface VinculoUsuarioOrganizacaoRepository extends JpaRepository<VinculoUsuarioOrganizacao, Long> {

	@Override
	@EntityGraph(attributePaths = {"usuario", "organizacao"})
	List<VinculoUsuarioOrganizacao> findAll();

	@EntityGraph(attributePaths = {"usuario", "organizacao"})
	List<VinculoUsuarioOrganizacao> findByUsuarioIdAndAtivoTrue(Long usuarioId);

	@EntityGraph(attributePaths = {"usuario", "organizacao"})
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
