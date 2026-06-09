alter table vinculos_usuario_organizacao
    drop constraint if exists uk_vinculo_usuario_organizacao_papel;

alter table vinculos_usuario_organizacao
    drop constraint if exists ck_vinculos_papel;

alter table usuarios
    drop constraint if exists ck_usuarios_perfil_global;

with vinculos_secretaria_duplicados as (
    select
        id,
        row_number() over (
            partition by usuario_id, organizacao_id
            order by ativo desc, criado_em desc, id desc
        ) as rn
    from vinculos_usuario_organizacao
    where papel in ('ADMIN_SECRETARIA', 'ATENDENTE_SECRETARIA')
)
delete from vinculos_usuario_organizacao
where id in (
    select id
    from vinculos_secretaria_duplicados
    where rn > 1
);

update usuarios
set perfil_global = 'ADMIN'
where perfil_global = 'ADMIN_APP';

update vinculos_usuario_organizacao
set papel = 'PREFEITURA'
where papel = 'ADMIN_PREFEITURA';

update vinculos_usuario_organizacao
set papel = 'SECRETARIA'
where papel in ('ADMIN_SECRETARIA', 'ATENDENTE_SECRETARIA');

update auditorias
set perfil_ator = 'ADMIN'
where perfil_ator = 'ADMIN_APP';

update auditorias
set perfil_ator = 'PREFEITURA'
where perfil_ator = 'ADMIN_PREFEITURA';

update auditorias
set perfil_ator = 'SECRETARIA'
where perfil_ator in ('ADMIN_SECRETARIA', 'ATENDENTE_SECRETARIA');

alter table usuarios
    add constraint ck_usuarios_perfil_global
    check (perfil_global in ('ADMIN', 'MORADOR', 'MODERADOR'));

alter table vinculos_usuario_organizacao
    add constraint ck_vinculos_papel
    check (papel in ('PREFEITURA', 'SECRETARIA'));

alter table vinculos_usuario_organizacao
    add constraint uk_vinculo_usuario_organizacao_papel
    unique (usuario_id, organizacao_id, papel);
