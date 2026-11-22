-- ============================================================================
-- LEVEL UP — Migration 0008 : Row Level Security (RLS)
-- ============================================================================

alter table public.categories enable row level security;
alter table public.levels enable row level security;
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.module_resources enable row level security;
alter table public.promotions enable row level security;
alter table public.promotion_courses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.enrollments enable row level security;
alter table public.module_progress enable row level security;

-- ----------------------------------------------------------------------------
-- categories : lecture publique (catalogue), écriture admin uniquement
-- ----------------------------------------------------------------------------
create policy "categories_select_all" on public.categories
  for select using (true);

create policy "categories_admin_insert" on public.categories
  for insert with check (public.is_admin());

create policy "categories_admin_update" on public.categories
  for update using (public.is_admin()) with check (public.is_admin());

create policy "categories_admin_delete" on public.categories
  for delete using (public.is_admin());

-- ----------------------------------------------------------------------------
-- levels : lecture publique, écriture admin uniquement
-- ----------------------------------------------------------------------------
create policy "levels_select_all" on public.levels
  for select using (true);

create policy "levels_admin_insert" on public.levels
  for insert with check (public.is_admin());

create policy "levels_admin_update" on public.levels
  for update using (public.is_admin()) with check (public.is_admin());

create policy "levels_admin_delete" on public.levels
  for delete using (public.is_admin());

-- ----------------------------------------------------------------------------
-- profiles : chacun voit/modifie son propre profil ; l'admin voit/modifie
-- tout. Le rôle est protégé séparément par un trigger (migration 0003).
-- Pas de policy INSERT : la création passe uniquement par le trigger
-- handle_new_user() (SECURITY DEFINER) sur auth.users.
-- ----------------------------------------------------------------------------
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

create policy "profiles_update_own_or_admin" on public.profiles
  for update using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

create policy "profiles_admin_delete" on public.profiles
  for delete using (public.is_admin());

-- ----------------------------------------------------------------------------
-- courses : cours publiés visibles par tous ; un inscrit garde l'accès même
-- si le cours change de statut ensuite ; l'admin voit tout, tout statut
-- ----------------------------------------------------------------------------
create policy "courses_select" on public.courses
  for select using (
    status = 'published'
    or public.is_admin()
    or public.is_enrolled(id)
  );

create policy "courses_admin_insert" on public.courses
  for insert with check (public.is_admin());

create policy "courses_admin_update" on public.courses
  for update using (public.is_admin()) with check (public.is_admin());

create policy "courses_admin_delete" on public.courses
  for delete using (public.is_admin());

-- ----------------------------------------------------------------------------
-- modules : visibles si le cours est publié ET (aperçu gratuit OU inscrit) ;
-- l'admin voit tout
-- ----------------------------------------------------------------------------
create policy "modules_select" on public.modules
  for select using (
    public.is_admin()
    or (
      exists (select 1 from public.courses c where c.id = modules.course_id and c.status = 'published')
      and (is_free_preview or public.is_enrolled(course_id))
    )
  );

create policy "modules_admin_insert" on public.modules
  for insert with check (public.is_admin());

create policy "modules_admin_update" on public.modules
  for update using (public.is_admin()) with check (public.is_admin());

create policy "modules_admin_delete" on public.modules
  for delete using (public.is_admin());

-- ----------------------------------------------------------------------------
-- module_resources : hérite de la visibilité du module parent
-- ----------------------------------------------------------------------------
create policy "module_resources_select" on public.module_resources
  for select using (
    public.is_admin()
    or exists (
      select 1
      from public.modules m
      join public.courses c on c.id = m.course_id
      where m.id = module_resources.module_id
        and c.status = 'published'
        and (m.is_free_preview or public.is_enrolled(m.course_id))
    )
  );

create policy "module_resources_admin_insert" on public.module_resources
  for insert with check (public.is_admin());

create policy "module_resources_admin_update" on public.module_resources
  for update using (public.is_admin()) with check (public.is_admin());

create policy "module_resources_admin_delete" on public.module_resources
  for delete using (public.is_admin());

-- ----------------------------------------------------------------------------
-- promotions / promotion_courses : réservé aux admins. La validation d'un
-- code côté client passe par check_promo_code(), pas par un accès direct à
-- la table (qui exposerait tous les codes existants).
-- ----------------------------------------------------------------------------
create policy "promotions_admin_select" on public.promotions
  for select using (public.is_admin());

create policy "promotions_admin_insert" on public.promotions
  for insert with check (public.is_admin());

create policy "promotions_admin_update" on public.promotions
  for update using (public.is_admin()) with check (public.is_admin());

create policy "promotions_admin_delete" on public.promotions
  for delete using (public.is_admin());

create policy "promotion_courses_admin_select" on public.promotion_courses
  for select using (public.is_admin());

create policy "promotion_courses_admin_insert" on public.promotion_courses
  for insert with check (public.is_admin());

create policy "promotion_courses_admin_delete" on public.promotion_courses
  for delete using (public.is_admin());

-- ----------------------------------------------------------------------------
-- orders / order_items : chacun voit ses propres commandes ; admin voit tout.
-- Écriture réservée au service_role (Edge Functions Stripe, contourne RLS)
-- et aux admins pour les opérations de support (ex : marquer "refunded").
-- ----------------------------------------------------------------------------
create policy "orders_select_own_or_admin" on public.orders
  for select using (user_id = auth.uid() or public.is_admin());

create policy "orders_admin_update" on public.orders
  for update using (public.is_admin()) with check (public.is_admin());

create policy "order_items_select_own_or_admin" on public.order_items
  for select using (
    public.is_admin()
    or exists (select 1 from public.orders o where o.id = order_items.order_id and o.user_id = auth.uid())
  );

-- ----------------------------------------------------------------------------
-- enrollments : chacun voit ses propres inscriptions ; admin gère tout
-- (attribution manuelle d'accès gratuit, révocation)
-- ----------------------------------------------------------------------------
create policy "enrollments_select_own_or_admin" on public.enrollments
  for select using (user_id = auth.uid() or public.is_admin());

create policy "enrollments_admin_insert" on public.enrollments
  for insert with check (public.is_admin());

create policy "enrollments_admin_delete" on public.enrollments
  for delete using (public.is_admin());

-- ----------------------------------------------------------------------------
-- module_progress : chacun gère sa propre progression sur les modules
-- auxquels il a accès ; admin peut consulter (dashboard) mais pas modifier
-- ----------------------------------------------------------------------------
create policy "module_progress_select_own_or_admin" on public.module_progress
  for select using (user_id = auth.uid() or public.is_admin());

create policy "module_progress_insert_own" on public.module_progress
  for insert with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.modules m
      where m.id = module_id
        and (m.is_free_preview or public.is_enrolled(m.course_id))
    )
  );

create policy "module_progress_update_own" on public.module_progress
  for update using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "module_progress_delete_own" on public.module_progress
  for delete using (user_id = auth.uid());

-- ============================================================================
-- GRANTS
-- Les GRANTs autorisent le type d'opération ; les policies RLS ci-dessus
-- filtrent ensuite les lignes réellement accessibles. Le rôle service_role
-- (Edge Functions, webhooks Stripe) contourne RLS par défaut sur Supabase et
-- n'a donc pas besoin de policies ni de grants dédiés.
-- ============================================================================

grant usage on schema public to anon, authenticated;

-- Catalogue public (lecture)
grant select on public.categories to anon, authenticated;
grant select on public.levels to anon, authenticated;
grant select on public.courses to anon, authenticated;
grant select on public.modules to anon, authenticated;
grant select on public.module_resources to anon, authenticated;

-- Gestion admin du catalogue et des données de référence (filtrée par RLS)
grant insert, update, delete on public.categories to authenticated;
grant insert, update, delete on public.levels to authenticated;
grant insert, update, delete on public.courses to authenticated;
grant insert, update, delete on public.modules to authenticated;
grant insert, update, delete on public.module_resources to authenticated;

-- Profils
grant select, update, delete on public.profiles to authenticated;

-- Commerce
grant select, insert, update, delete on public.promotions to authenticated;
grant select, insert, delete on public.promotion_courses to authenticated;
grant select, update on public.orders to authenticated;
grant select on public.order_items to authenticated;

-- Accès et progression
grant select, insert, delete on public.enrollments to authenticated;
grant select, insert, update, delete on public.module_progress to authenticated;

-- Fonctions
grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.is_enrolled(uuid) to anon, authenticated;
grant execute on function public.slugify(text) to authenticated;
grant execute on function public.search_courses(text) to anon, authenticated;
grant execute on function public.check_promo_code(text) to anon, authenticated;
grant execute on function public.get_course_progress(uuid) to authenticated;
grant execute on function public.admin_dashboard_stats() to authenticated;
grant execute on function public.admin_course_stats() to authenticated;
