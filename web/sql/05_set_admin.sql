-- =============================================
-- SQL 05: Definir usuario como ADMIN
-- Rodar POR ULTIMO, depois de criar sua conta
--
-- INSTRUCOES:
-- 1. Primeiro, crie sua conta pelo site (register)
-- 2. Depois, rode esse SQL substituindo SEU_EMAIL
-- =============================================

-- Encontrar o ID do usuario pelo email e definir como admin
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"userrole": "ADMIN", "claims_admin": true}'::jsonb
WHERE email = 'SEU_EMAIL_AQUI';

-- Verificar se funcionou (deve retornar o email e as claims)
SELECT id, email, raw_app_meta_data
FROM auth.users
WHERE email = 'SEU_EMAIL_AQUI';
