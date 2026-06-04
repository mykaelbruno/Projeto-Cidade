create table auditorias (
    id bigserial primary key,
    acao varchar(80) not null,
    alvo_tipo varchar(50) not null,
    alvo_id bigint,
    ator_id bigint references usuarios(id),
    perfil_ator varchar(80),
    descricao varchar(255) not null,
    detalhes varchar(1000),
    metodo_http varchar(10),
    caminho varchar(300),
    ip varchar(80),
    criado_em timestamp with time zone not null default now(),
    constraint ck_auditorias_acao check (
        acao in (
            'USUARIO_CRIADO',
            'USUARIO_ATUALIZADO',
            'USUARIO_ATIVACAO_ALTERADA',
            'ORGANIZACAO_CRIADA',
            'ORGANIZACAO_ATUALIZADA',
            'ORGANIZACAO_ATIVACAO_ALTERADA',
            'USUARIO_INSTITUCIONAL_CRIADO',
            'CATEGORIA_CRIADA',
            'CATEGORIA_ATUALIZADA',
            'CATEGORIA_ATIVACAO_ALTERADA',
            'VINCULO_ATUALIZADO',
            'DENUNCIA_STATUS_ALTERADO',
            'DENUNCIA_CONCLUSAO_CONFIRMADA',
            'DENUNCIA_CONCLUSAO_CONTESTADA',
            'DENUNCIA_ARQUIVADA_MODERACAO',
            'COMENTARIO_REMOVIDO_MODERACAO',
            'SINALIZACAO_CRIADA',
            'SINALIZACAO_ANALISADA',
            'TRANSFERENCIA_SOLICITADA',
            'TRANSFERENCIA_APROVADA',
            'TRANSFERENCIA_RECUSADA',
            'RESPONSAVEL_DENUNCIA_ALTERADO'
        )
    ),
    constraint ck_auditorias_alvo_tipo check (
        alvo_tipo in (
            'USUARIO',
            'ORGANIZACAO',
            'CATEGORIA',
            'VINCULO',
            'DENUNCIA',
            'COMENTARIO',
            'SINALIZACAO',
            'SOLICITACAO_TRANSFERENCIA'
        )
    )
);

create index idx_auditorias_criado_em on auditorias(criado_em desc);
create index idx_auditorias_acao on auditorias(acao);
create index idx_auditorias_alvo on auditorias(alvo_tipo, alvo_id);
create index idx_auditorias_ator on auditorias(ator_id);
