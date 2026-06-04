# DocumentaÃ§Ã£o TÃ©cnica e Arquitetural Final â€” Cidade Ativa

Esta documentaÃ§Ã£o consolida as diretrizes de arquitetura, guias de execuÃ§Ã£o local, mapeamento de variÃ¡veis de ambiente e endurecimento de seguranÃ§a (hardening) estabelecidos para o backend do projeto **Cidade Ativa**.

---

## 1. VisÃ£o Geral da Arquitetura

O backend Ã© construÃ­do em **Spring Boot 3 / 4 (Java 21)** seguindo princÃ­pios de design limpo e modularidade coesa. A organizaÃ§Ã£o do cÃ³digo divide-se estritamente em duas grandes camadas:

1. **`core/` (DomÃ­nio do NegÃ³cio)**:
   ContÃ©m as regras fundamentais divididas por funcionalidades operacionais (ex: `denuncia`, `comentario`, `usuario`, `vinculo`, `organizacao`, `operacional`, `notificacao`). Cada pacote segue o padrÃ£o:
   - `[Funcionalidade].java` (Entidade JPA)
   - `[Funcionalidade]Repository.java` (Interface Spring Data JPA)
   - `[Funcionalidade]Service.java` (Camada de Regras e LÃ³gica de NegÃ³cio)
   - `[Funcionalidade]Controller.java` (Pontos de entrada HTTP / REST Controllers)

2. **`infra/` (Infraestrutura e Suporte TÃ©cnico)**:
   Engloba recursos transversais, utilitÃ¡rios e de seguranÃ§a:
   - `security/` (ConfiguraÃ§Ãµes de seguranÃ§a baseadas em JWT, Cookies seguros e filtros de restriÃ§Ã£o)
   - `auth/` (ServiÃ§os e controllers de autenticaÃ§Ã£o de sessÃ£o)
   - `cleanup/` (Agendador automÃ¡tico de expurgo e purga de dados tÃ©cnicos)
   - `storage/` (Gerenciador fÃ­sico/lÃ³gico de uploads e validaÃ§Ãµes)
   - `limite/` (Filtros de Rate Limiting por endpoint)
   - `antispam/` (Mecanismos preventivos contra abusos de criaÃ§Ã£o)

---

## 2. Hardening e SeguranÃ§a Implantada

### A. ValidaÃ§Ã£o Profunda de Assinatura de Arquivos (Magic Numbers)
Em adiÃ§Ã£o ao tamanho mÃ¡ximo do anexo (`10MB`) e validaÃ§Ã£o simples de MIME types, o backend agora realiza **validaÃ§Ã£o de assinatura por Magic Numbers (Bytes FÃ­sicos)** na camada de storage antes de salvar qualquer anexo. Isso neutraliza tentativas de envio de scripts maliciosos (como JSP, PHP, ExecutÃ¡veis) mascarados com cabeÃ§alhos de requisiÃ§Ã£o forjados.

Os cabeÃ§alhos lidos e comparados sÃ£o:
- **JPEG**: Primeiros bytes iniciam em `0xFF 0xD8 0xFF`
- **PNG**: Primeiros bytes correspondem a `0x89 0x50 0x4E 0x47`
- **WebP**: Byte `0` a `3` correspondem a `RIFF` e byte `8` a `11` correspondem a `WEBP`.

### B. Expurgos AutomÃ¡ticos DiÃ¡rios (`LimpezaDadosScheduler`)
Executado nativamente Ã s 3:00 AM (configurÃ¡vel), realiza a faxina periÃ³dica preventiva:
- Deleta Refresh Tokens antigos, inativos ou revogados.
- Remove Tokens de validaÃ§Ã£o e redefiniÃ§Ã£o de senha jÃ¡ utilizados ou expirados.
- Apaga logs antigos da tabela de auditoria (anterior a 30 dias).
- Rastreia a pasta local de upload e remove recursivamente qualquer arquivo fÃ­sico que nÃ£o possua correspondente na tabela de `anexos_denuncia` (neutralizaÃ§Ã£o de arquivos Ã³rfÃ£os decorrentes de uploads cancelados/incompletos).

---

## 3. Mapeamento Geral de VariÃ¡veis de Ambiente

Todas as configuraÃ§Ãµes principais sÃ£o parametrizadas no arquivo central [application.yml](file:///c:/Users/mykae/OneDrive/Desktop/prefeitura/src/main/resources/application-yml) e podem ser fornecidas no deploy ou atravÃ©s do arquivo `.env` na raiz do projeto:

| VariÃ¡vel de Ambiente | DescriÃ§Ã£o | Valor PadrÃ£o (Dev) | Recomendado (Prod) |
|---|---|---|---|
| `SPRING_DATASOURCE_URL` | URL de conexÃ£o com a base Postgres | `jdbc:postgresql://localhost:5432/cidadeativa` | URL Real do RDS/Banco |
| `SPRING_DATASOURCE_USERNAME` | UsuÃ¡rio da base de dados | `cidadeativa` | Credencial segura |
| `SPRING_DATASOURCE_PASSWORD` | Senha da base de dados | `cidadeativa` | Senha criptografada |
| `JWT_SECRET` | Chave secreta de assinatura dos tokens JWT | `dev-secret-change-me-with-at-least-32-chars` | Assinatura forte gerada por HMAC-SHA |
| `AUTH_COOKIE_SECURE` | Define se o cookie de auth exige HTTPS | `false` | `true` |
| `RATE_LIMIT_ENABLED` | Liga ou desliga o limitador de requisiÃ§Ãµes | `true` | `true` |
| `ANTISPAM_ENABLED` | Liga o preventor de posts e links excessivos | `true` | `true` |
| `MAIL_ENABLED` | Habilita envio de e-mails via SMTP fÃ­sico | `false` | `true` |
| `MAIL_HOST` / `MAIL_PORT` | Dados de conexÃ£o do provedor de e-mail | `localhost` / `1025` | Servidor SMTP real |

---

## 4. SeparaÃ§Ã£o de Perfis (Dev vs ProduÃ§Ã£o)

Para deploy em homologaÃ§Ã£o ou produÃ§Ã£o, o aplicativo introduz o perfil de produÃ§Ã£o (`prod`) configurado no arquivo [application-prod.yml](file:///c:/Users/mykae/OneDrive/Desktop/prefeitura/src/main/resources/application-prod.yml):

* **ExecuÃ§Ã£o**:
  ```bash
  java -jar target/prefeitura-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
  ```
* **Diferenciais do Perfil `prod`**:
  - **Swagger-UI e OpenAPI Desabilitados**: A interface do Swagger (`/swagger-ui.html`) e a especificaÃ§Ã£o de endpoints (`/api-docs`) ficam totalmente ocultas e desabilitadas para evitar vazamento de documentaÃ§Ã£o das rotas internas da prefeitura.
  - **Cookies Seguros Ativados**: Obriga a sinalizaÃ§Ã£o de `Secure` nos cookies JWT e Refresh, impedindo a transmissÃ£o em conexÃµes HTTP comuns.
  - **DesativaÃ§Ã£o de Logs Verbosos**: O log do SQL cru gerado pelo Hibernate Ã© silenciado para proteÃ§Ã£o de dados do banco e eficiÃªncia de E/S.

---

## 5. ExecuÃ§Ã£o e Setup RÃ¡pido Local (Dev)

### Requisitos:
* Java JDK 21
* Maven 3+
* Docker e Docker-Compose (para execuÃ§Ã£o local rÃ¡pida do Postgres e Mailpit)

### InicializaÃ§Ã£o rÃ¡pida da infraestrutura:
```bash
# Iniciar o banco de dados Postgres e painel de e-mail Mailpit locais
docker-compose up -d

# Compilar e executar os testes integrados locais
./mvnw.cmd clean test

# Iniciar o aplicativo Spring Boot
./mvnw.cmd spring-boot:run
```
*(O aplicativo subirÃ¡ por padrÃ£o na porta `8080` e os logs de e-mails enviados podem ser acompanhados na interface do Mailpit na porta `8025`).*
