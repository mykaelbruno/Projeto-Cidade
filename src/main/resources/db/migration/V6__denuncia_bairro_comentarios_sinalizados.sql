alter table bairros
	add column centroide_latitude double precision,
	add column centroide_longitude double precision;

alter table denuncias
	add column prefeitura_id bigint references organizacoes(id),
	add column bairro_id bigint references bairros(id);

create index idx_denuncias_prefeitura on denuncias(prefeitura_id);
create index idx_denuncias_bairro_id on denuncias(bairro_id);

update denuncias d
	set prefeitura_id = o.id
from organizacoes o
where d.prefeitura_id is null
	and o.tipo = 'PREFEITURA'
	and lower(o.cidade) = lower(d.cidade);

update denuncias d
	set bairro_id = b.id
from bairros b
where d.bairro_id is null
	and d.prefeitura_id = b.prefeitura_id
	and lower(d.bairro) = lower(b.nome);

alter table sinalizacoes_denuncia
	add column comentario_id bigint references comentarios(id);

create index idx_sinalizacoes_denuncia_comentario on sinalizacoes_denuncia(comentario_id);

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
			'COMENTARIO_REMOVIDO_AUTOR',
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
