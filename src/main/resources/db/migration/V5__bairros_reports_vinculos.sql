create table bairros (
    id bigserial primary key,
    prefeitura_id bigint not null references organizacoes(id),
    nome varchar(100) not null,
    ativo boolean not null default true,
    criado_em timestamp with time zone not null default now(),
    atualizado_em timestamp with time zone not null default now(),
    constraint uk_bairros_prefeitura_nome unique (prefeitura_id, nome)
);

create index idx_bairros_prefeitura_nome on bairros(prefeitura_id, nome);
create index idx_bairros_prefeitura_ativo on bairros(prefeitura_id, ativo);

alter table sinalizacoes_denuncia
	rename column motivo to comentario;

alter table sinalizacoes_denuncia
	add column motivo varchar(40);

update sinalizacoes_denuncia
	set motivo = 'OUTRO'
	where motivo is null;

alter table sinalizacoes_denuncia
	alter column motivo set not null;

alter table sinalizacoes_denuncia
	add constraint ck_sinalizacoes_denuncia_motivo check (
		motivo in (
			'IMAGEM_INADEQUADA',
			'SPAM',
			'FAKE_NEWS',
			'CONTEUDO_OFENSIVO',
			'DADOS_PESSOAIS_EXPOSTOS',
			'DENUNCIA_DUPLICADA',
			'LOCALIZACAO_INCORRETA',
			'CATEGORIA_INCORRETA',
			'OUTRO'
		)
	);

alter table auditorias
	drop constraint ck_auditorias_acao;

alter table auditorias
	add constraint ck_auditorias_acao check (
		acao in (
			'USUARIO_CRIADO',
			'USUARIO_ATUALIZADO',
			'USUARIO_ATIVACAO_ALTERADA',
			'ORGANIZACAO_CRIADA',
			'ORGANIZACAO_ATUALIZADA',
			'ORGANIZACAO_ATIVACAO_ALTERADA',
			'USUARIO_INSTITUCIONAL_CRIADO',
			'BAIRRO_CRIADO',
			'BAIRRO_ATUALIZADO',
			'BAIRRO_ATIVACAO_ALTERADA',
			'CATEGORIA_CRIADA',
			'CATEGORIA_ATUALIZADA',
			'CATEGORIA_ATIVACAO_ALTERADA',
			'VINCULO_ATUALIZADO',
			'VINCULO_ORGANIZACAO_ALTERADA',
			'DENUNCIA_STATUS_ALTERADO',
			'DENUNCIA_CONCLUSAO_CONFIRMADA',
			'DENUNCIA_CONCLUSAO_CONTESTADA',
			'DENUNCIA_ARQUIVADA_MODERACAO',
			'COMENTARIO_REMOVIDO_MODERACAO',
			'USUARIO_ADVERTIDO_MODERACAO',
			'USUARIO_SUSPENSO_MODERACAO',
			'USUARIO_REATIVADO_MODERACAO',
			'SINALIZACAO_CRIADA',
			'SINALIZACAO_ANALISADA',
			'TRANSFERENCIA_SOLICITADA',
			'TRANSFERENCIA_APROVADA',
			'TRANSFERENCIA_RECUSADA',
			'RESPONSAVEL_DENUNCIA_ALTERADO',
			'EMAIL_VERIFICADO',
			'SENHA_REDEFINIDA'
		)
	);

alter table auditorias
	drop constraint ck_auditorias_alvo_tipo;

alter table auditorias
	add constraint ck_auditorias_alvo_tipo check (
		alvo_tipo in (
			'USUARIO',
			'ORGANIZACAO',
			'BAIRRO',
			'CATEGORIA',
			'VINCULO',
			'DENUNCIA',
			'COMENTARIO',
			'SINALIZACAO',
			'SOLICITACAO_TRANSFERENCIA'
		)
	);
