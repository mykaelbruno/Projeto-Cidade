package com.mykael.prefeitura.infra.conta;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(ContaProperties.class)
public class ContaConfig {
}
