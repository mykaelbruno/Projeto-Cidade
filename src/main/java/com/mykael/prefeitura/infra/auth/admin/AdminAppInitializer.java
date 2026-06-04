package com.mykael.prefeitura.infra.auth.admin;

import com.mykael.prefeitura.core.usuario.PerfilUsuario;
import com.mykael.prefeitura.core.usuario.Usuario;
import com.mykael.prefeitura.core.usuario.UsuarioRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@EnableConfigurationProperties(AdminAppInicialProperties.class)
public class AdminAppInitializer implements ApplicationRunner {

	private final AdminAppInicialProperties properties;
	private final UsuarioRepository usuarioRepository;
	private final PasswordEncoder passwordEncoder;

	public AdminAppInitializer(
			AdminAppInicialProperties properties,
			UsuarioRepository usuarioRepository,
			PasswordEncoder passwordEncoder
	) {
		this.properties = properties;
		this.usuarioRepository = usuarioRepository;
		this.passwordEncoder = passwordEncoder;
	}

	@Override
	public void run(ApplicationArguments args) {
		if (!properties.habilitado()) {
			return;
		}

		validarConfiguracao();
		if (usuarioRepository.existsByEmail(properties.email().trim().toLowerCase())
				|| usuarioRepository.existsByUsername(properties.username().trim().toLowerCase())) {
			return;
		}

		Usuario admin = new Usuario();
		admin.setNome(valorOuPadrao(properties.nome(), "Administrador do Sistema"));
		admin.setEmail(properties.email().trim().toLowerCase());
		admin.setUsername(properties.username().trim().toLowerCase());
		admin.setSenhaHash(passwordEncoder.encode(properties.senha()));
		admin.setCidade(valorOuPadrao(properties.cidade(), "Sistema"));
		admin.setBairro(valorOuPadrao(properties.bairro(), "Sistema"));
		admin.setPerfilGlobal(PerfilUsuario.ADMIN_APP);

		usuarioRepository.save(admin);
	}

	private void validarConfiguracao() {
		if (!StringUtils.hasText(properties.email())
				|| !StringUtils.hasText(properties.username())
				|| !StringUtils.hasText(properties.senha())) {
			throw new IllegalStateException("ADMIN_APP_EMAIL, ADMIN_APP_USERNAME e ADMIN_APP_PASSWORD devem ser informados para criar o admin inicial.");
		}
		if (properties.senha().length() < 8 || properties.senha().length() > 72) {
			throw new IllegalStateException("ADMIN_APP_PASSWORD deve ter entre 8 e 72 caracteres.");
		}
	}

	private String valorOuPadrao(String value, String padrao) {
		return StringUtils.hasText(value) ? value.trim() : padrao;
	}
}
