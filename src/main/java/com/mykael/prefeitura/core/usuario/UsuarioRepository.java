package com.mykael.prefeitura.core.usuario;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface UsuarioRepository extends JpaRepository<Usuario, Long>, JpaSpecificationExecutor<Usuario> {

	Optional<Usuario> findByEmail(String email);

	Optional<Usuario> findByUsername(String username);

	Optional<Usuario> findByEmailOrUsername(String email, String username);

	boolean existsByEmail(String email);

	boolean existsByUsername(String username);

	List<Usuario> findByPerfilGlobalAndAtivoTrue(PerfilUsuario perfilGlobal);

	long countByPerfilGlobalAndAtivoTrue(PerfilUsuario perfilGlobal);

	List<Usuario> findByCidadeIgnoreCase(String cidade);
}
