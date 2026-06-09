package com.mykael.prefeitura.core.painel;

import com.mykael.prefeitura.core.moderacao.AcaoModeracaoUsuario;
import com.mykael.prefeitura.core.moderacao.ModeracaoRepository;
import com.mykael.prefeitura.core.moderacao.TipoAlvoModeracao;
import com.mykael.prefeitura.core.operacional.SolicitacaoTransferenciaDenunciaRepository;
import com.mykael.prefeitura.core.operacional.StatusSolicitacaoTransferencia;
import com.mykael.prefeitura.core.organizacao.Organizacao;
import com.mykael.prefeitura.core.organizacao.OrganizacaoRepository;
import com.mykael.prefeitura.core.organizacao.TipoOrganizacao;
import com.mykael.prefeitura.core.painel.dto.ContadoresDenunciaDTO;
import com.mykael.prefeitura.core.painel.dto.DistribuicaoDenunciaDTO;
import com.mykael.prefeitura.core.painel.dto.IndicadoresOperacionaisDTO;
import com.mykael.prefeitura.core.painel.dto.PainelModeracaoResumoDTO;
import com.mykael.prefeitura.core.painel.dto.PainelOperacionalResumoDTO;
import com.mykael.prefeitura.core.sinalizacao.SinalizacaoDenunciaRepository;
import com.mykael.prefeitura.core.sinalizacao.StatusSinalizacaoDenuncia;
import com.mykael.prefeitura.core.vinculo.PapelUsuario;
import com.mykael.prefeitura.core.vinculo.VinculoUsuarioOrganizacaoRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PainelService {

	private static final int LIMITE_DISTRIBUICOES = 5;

	private final OrganizacaoRepository organizacaoRepository;
	private final VinculoUsuarioOrganizacaoRepository vinculoRepository;
	private final PainelOperacionalRepository painelOperacionalRepository;
	private final SolicitacaoTransferenciaDenunciaRepository solicitacaoTransferenciaRepository;
	private final SinalizacaoDenunciaRepository sinalizacaoDenunciaRepository;
	private final ModeracaoRepository moderacaoRepository;

	public PainelService(
			OrganizacaoRepository organizacaoRepository,
			VinculoUsuarioOrganizacaoRepository vinculoRepository,
			PainelOperacionalRepository painelOperacionalRepository,
			SolicitacaoTransferenciaDenunciaRepository solicitacaoTransferenciaRepository,
			SinalizacaoDenunciaRepository sinalizacaoDenunciaRepository,
			ModeracaoRepository moderacaoRepository
	) {
		this.organizacaoRepository = organizacaoRepository;
		this.vinculoRepository = vinculoRepository;
		this.painelOperacionalRepository = painelOperacionalRepository;
		this.solicitacaoTransferenciaRepository = solicitacaoTransferenciaRepository;
		this.sinalizacaoDenunciaRepository = sinalizacaoDenunciaRepository;
		this.moderacaoRepository = moderacaoRepository;
	}

	@Transactional(readOnly = true)
	public PainelOperacionalResumoDTO gerarResumoOperacional(Long organizacaoId, Long usuarioId) {
		Organizacao organizacao = buscarOrganizacaoAtiva(organizacaoId);

		ContadoresDenunciaDTO denuncias;
		long transferenciasPendentes;
		IndicadoresOperacionaisDTO indicadores;
		List<DistribuicaoDenunciaDTO> bairrosMaisDemandados;
		List<DistribuicaoDenunciaDTO> categoriasMaisDemandadas;
		if (organizacao.getTipo() == TipoOrganizacao.PREFEITURA) {
			exigirAdminPrefeitura(usuarioId, organizacao.getId());
			denuncias = painelOperacionalRepository.contarDenunciasDaPrefeitura(organizacao.getId());
			indicadores = painelOperacionalRepository.calcularIndicadoresDaPrefeitura(organizacao.getId());
			bairrosMaisDemandados = painelOperacionalRepository.listarBairrosDaPrefeitura(organizacao.getId(), LIMITE_DISTRIBUICOES);
			categoriasMaisDemandadas = painelOperacionalRepository.listarCategoriasDaPrefeitura(organizacao.getId(), LIMITE_DISTRIBUICOES);
			transferenciasPendentes = solicitacaoTransferenciaRepository.countByPrefeituraIdAndStatus(
					organizacao.getId(),
					StatusSolicitacaoTransferencia.PENDENTE
			);
		} else {
			exigirVinculoAtivo(usuarioId, organizacao.getId());
			denuncias = painelOperacionalRepository.contarDenunciasDaSecretaria(organizacao.getId());
			indicadores = painelOperacionalRepository.calcularIndicadoresDaSecretaria(organizacao.getId());
			bairrosMaisDemandados = painelOperacionalRepository.listarBairrosDaSecretaria(organizacao.getId(), LIMITE_DISTRIBUICOES);
			categoriasMaisDemandadas = painelOperacionalRepository.listarCategoriasDaSecretaria(organizacao.getId(), LIMITE_DISTRIBUICOES);
			transferenciasPendentes = solicitacaoTransferenciaRepository.countByOrganizacaoOrigemIdAndStatus(
					organizacao.getId(),
					StatusSolicitacaoTransferencia.PENDENTE
			);
		}

		return new PainelOperacionalResumoDTO(
				organizacao.getId(),
				organizacao.getNome(),
				organizacao.getTipo(),
				denuncias,
				transferenciasPendentes,
				indicadores,
				bairrosMaisDemandados,
				categoriasMaisDemandadas
		);
	}

	@Transactional(readOnly = true)
	public PainelModeracaoResumoDTO gerarResumoModeracao() {
		return new PainelModeracaoResumoDTO(
				sinalizacaoDenunciaRepository.countByStatus(StatusSinalizacaoDenuncia.PENDENTE),
				sinalizacaoDenunciaRepository.countByStatus(StatusSinalizacaoDenuncia.ANALISADA),
				moderacaoRepository.countByTipoAlvo(TipoAlvoModeracao.DENUNCIA),
				moderacaoRepository.countByTipoAlvo(TipoAlvoModeracao.COMENTARIO),
				moderacaoRepository.countByTipoAlvoAndAcaoUsuario(TipoAlvoModeracao.USUARIO, AcaoModeracaoUsuario.ADVERTENCIA),
				moderacaoRepository.countByTipoAlvoAndAcaoUsuario(TipoAlvoModeracao.USUARIO, AcaoModeracaoUsuario.SUSPENSAO),
				moderacaoRepository.countByTipoAlvoAndAcaoUsuario(TipoAlvoModeracao.USUARIO, AcaoModeracaoUsuario.REATIVACAO)
		);
	}

	private Organizacao buscarOrganizacaoAtiva(Long organizacaoId) {
		return organizacaoRepository.findById(organizacaoId)
				.filter(Organizacao::isAtiva)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organizacao ativa nao encontrada."));
	}

	private void exigirAdminPrefeitura(Long usuarioId, Long prefeituraId) {
		boolean possuiVinculo = vinculoRepository.existsByUsuarioIdAndOrganizacaoIdAndPapelAndAtivoTrue(
				usuarioId,
				prefeituraId,
				PapelUsuario.PREFEITURA
		);
		if (!possuiVinculo) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Usuario nao possui permissao sobre esta prefeitura.");
		}
	}

	private void exigirVinculoAtivo(Long usuarioId, Long organizacaoId) {
		if (!vinculoRepository.existsByUsuarioIdAndOrganizacaoIdAndAtivoTrue(usuarioId, organizacaoId)) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Usuario nao possui vinculo ativo com a organizacao informada.");
		}
	}
}
