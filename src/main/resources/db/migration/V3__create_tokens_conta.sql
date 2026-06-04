alter table usuarios
	add column email_verificado boolean not null default false,
	add column email_verificado_em timestamp with time zone;

create table tokens_conta (
	id bigserial primary key,
	usuario_id bigint not null references usuarios(id),
	tipo varchar(40) not null,
	token_hash varchar(64) not null unique,
	expira_em timestamp with time zone not null,
	usado_em timestamp with time zone,
	criado_em timestamp with time zone not null default now()
);

create index idx_tokens_conta_usuario_tipo on tokens_conta(usuario_id, tipo);
create index idx_tokens_conta_expira_em on tokens_conta(expira_em);
