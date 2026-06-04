alter table moderacoes
	add column usuario_alvo_id bigint references usuarios(id),
	add column acao_usuario varchar(30);

alter table moderacoes
	drop constraint ck_moderacoes_tipo_alvo;

alter table moderacoes
	add constraint ck_moderacoes_tipo_alvo check (tipo_alvo in ('DENUNCIA', 'COMENTARIO', 'USUARIO'));

alter table moderacoes
	drop constraint ck_moderacoes_alvo;

alter table moderacoes
	add constraint ck_moderacoes_alvo check (
		(tipo_alvo = 'DENUNCIA'
			and denuncia_id is not null
			and comentario_id is null
			and usuario_alvo_id is null
			and acao_usuario is null)
		or (tipo_alvo = 'COMENTARIO'
			and denuncia_id is not null
			and comentario_id is not null
			and usuario_alvo_id is null
			and acao_usuario is null)
		or (tipo_alvo = 'USUARIO'
			and denuncia_id is null
			and comentario_id is null
			and usuario_alvo_id is not null
			and acao_usuario in ('ADVERTENCIA', 'SUSPENSAO', 'REATIVACAO'))
	);

create index idx_moderacoes_usuario_alvo on moderacoes(usuario_alvo_id);

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
			'CATEGORIA_CRIADA',
			'CATEGORIA_ATUALIZADA',
			'CATEGORIA_ATIVACAO_ALTERADA',
			'VINCULO_ATUALIZADO',
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
