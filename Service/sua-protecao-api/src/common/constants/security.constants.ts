export const BCRYPT_ROUNDS = 12;
export const REFRESH_TOKEN_TTL_DAYS = 7;
export const PASSWORD_RESET_TTL_MINUTES = 30;

/**
 * Hash pré-computado usado para equalizar o tempo de resposta do login
 * quando o e-mail não existe — previne enumeração de usuários por timing.
 * Gerado com: bcrypt.hash('sentinel', 12)
 */
export const TIMING_SAFE_DUMMY_HASH =
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeDArKeJz5d3G1Fu';
