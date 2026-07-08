-- Seed: affecter le rôle admin à l'utilisateur géo
-- Récupère l'ID de l'utilisateur depuis auth.users par email
UPDATE profiles
SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'geoffreylacroixformation@gmail.com');