package com.mykael.prefeitura.core.painel.dto;

import com.mykael.prefeitura.core.organizacao.TipoOrganizacao;
import java.util.List;

public record PainelOperacionalResumoDTO(
		Long organizacaoId,
		String organizacaoNome,
		TipoOrganizacao tipoOrganizacao,
		ContadoresDenunciaDTO denuncias,
		long transferenciasPendentes,
		IndicadoresOperacionaisDTO indicadores,
		List<DistribuicaoDenunciaDTO> bairrosMaisDemandados,
		List<DistribuicaoDenunciaDTO> categoriasMaisDemandadas
) {
}
