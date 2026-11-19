/*
# Setup: Bucket Storage et Policies pour les materials

## Summary
Crée le bucket Supabase Storage 'materials' et les policies RLS nécessaires
pour que les admins puissent uploader des fichiers et les élèves puissent les télécharger.

## Steps
1. Créer le bucket 'materials' (public)
2. Créer les policies RLS pour le bucket
3. S'assurer que la table 'materials' existe (voir migration 20261119000000_add_materials.sql)
*/

-- ============================================================
-- 1. Créer le bucket 'materials' via SQL (si possible)
--    ou via Supabase CLI: supabase storage bucket create materials --public-bucket
-- ============================================================

-- Note: Les buckets se créent via l'API REST ou la CLI, pas en SQL direct.
-- Commande CLI:
--   supabase storage bucket create materials --public-bucket

-- ============================================================
-- 2. Policies RLS pour le bucket 'materials'
--    À créer via le Dashboard Supabase > Storage > Policies:
--
--    Policy 1: "Public read materials"
--      Action: SELECT
--      Using: true
--
--    Policy 2: "Admins can upload"
--      Action: INSERT, UPDATE, DELETE
--      Using: EXISTS (
--        SELECT 1 FROM profiles
--        WHERE id = auth.uid() AND role = 'admin'
--      )
-- ============================================================

-- ============================================================
-- 3. Vérifier que la table materials existe
-- ============================================================

-- Si la migration n'a pas été appliquée, exécuter:
--   supabase db push
