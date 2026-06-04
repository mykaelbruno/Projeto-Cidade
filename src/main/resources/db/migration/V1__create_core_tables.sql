create table usuarios (
    id bigserial primary key,
    nome varchar(100) not null,
    email varchar(150) not null,
    username varchar(50) not null,
    senha_hash varchar(255) not null,
    perfil_global varchar(30) not null default 'MORADOR',
    telefone varchar(20),
    cidade varchar(100) not null,
    bairro varchar(100) not null,
    foto_perfil_url varchar(500),
    ativo boolean not null default true,
    criado_em timestamp with time zone not null default now(),
    atualizado_em timestamp with time zone not null default now(),
    constraint uk_usuarios_email unique (email),
    constraint uk_usuarios_username unique (username),
    constraint ck_usuarios_perfil_global check (perfil_global in ('ADMIN_APP', 'MORADOR', 'MODERADOR'))
);

create table organizacoes (
    id bigserial primary key,
    nome varchar(150) not null,
    tipo varchar(30) not null,
    cidade varchar(100) not null,
    estado varchar(2) not null,
    organizacao_pai_id bigint references organizacoes(id),
    verificada boolean not null default false,
    ativa boolean not null default true,
    criado_em timestamp with time zone not null default now(),
    atualizado_em timestamp with time zone not null default now(),
    constraint ck_organizacoes_tipo check (tipo in ('PREFEITURA', 'SECRETARIA')),
    constraint ck_secretaria_tem_prefeitura check (
        (tipo = 'PREFEITURA' and organizacao_pai_id is null)
        or (tipo = 'SECRETARIA' and organizacao_pai_id is not null)
    )
);

create table vinculos_usuario_organizacao (
    id bigserial primary key,
    usuario_id bigint not null references usuarios(id),
    organizacao_id bigint not null references organizacoes(id),
    papel varchar(40) not null,
    ativo boolean not null default true,
    criado_em timestamp with time zone not null default now(),
    constraint ck_vinculos_papel check (
        papel in (
            'ADMIN_PREFEITURA',
            'ADMIN_SECRETARIA',
            'ATENDENTE_SECRETARIA'
        )
    ),
    constraint uk_vinculo_usuario_organizacao_papel unique (usuario_id, organizacao_id, papel)
);

create table categorias (
    id bigserial primary key,
    nome varchar(100) not null,
    descricao varchar(500),
    organizacao_responsavel_padrao_id bigint references organizacoes(id),
    ativa boolean not null default true
);

insert into categorias (nome, descricao) values
    ('Infraestrutura', 'Buracos, calcamento, pavimentacao, drenagem e ruas alagadas.'),
    ('Iluminacao publica', 'Postes apagados, postes quebrados e fiacao exposta.'),
    ('Limpeza urbana', 'Lixo acumulado, entulho, terreno abandonado e esgoto a ceu aberto.'),
    ('Saude publica', 'Problemas em posto de saude, falta de medicamento e estrutura precaria.'),
    ('Educacao', 'Problemas em escola publica, transporte escolar e estrutura escolar.'),
    ('Transporte e mobilidade', 'Ponto de onibus danificado, falta de sinalizacao e falta de acessibilidade.');

create table denuncias (
    id bigserial primary key,
    titulo varchar(120) not null,
    descricao varchar(2000) not null,
    categoria_id bigint not null references categorias(id),
    status varchar(30) not null default 'ABERTO',
    autor_id bigint not null references usuarios(id),
    anonima boolean not null default false,
    cidade varchar(100) not null,
    bairro varchar(100) not null,
    rua varchar(150),
    ponto_referencia varchar(200),
    latitude double precision,
    longitude double precision,
    organizacao_responsavel_id bigint references organizacoes(id),
    pontuacao_relevancia integer not null default 0,
    quantidade_confirmacoes integer not null default 0,
    quantidade_urgencias integer not null default 0,
    quantidade_comentarios integer not null default 0,
    conclusao_confirmada_em timestamp with time zone,
    conclusao_contestada_em timestamp with time zone,
    feedback_conclusao varchar(500),
    criado_em timestamp with time zone not null default now(),
    atualizado_em timestamp with time zone not null default now(),
    constraint ck_denuncias_status check (
        status in (
            'ABERTO',
            'EM_ANALISE',
            'ENCAMINHADO',
            'EM_ANDAMENTO',
            'PROGRAMADO',
            'CONCLUIDO',
            'REABERTO',
            'ARQUIVADO'
        )
    )
);

create index idx_denuncias_status on denuncias(status);
create index idx_denuncias_cidade_bairro on denuncias(cidade, bairro);
create index idx_denuncias_categoria on denuncias(categoria_id);
create index idx_denuncias_organizacao_responsavel on denuncias(organizacao_responsavel_id);
create index idx_denuncias_feed_recentes on denuncias(criado_em desc, id desc);
create index idx_denuncias_feed_relevancia on denuncias(pontuacao_relevancia desc, criado_em desc, id desc);

create table comentarios (
    id bigserial primary key,
    denuncia_id bigint not null references denuncias(id),
    autor_id bigint not null references usuarios(id),
    conteudo varchar(2000) not null,
    oficial boolean not null default false,
    organizacao_id bigint references organizacoes(id),
    criado_em timestamp with time zone not null default now(),
    atualizado_em timestamp with time zone not null default now(),
    removido_em timestamp with time zone,
    constraint ck_comentarios_resposta_oficial check (
        (oficial = false and organizacao_id is null)
        or (oficial = true and organizacao_id is not null)
    )
);

create index idx_comentarios_denuncia on comentarios(denuncia_id);
create index idx_comentarios_autor on comentarios(autor_id);
create index idx_comentarios_organizacao on comentarios(organizacao_id);

create table interacoes_denuncia (
    id bigserial primary key,
    denuncia_id bigint not null references denuncias(id),
    usuario_id bigint not null references usuarios(id),
    tipo varchar(30) not null,
    criado_em timestamp with time zone not null default now(),
    constraint ck_interacoes_denuncia_tipo check (tipo in ('CONFIRMACAO', 'URGENCIA')),
    constraint uk_interacao_denuncia_usuario_tipo unique (denuncia_id, usuario_id, tipo)
);

create index idx_interacoes_denuncia_denuncia on interacoes_denuncia(denuncia_id);
create index idx_interacoes_denuncia_usuario on interacoes_denuncia(usuario_id);
create index idx_interacoes_denuncia_tipo on interacoes_denuncia(tipo);

create table timeline_denuncia (
    id bigserial primary key,
    denuncia_id bigint not null references denuncias(id),
    tipo varchar(50) not null,
    descricao varchar(500) not null,
    usuario_id bigint references usuarios(id),
    organizacao_id bigint references organizacoes(id),
    destaque boolean not null default false,
    criado_em timestamp with time zone not null default now(),
    constraint ck_timeline_denuncia_tipo check (
        tipo in (
            'DENUNCIA_CRIADA',
            'COMENTARIO_ADICIONADO',
            'RESPOSTA_OFICIAL_PUBLICADA',
            'STATUS_ALTERADO',
            'ANEXO_ADICIONADO',
            'DENUNCIA_ARQUIVADA_MODERACAO',
            'COMENTARIO_REMOVIDO_MODERACAO',
            'TRANSFERENCIA_SOLICITADA',
            'TRANSFERENCIA_APROVADA',
            'TRANSFERENCIA_RECUSADA',
            'RESPONSAVEL_ALTERADO_PREFEITURA',
            'CONCLUSAO_CONFIRMADA_MORADOR',
            'CONCLUSAO_CONTESTADA_MORADOR'
        )
    )
);

create index idx_timeline_denuncia_denuncia on timeline_denuncia(denuncia_id);
create index idx_timeline_denuncia_tipo on timeline_denuncia(tipo);
create index idx_timeline_denuncia_criado_em on timeline_denuncia(criado_em);

create table anexos_denuncia (
    id bigserial primary key,
    denuncia_id bigint not null references denuncias(id),
    autor_id bigint not null references usuarios(id),
    nome_original varchar(255) not null,
    nome_armazenado varchar(255) not null,
    caminho_arquivo varchar(500) not null,
    content_type varchar(100) not null,
    tamanho_bytes bigint not null,
    criado_em timestamp with time zone not null default now(),
    constraint ck_anexos_denuncia_content_type check (content_type in ('image/jpeg', 'image/png', 'image/webp')),
    constraint uk_anexos_denuncia_caminho unique (caminho_arquivo)
);

create index idx_anexos_denuncia_denuncia on anexos_denuncia(denuncia_id);
create index idx_anexos_denuncia_autor on anexos_denuncia(autor_id);
create index idx_anexos_denuncia_criado_em on anexos_denuncia(criado_em);

create table moderacoes (
    id bigserial primary key,
    tipo_alvo varchar(30) not null,
    denuncia_id bigint references denuncias(id),
    comentario_id bigint references comentarios(id),
    moderador_id bigint not null references usuarios(id),
    motivo varchar(500) not null,
    criado_em timestamp with time zone not null default now(),
    constraint ck_moderacoes_tipo_alvo check (tipo_alvo in ('DENUNCIA', 'COMENTARIO')),
    constraint ck_moderacoes_alvo check (
        (tipo_alvo = 'DENUNCIA' and denuncia_id is not null and comentario_id is null)
        or (tipo_alvo = 'COMENTARIO' and denuncia_id is not null and comentario_id is not null)
    )
);

create index idx_moderacoes_tipo_alvo on moderacoes(tipo_alvo);
create index idx_moderacoes_denuncia on moderacoes(denuncia_id);
create index idx_moderacoes_comentario on moderacoes(comentario_id);
create index idx_moderacoes_moderador on moderacoes(moderador_id);
create index idx_moderacoes_criado_em on moderacoes(criado_em);

create table sinalizacoes_denuncia (
    id bigserial primary key,
    denuncia_id bigint not null references denuncias(id),
    autor_id bigint not null references usuarios(id),
    motivo varchar(500) not null,
    status varchar(30) not null default 'PENDENTE',
    analisado_por_id bigint references usuarios(id),
    analisado_em timestamp with time zone,
    criado_em timestamp with time zone not null default now(),
    constraint ck_sinalizacoes_denuncia_status check (status in ('PENDENTE', 'ANALISADA')),
    constraint uk_sinalizacao_denuncia_autor unique (denuncia_id, autor_id)
);

create index idx_sinalizacoes_denuncia_denuncia on sinalizacoes_denuncia(denuncia_id);
create index idx_sinalizacoes_denuncia_autor on sinalizacoes_denuncia(autor_id);
create index idx_sinalizacoes_denuncia_status on sinalizacoes_denuncia(status);
create index idx_sinalizacoes_denuncia_criado_em on sinalizacoes_denuncia(criado_em);

create table solicitacoes_transferencia_denuncia (
    id bigserial primary key,
    denuncia_id bigint not null references denuncias(id),
    prefeitura_id bigint not null references organizacoes(id),
    organizacao_origem_id bigint not null references organizacoes(id),
    organizacao_destino_sugerida_id bigint references organizacoes(id),
    solicitado_por_id bigint not null references usuarios(id),
    motivo varchar(500) not null,
    status varchar(30) not null default 'PENDENTE',
    avaliado_por_id bigint references usuarios(id),
    organizacao_destino_final_id bigint references organizacoes(id),
    motivo_decisao varchar(500),
    avaliado_em timestamp with time zone,
    criado_em timestamp with time zone not null default now(),
    constraint ck_solicitacoes_transferencia_status check (status in ('PENDENTE', 'APROVADA', 'RECUSADA'))
);

create unique index uk_solicitacao_transferencia_denuncia_pendente
    on solicitacoes_transferencia_denuncia(denuncia_id)
    where status = 'PENDENTE';

create index idx_solicitacoes_transferencia_prefeitura_status on solicitacoes_transferencia_denuncia(prefeitura_id, status);
create index idx_solicitacoes_transferencia_denuncia on solicitacoes_transferencia_denuncia(denuncia_id);
create index idx_solicitacoes_transferencia_origem on solicitacoes_transferencia_denuncia(organizacao_origem_id);
create index idx_solicitacoes_transferencia_criado_em on solicitacoes_transferencia_denuncia(criado_em);

create table notificacoes (
    id bigserial primary key,
    usuario_id bigint not null references usuarios(id),
    denuncia_id bigint references denuncias(id),
    tipo varchar(60) not null,
    titulo varchar(140) not null,
    mensagem varchar(500) not null,
    link varchar(300),
    lida_em timestamp with time zone,
    criado_em timestamp with time zone not null default now(),
    constraint ck_notificacoes_tipo check (
        tipo in (
            'DENUNCIA_ATRIBUIDA',
            'DENUNCIA_CONCLUIDA_AGUARDANDO_CONFIRMACAO',
            'TRANSFERENCIA_SOLICITADA',
            'TRANSFERENCIA_APROVADA',
            'TRANSFERENCIA_RECUSADA',
            'SINALIZACAO_DENUNCIA_RECEBIDA'
        )
    )
);

create index idx_notificacoes_usuario_criado_em on notificacoes(usuario_id, criado_em);
create index idx_notificacoes_usuario_lida on notificacoes(usuario_id, lida_em);
create index idx_notificacoes_denuncia on notificacoes(denuncia_id);
create index idx_notificacoes_tipo on notificacoes(tipo);

create table refresh_tokens (
    id bigserial primary key,
    usuario_id bigint not null references usuarios(id),
    token_hash varchar(64) not null,
    expira_em timestamp with time zone not null,
    revogado_em timestamp with time zone,
    criado_em timestamp with time zone not null default now(),
    constraint uk_refresh_tokens_token_hash unique (token_hash)
);

create index idx_refresh_tokens_usuario on refresh_tokens(usuario_id);
