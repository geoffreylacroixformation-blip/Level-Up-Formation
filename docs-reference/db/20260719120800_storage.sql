-- ============================================================================
-- LEVEL UP — Migration 0009 : Buckets de stockage et policies
-- ============================================================================

insert into storage.buckets (id, name, public)
values
  ('course-covers', 'course-covers', true),
  ('avatars', 'avatars', true),
  ('module-resources', 'module-resources', false)
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- course-covers : lecture publique, écriture admin uniquement
-- ----------------------------------------------------------------------------
create policy "course_covers_public_read" on storage.objects
  for select using (bucket_id = 'course-covers');

create policy "course_covers_admin_write" on storage.objects
  for insert with check (bucket_id = 'course-covers' and public.is_admin());

create policy "course_covers_admin_update" on storage.objects
  for update using (bucket_id = 'course-covers' and public.is_admin());

create policy "course_covers_admin_delete" on storage.objects
  for delete using (bucket_id = 'course-covers' and public.is_admin());

-- ----------------------------------------------------------------------------
-- avatars : lecture publique, chaque utilisateur gère son propre dossier
-- (convention de chemin : {user_id}/nom-fichier.ext)
-- ----------------------------------------------------------------------------
create policy "avatars_public_read" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "avatars_owner_write" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_owner_update" on storage.objects
  for update using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_owner_delete" on storage.objects
  for delete using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ----------------------------------------------------------------------------
-- module-resources : privé. Accès en lecture uniquement si le module associé
-- est en aperçu gratuit ou si l'utilisateur y est inscrit. Écriture réservée
-- aux admins. Convention : module_resources.file_path == storage.objects.name
-- ----------------------------------------------------------------------------
create policy "module_resources_bucket_admin_all" on storage.objects
  for all
  using (bucket_id = 'module-resources' and public.is_admin())
  with check (bucket_id = 'module-resources' and public.is_admin());

create policy "module_resources_bucket_enrolled_read" on storage.objects
  for select using (
    bucket_id = 'module-resources'
    and exists (
      select 1
      from public.module_resources mr
      join public.modules m on m.id = mr.module_id
      where mr.file_path = storage.objects.name
        and (m.is_free_preview or public.is_enrolled(m.course_id))
    )
  );
