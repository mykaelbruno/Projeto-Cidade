package com.mykael.prefeitura.infra.cleanup;

import com.mykael.prefeitura.core.anexo.AnexoDenunciaRepository;
import com.mykael.prefeitura.infra.auditoria.AuditoriaRepository;
import com.mykael.prefeitura.infra.auth.token.RefreshTokenRepository;
import com.mykael.prefeitura.infra.conta.TokenContaRepository;
import com.mykael.prefeitura.infra.storage.StorageProperties;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.stream.Stream;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class LimpezaDadosScheduler {

	private static final Logger log = LoggerFactory.getLogger(LimpezaDadosScheduler.class);

	private final RefreshTokenRepository refreshTokenRepository;
	private final TokenContaRepository tokenContaRepository;
	private final AuditoriaRepository auditoriaRepository;
	private final AnexoDenunciaRepository anexoDenunciaRepository;
	private final StorageProperties storageProperties;

	public LimpezaDadosScheduler(
			RefreshTokenRepository refreshTokenRepository,
			TokenContaRepository tokenContaRepository,
			AuditoriaRepository auditoriaRepository,
			AnexoDenunciaRepository anexoDenunciaRepository,
			StorageProperties storageProperties
	) {
		this.refreshTokenRepository = refreshTokenRepository;
		this.tokenContaRepository = tokenContaRepository;
		this.auditoriaRepository = auditoriaRepository;
		this.anexoDenunciaRepository = anexoDenunciaRepository;
		this.storageProperties = storageProperties;
	}

	/**
	 * Executa a rotina de limpeza e manutenção de dados técnicos diariamente.
	 * Padrão: 3:00 AM todos os dias.
	 */
	@Scheduled(cron = "${app.cleanup.cron:0 0 3 * * ?}")
	@Transactional
	public void executarLimpezaManutencao() {
		log.info("Iniciando rotina automatica de limpeza e manutencao do sistema...");
		Instant agora = Instant.now();

		try {
			// 1. Limpar Refresh Tokens expirados ou revogados
			refreshTokenRepository.deletarExpiradosOuRevogados(agora);
			log.info("Expurgados refresh tokens expirados e/ou revogados com sucesso.");
		} catch (Exception e) {
			log.error("Falha ao expurgar refresh tokens.", e);
		}

		try {
			// 2. Limpar Tokens de Confirmação/Recuperação de Conta antigos/usados
			tokenContaRepository.deletarExpiradosOuUsados(agora);
			log.info("Expurgados tokens de conta expirados e/ou utilizados com sucesso.");
		} catch (Exception e) {
			log.error("Falha ao expurgar tokens de conta.", e);
		}

		try {
			// 3. Pruning de Logs de Auditoria antigos (mais de 30 dias por padrão)
			Instant limiteLogs = agora.minus(30, ChronoUnit.DAYS);
			auditoriaRepository.deletarLogsAntigos(limiteLogs);
			log.info("Expurgados logs de auditoria antigos (anteriores a {}).", limiteLogs);
		} catch (Exception e) {
			log.error("Falha ao expurgar logs antigos de auditoria.", e);
		}

		try {
			// 4. Varredura física e remoção de arquivos órfãos no disco
			varrerERemoverAnexosOrfaosFisicos();
		} catch (Exception e) {
			log.error("Falha na varredura de arquivos orfaos no disco.", e);
		}

		log.info("Rotina automatica de limpeza concluida com sucesso.");
	}

	private void varrerERemoverAnexosOrfaosFisicos() {
		if (storageProperties.denunciaAnexosDir() == null) {
			return;
		}

		Path dirUploads = Path.of(storageProperties.denunciaAnexosDir()).toAbsolutePath().normalize();
		if (!Files.exists(dirUploads)) {
			return;
		}

		log.info("Iniciando varredura de arquivos orfaos no diretorio: {}", dirUploads);

		// Varre arquivos físicos de anexos no disco e compara com o banco
		try (Stream<Path> stream = Files.walk(dirUploads, 2)) {
			stream.filter(Files::isRegularFile).forEach(file -> {
				String nomeArmazenado = file.getFileName().toString();
				
				// Se o arquivo físico não está cadastrado em nossa tabela de anexos_denuncia, é órfão!
				if (!anexoDenunciaRepository.existsByNomeArmazenado(nomeArmazenado)) {
					try {
						Files.delete(file);
						log.info("Removido anexo orfao fisico do disco: {}", file.toAbsolutePath());
					} catch (IOException e) {
						log.warn("Nao foi possivel deletar o arquivo orfao: {}", file, e);
					}
				}
			});
		} catch (IOException e) {
			log.error("Erro ao varrer arquivos de anexo para limpeza.", e);
		}

		// Remove subdiretórios de denúncias que ficaram vazios após limpezas ou remoções
		try (Stream<Path> stream = Files.walk(dirUploads, 1)) {
			stream.filter(Files::isDirectory)
					.filter(dir -> !dir.equals(dirUploads))
					.forEach(dir -> {
						try (Stream<Path> content = Files.list(dir)) {
							if (content.findAny().isEmpty()) {
								Files.delete(dir);
								log.info("Removido diretorio de anexos vazio: {}", dir.toAbsolutePath());
							}
						} catch (IOException ignored) {
						}
					});
		} catch (IOException e) {
			log.error("Erro ao varrer subdiretorios vazios de anexos.", e);
		}
	}
}
