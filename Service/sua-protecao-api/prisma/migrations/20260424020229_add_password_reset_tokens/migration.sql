-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_hash_key" ON "password_reset_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_user_id_idx" ON "password_reset_tokens"("user_id");

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── NOTA DE DEPLOY ────────────────────────────────────────────────────────────
-- A partir desta migration, os refresh tokens passaram a ser armazenados como
-- hash SHA-256 em vez de texto puro. Tokens existentes no banco (texto puro)
-- são automaticamente invalidados após o deploy: quando o usuário apresentar o
-- token antigo, o sistema gera o hash, busca no banco e não encontra (não há
-- correspondência entre UUID e SHA-256(UUID)), retornando 401.
-- Os usuários precisarão fazer login novamente. Isso é o comportamento esperado.
--
-- Se necessário forçar logout de TODAS as sessões imediatamente:
--   DELETE FROM refresh_tokens;
-- Execute isso antes de subir a nova versão para evitar erros de busca.
