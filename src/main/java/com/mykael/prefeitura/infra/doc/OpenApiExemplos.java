package com.mykael.prefeitura.infra.doc;

public final class OpenApiExemplos {

	public static final String ERRO_VALIDACAO = """
			{
			  "timestamp": "2026-05-29T12:00:00Z",
			  "status": 400,
			  "erro": "REQUISICAO_INVALIDA",
			  "mensagem": "Campo obrigatorio ou regra de negocio invalida.",
			  "caminho": "/api/denuncias"
			}
			""";

	public static final String CADASTRO_MORADOR = """
			{
			  "nome": "Maria Silva",
			  "email": "maria@example.com",
			  "username": "maria_silva",
			  "senha": "senha-segura",
			  "telefone": "83999990000",
			  "cidade": "Joao Pessoa",
			  "bairro": "Centro"
			}
			""";

	public static final String LOGIN = """
			{
			  "identificador": "maria_silva",
			  "senha": "senha-segura"
			}
			""";

	public static final String SOLICITAR_EMAIL = """
			{
			  "email": "maria@example.com"
			}
			""";

	public static final String CONFIRMAR_TOKEN = """
			{
			  "token": "token-recebido-por-email"
			}
			""";

	public static final String REDEFINIR_SENHA = """
			{
			  "token": "token-recebido-por-email",
			  "novaSenha": "nova-senha-segura"
			}
			""";

	public static final String DENUNCIA = """
			{
			  "titulo": "Buraco grande na rua",
			  "descricao": "Existe um buraco grande na rua principal do bairro ha varios dias.",
			  "categoriaId": 1,
			  "prefeituraId": 1,
			  "bairroId": 4,
			  "anonima": false,
			  "cidade": "Joao Pessoa",
			  "bairro": "Centro",
			  "rua": "Rua Principal",
			  "pontoReferencia": "Perto da praca",
			  "latitude": -7.12,
			  "longitude": -34.86
			}
			""";

	public static final String DENUNCIA_SEMELHANTE = """
			{
			  "titulo": "Buraco grande perto da praca",
			  "descricao": "O buraco na rua principal continua causando risco para carros e pedestres.",
			  "categoriaId": 1,
			  "prefeituraId": 1,
			  "bairroId": 4,
			  "anonima": false,
			  "cidade": "Joao Pessoa",
			  "bairro": "Centro",
			  "rua": "Rua Principal",
			  "pontoReferencia": "Perto da praca",
			  "latitude": -7.1203,
			  "longitude": -34.8602
			}
			""";

	public static final String STATUS_DENUNCIA = """
			{
			  "status": "EM_ANALISE",
			  "organizacaoId": 2,
			  "motivo": "Triagem inicial da secretaria."
			}
			""";

	public static final String FEEDBACK_CONCLUSAO = """
			{
			  "feedback": "O problema foi resolvido no local."
			}
			""";

	public static final String COMENTARIO = """
			{
			  "conteudo": "O problema continua acontecendo todos os dias."
			}
			""";

	public static final String RESPOSTA_OFICIAL = """
			{
			  "organizacaoId": 2,
			  "conteudo": "A secretaria ja abriu atendimento para esta ocorrencia."
			}
			""";

	public static final String SINALIZACAO = """
			{
			  "motivo": "FAKE_NEWS",
			  "comentario": "A denuncia parece conter informacoes falsas ou manipuladas."
			}
			""";

	public static final String MODERACAO = """
			{
			  "motivo": "Conteudo removido por violar as regras da plataforma."
			}
			""";

	public static final String MODERACAO_USUARIO = """
			{
			  "motivo": "Usuario reincidiu em abuso, spam ou comportamento inadequado."
			}
			""";

	public static final String SOLICITAR_TRANSFERENCIA = """
			{
			  "organizacaoDestinoSugeridaId": 3,
			  "motivo": "Esta demanda pertence a outra secretaria."
			}
			""";

	public static final String APROVAR_TRANSFERENCIA = """
			{
			  "organizacaoDestinoId": 3,
			  "motivo": "Transferencia aprovada pela prefeitura."
			}
			""";

	public static final String RECUSAR_TRANSFERENCIA = """
			{
			  "motivo": "A secretaria atual ainda deve concluir o atendimento."
			}
			""";

	public static final String ALTERAR_RESPONSAVEL = """
			{
			  "organizacaoDestinoId": 3,
			  "motivo": "Redistribuicao manual definida pela prefeitura."
			}
			""";

	public static final String PREFEITURA = """
			{
			  "nome": "Prefeitura de Joao Pessoa",
			  "cidade": "Joao Pessoa",
			  "estado": "PB",
			  "verificada": true
			}
			""";

	public static final String SECRETARIA = """
			{
			  "nome": "Secretaria de Obras",
			  "categoriasIds": [1, 2]
			}
			""";

	public static final String SECRETARIA_CATEGORIAS_UPDATE = """
			{
			  "categoriasIds": [1, 2, 3]
			}
			""";

	public static final String BAIRRO = """
			{
			  "nome": "Centro",
			  "centroideLatitude": -6.838,
			  "centroideLongitude": -35.126
			}
			""";

	public static final String USUARIO_INSTITUCIONAL = """
			{
			  "nome": "Ana Secretaria",
			  "email": "ana.secretaria@example.com",
			  "username": "ana_secretaria",
			  "senha": "senha-segura",
			  "papel": "ADMIN_SECRETARIA",
			  "telefone": "83999990000"
			}
			""";

	public static final String ORGANIZACAO_UPDATE = """
			{
			  "nome": "Secretaria de Infraestrutura",
			  "cidade": "Joao Pessoa",
			  "estado": "PB",
			  "verificada": true
			}
			""";

	public static final String USUARIO = """
			{
			  "nome": "Moderador Cidade Ativa",
			  "email": "moderador@example.com",
			  "username": "moderador_cidade",
			  "senha": "senha-segura",
			  "perfilGlobal": "MODERADOR",
			  "telefone": "83999990000",
			  "cidade": "Joao Pessoa",
			  "bairro": "Centro"
			}
			""";

	public static final String USUARIO_UPDATE = """
			{
			  "nome": "Moderador Atualizado",
			  "email": "moderador@example.com",
			  "username": "moderador_cidade",
			  "perfilGlobal": "MODERADOR",
			  "telefone": "83999990000",
			  "cidade": "Joao Pessoa",
			  "bairro": "Centro"
			}
			""";

	public static final String CATEGORIA = """
			{
			  "nome": "Iluminacao publica",
			  "descricao": "Problemas em postes, lampadas e iluminacao de vias.",
			  "organizacaoResponsavelPadraoId": 2
			}
			""";

	public static final String ATIVACAO = """
			{
			  "ativa": true
			}
			""";

	public static final String VINCULO_UPDATE = """
			{
			  "papel": "ADMIN_SECRETARIA",
			  "ativo": true
			}
			""";

	public static final String VINCULO_CREATE = """
			{
			  "usuarioId": 10,
			  "organizacaoId": 3,
			  "papel": "ATENDENTE_SECRETARIA",
			  "ativo": true
			}
			""";

	public static final String VINCULO_TRANSFERENCIA_SECRETARIA = """
			{
			  "secretariaDestinoId": 3
			}
			""";

	private OpenApiExemplos() {
	}
}
