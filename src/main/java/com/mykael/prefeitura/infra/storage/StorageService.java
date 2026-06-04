package com.mykael.prefeitura.infra.storage;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.Color;
import java.awt.image.BufferedImage;
import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Iterator;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class StorageService {

	private static final Set<String> CONTENT_TYPES_PERMITIDOS = Set.of(
			"image/jpeg",
			"image/png",
			"image/webp"
	);

	private final Path diretorioAnexosDenuncia;
	private final long tamanhoMaximoAnexo;
	private final int imagemMaxLargura;
	private final int imagemMaxAltura;
	private final float imagemQualidade;

	public StorageService(StorageProperties properties) {
		this.diretorioAnexosDenuncia = Path.of(properties.denunciaAnexosDir()).toAbsolutePath().normalize();
		this.tamanhoMaximoAnexo = properties.denunciaAnexosMaxBytes();
		this.imagemMaxLargura = properties.denunciaImagemMaxLargura();
		this.imagemMaxAltura = properties.denunciaImagemMaxAltura();
		this.imagemQualidade = properties.denunciaImagemQualidade();
	}

	public ArquivoArmazenado salvarAnexoDenuncia(Long denunciaId, MultipartFile arquivo) {
		validarArquivo(arquivo);
		validarAssinaturaArquivo(arquivo);

		String nomeOriginal = StringUtils.cleanPath(arquivo.getOriginalFilename() == null
				? "arquivo"
				: arquivo.getOriginalFilename());
		boolean deveOtimizar = deveOtimizar(arquivo.getContentType());
		String contentTypeFinal = deveOtimizar ? "image/jpeg" : arquivo.getContentType();
		String extensao = deveOtimizar ? ".jpg" : extrairExtensao(nomeOriginal, arquivo.getContentType());
		String nomeArmazenado = UUID.randomUUID() + extensao;
		Path diretorioDenuncia = diretorioAnexosDenuncia.resolve(denunciaId.toString()).normalize();
		Path destino = diretorioDenuncia.resolve(nomeArmazenado).normalize();

		if (!destino.startsWith(diretorioAnexosDenuncia)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nome de arquivo invalido.");
		}

		try {
			Files.createDirectories(diretorioDenuncia);
			if (deveOtimizar) {
				otimizarImagem(arquivo, destino);
			} else {
				try (InputStream inputStream = arquivo.getInputStream()) {
					Files.copy(inputStream, destino, StandardCopyOption.REPLACE_EXISTING);
				}
			}
		} catch (IOException exception) {
			throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Nao foi possivel salvar o anexo.");
		}

		long tamanhoFinal = obterTamanhoArquivo(destino);

		return new ArquivoArmazenado(
				nomeOriginal,
				nomeArmazenado,
				diretorioAnexosDenuncia.relativize(destino).toString().replace('\\', '/'),
				contentTypeFinal,
				tamanhoFinal
		);
	}

	public Resource carregarAnexoDenuncia(String caminhoRelativo) {
		Path arquivo = diretorioAnexosDenuncia.resolve(caminhoRelativo).normalize();
		if (!arquivo.startsWith(diretorioAnexosDenuncia)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Caminho de arquivo invalido.");
		}

		try {
			Resource resource = new UrlResource(arquivo.toUri());
			if (!resource.exists() || !resource.isReadable()) {
				throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Arquivo do anexo nao encontrado.");
			}
			return resource;
		} catch (IOException exception) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Arquivo do anexo nao encontrado.");
		}
	}

	public void removerAnexoDenuncia(String caminhoRelativo) {
		Path arquivo = diretorioAnexosDenuncia.resolve(caminhoRelativo).normalize();
		if (!arquivo.startsWith(diretorioAnexosDenuncia)) {
			return;
		}
		try {
			Files.deleteIfExists(arquivo);
		} catch (IOException ignored) {
		}
	}

	private void validarArquivo(MultipartFile arquivo) {
		if (arquivo == null || arquivo.isEmpty()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Arquivo do anexo e obrigatorio.");
		}
		if (arquivo.getSize() > tamanhoMaximoAnexo) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Arquivo ultrapassa o tamanho maximo permitido.");
		}
		if (!CONTENT_TYPES_PERMITIDOS.contains(arquivo.getContentType())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Formato de arquivo nao permitido.");
		}
	}

	private void validarAssinaturaArquivo(MultipartFile arquivo) {
		try (InputStream is = arquivo.getInputStream()) {
			byte[] cabecalho = new byte[12];
			int lidos = is.read(cabecalho);
			if (lidos < 4) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Arquivo invalido ou muito pequeno.");
			}

			// Verificar se é JPEG: FF D8 FF
			if (cabecalho[0] == (byte) 0xFF && cabecalho[1] == (byte) 0xD8 && cabecalho[2] == (byte) 0xFF) {
				return;
			}

			// Verificar se é PNG: 89 50 4E 47
			if (cabecalho[0] == (byte) 0x89 && cabecalho[1] == (byte) 0x50 && cabecalho[2] == (byte) 0x4E && cabecalho[3] == (byte) 0x47) {
				return;
			}

			// Verificar se é WebP: RIFF (52 49 46 46) em 0-3 e WEBP (57 45 42 50) em 8-11
			if (lidos >= 12 &&
				cabecalho[0] == (byte) 'R' && cabecalho[1] == (byte) 'I' && cabecalho[2] == (byte) 'F' && cabecalho[3] == (byte) 'F' &&
				cabecalho[8] == (byte) 'W' && cabecalho[9] == (byte) 'E' && cabecalho[10] == (byte) 'B' && cabecalho[11] == (byte) 'P') {
				return;
			}

			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Assinatura do arquivo nao condiz com o formato permitido.");
		} catch (IOException e) {
			throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Nao foi possivel ler a assinatura do arquivo.");
		}
	}

	private boolean deveOtimizar(String contentType) {
		return "image/jpeg".equals(contentType) || "image/png".equals(contentType);
	}

	private void otimizarImagem(MultipartFile arquivo, Path destino) throws IOException {
		BufferedImage original;
		try (InputStream inputStream = arquivo.getInputStream()) {
			original = ImageIO.read(inputStream);
		}
		if (original == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Arquivo de imagem invalido.");
		}

		BufferedImage redimensionada = redimensionar(original);
		Iterator<ImageWriter> writers = ImageIO.getImageWritersByFormatName("jpg");
		if (!writers.hasNext()) {
			throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Otimizador de imagem indisponivel.");
		}

		ImageWriter writer = writers.next();
		ImageWriteParam parametros = writer.getDefaultWriteParam();
		parametros.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
		parametros.setCompressionQuality(Math.max(0.1f, Math.min(imagemQualidade, 1.0f)));

		try (
				OutputStream outputStream = Files.newOutputStream(destino);
				ImageOutputStream imageOutputStream = ImageIO.createImageOutputStream(outputStream)
		) {
			writer.setOutput(imageOutputStream);
			writer.write(null, new IIOImage(redimensionada, null, null), parametros);
		} finally {
			writer.dispose();
		}
	}

	private BufferedImage redimensionar(BufferedImage original) {
		double escalaLargura = (double) imagemMaxLargura / original.getWidth();
		double escalaAltura = (double) imagemMaxAltura / original.getHeight();
		double escala = Math.min(1.0, Math.min(escalaLargura, escalaAltura));

		int novaLargura = Math.max(1, (int) Math.round(original.getWidth() * escala));
		int novaAltura = Math.max(1, (int) Math.round(original.getHeight() * escala));
		BufferedImage destino = new BufferedImage(novaLargura, novaAltura, BufferedImage.TYPE_INT_RGB);

		Graphics2D graphics = destino.createGraphics();
		try {
			graphics.setColor(Color.WHITE);
			graphics.fillRect(0, 0, novaLargura, novaAltura);
			graphics.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
			graphics.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
			graphics.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
			graphics.drawImage(original, 0, 0, novaLargura, novaAltura, null);
		} finally {
			graphics.dispose();
		}

		return destino;
	}

	private long obterTamanhoArquivo(Path destino) {
		try {
			return Files.size(destino);
		} catch (IOException exception) {
			throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Nao foi possivel verificar o anexo salvo.");
		}
	}

	private String extrairExtensao(String nomeOriginal, String contentType) {
		int indice = nomeOriginal.lastIndexOf('.');
		if (indice < 0) {
			return extensaoPorContentType(contentType);
		}
		String extensao = nomeOriginal.substring(indice).toLowerCase(Locale.ROOT);
		return switch (extensao) {
			case ".jpg", ".jpeg", ".png", ".webp" -> extensao;
			default -> extensaoPorContentType(contentType);
		};
	}

	private String extensaoPorContentType(String contentType) {
		return switch (contentType) {
			case "image/jpeg" -> ".jpg";
			case "image/png" -> ".png";
			case "image/webp" -> ".webp";
			default -> ".bin";
		};
	}
}
