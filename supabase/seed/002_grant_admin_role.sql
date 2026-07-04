-- Seed: affecter le rôle admin à l'utilisateur géo
-- Récupère l'ID de l'utilisateur depuis auth.users par email
UPDATE users
SET role = 'admin'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'geoffreylacroixformation@gmail.com');