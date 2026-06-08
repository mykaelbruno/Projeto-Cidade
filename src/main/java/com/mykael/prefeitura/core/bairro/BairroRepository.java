package com.mykael.prefeitura.core.bairro;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BairroRepository extends JpaRepository<Bairro, Long> {

	List<Bairro> findByPrefeituraIdOrderByNomeAsc(Long prefeituraId);

	List<Bairro> findByPrefeituraIdAndAtivoTrueOrderByNomeAsc(Long prefeituraId);

	java.util.Optional<Bairro> findByIdAndPrefeituraIdAndAtivoTrue(Long id, Long prefeituraId);

	java.util.Optional<Bairro> findByPrefeituraIdAndNomeIgnoreCaseAndAtivoTrue(Long prefeituraId, String nome);

	boolean existsByPrefeituraIdAndNomeIgnoreCase(Long prefeituraId, String nome);

	boolean existsByPrefeituraIdAndNomeIgnoreCaseAndIdNot(Long prefeituraId, String nome, Long id);
}
