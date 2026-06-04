# Alteracao 038 - Integracao dos Fluxos Publicos do Front

Data: 2026-06-02

## Objetivo

Conectar as telas publicas iniciais do front ao backend real, removendo simulacoes de cadastro e recuperacao de senha.

## O que foi alterado

- Criado `front/src/app/services/organizacaoService.ts`.
- Criado `front/src/app/services/contaService.ts`.
- Criado `front/src/app/types/organizacao.ts`.
- Atualizado `front/src/app/services/authService.ts` para incluir cadastro de morador.
- Atualizado `front/src/app/types/auth.ts` com `CadastroMoradorRequestDTO`.
- Refatorada `RegisterPage`.
- Refatorada `ForgotPasswordPage`.
- Criada `ResetPasswordPage`.
- Criada `VerifyEmailPage`.
- Atualizado `App.tsx` com rotas:
  - `/redefinir-senha`;
  - `/verificar-email`.

## Cadastro de morador

A tela de cadastro deixou de usar cidades mockadas.

Novo fluxo:

1. Carrega prefeituras ativas com `GET /api/organizacoes/prefeituras`.
2. Usuario seleciona cidade/prefeitura.
3. Front carrega bairros ativos com `GET /api/prefeituras/{prefeituraId}/bairros/ativos`.
4. Usuario seleciona bairro.
5. Front envia `POST /api/auth/cadastro-morador`.

Payload enviado:

```json
{
  "nome": "Maria Silva",
  "email": "maria@example.com",
  "username": "maria_silva",
  "senha": "senha-segura",
  "telefone": "83999990000",
  "cidade": "Joao Pessoa",
  "bairro": "Centro"
}
```

## Recuperacao de senha

`ForgotPasswordPage` agora chama:

- `POST /api/conta/recuperacao-senha/solicitacao`.

Foi criada a tela:

- `/redefinir-senha?token=...`

Ela chama:

- `POST /api/conta/recuperacao-senha/redefinicao`.

## Confirmacao de e-mail

Foi criada a tela:

- `/verificar-email?token=...`

Ela chama:

- `POST /api/conta/verificacao-email/confirmacao`.

Essa rota bate com o link gerado pelo backend em modo local/dev.

## Validacao

Executado:

```bash
npm.cmd run build
```

Resultado:

- build concluido com sucesso;
- permaneceu apenas o aviso do Vite sobre chunk maior que 500 KB.

## Pendencias conscientes

- O cadastro agora depende de bairros ativos cadastrados para a prefeitura. Se a prefeitura nao tiver bairros, o usuario nao consegue concluir o cadastro naquela cidade.
- A proxima etapa deve integrar o feed real do morador, substituindo `mockReports`.
- Ainda falta integrar nova denuncia, detalhe, comentarios, anexos, apoio/urgencia, sinalizacao e confirmacao/contestacao de conclusao.
