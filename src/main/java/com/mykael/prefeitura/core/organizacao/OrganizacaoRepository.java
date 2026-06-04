package com.mykael.prefeitura.core.organizacao;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrganizacaoRepository extends JpaRepository<Organizacao, Long> {
	List<Organizacao> findByTipoAndAtivaTrue(TipoOrganizacao tipo);
	boolean existsByTipoAndCidadeIgnoreCaseAndEstadoIgnoreCase(TipoOrganizacao tipo, String cidade, String estado);
	boolean existsByTipoAndCidadeIgnoreCaseAndEstadoIgnoreCaseAndIdNot(TipoOrganizacao tipo, String cidade, String estado, Long id);
	List<Organizacao> findByOrganizacaoPai(Organizacao organizacaoPai);
}
