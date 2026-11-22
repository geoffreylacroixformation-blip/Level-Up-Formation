-- ============================================================================
-- LEVEL UP — Migration 0007 : Fonctions métier (recherche, promotions,
-- progression, statistiques admin)
-- ============================================================================

-- Recherche plein texte parmi les cours publiés (catalogue public).
create or replace function public.search_courses(p_query text)
returns setof public.courses
language sql
stable
as $$
  select c.*
  from public.courses c
  where c.status = 'published'
    and c.search_vector @@ websearch_to_tsquery('french', p_query)
  order by ts_rank(c.search_vector, websearch_to_tsquery('french', p_query)) desc;
$$;

-- Valide un code promo sans exposer la table promotions dans son ensemble
-- (évite qu'un utilisateur puisse lister tous les codes existants).
create or replace function public.check_promo_code(p_code text)
returns table (
  is_valid boolean,
  discount_type public.promotion_type,
  discount_value integer,
  message text
)
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_promo public.promotions%rowtype;
begin
  select * into v_promo
  from public.promotions
  where code = upper(trim(p_code)) and is_active = true;

  if not found then
    return query select false, null::public.promotion_type, null::integer, 'Code promo invalide';
    return;
  end if;

  if v_promo.starts_at is not null and v_promo.starts_at > now() then
    return query select false, null::public.promotion_type, null::integer, 'Ce code n''est pas encore actif';
    return;
  end if;

  if v_promo.ends_at is not null and v_promo.ends_at < now() then
    return query select false, null::public.promotion_type, null::integer, 'Ce code a expiré';
    return;
  end if;

  if v_promo.max_redemptions is not null and v_promo.times_redeemed >= v_promo.max_redemptions then
    return query select false, null::public.promotion_type, null::integer, 'Ce code a atteint sa limite d''utilisation';
    return;
  end if;

  return query select true, v_promo.discount_type, v_promo.discount_value, 'Code valide';
end;
$$;

-- Pourcentage de progression de l'utilisateur courant sur un cours donné.
create or replace function public.get_course_progress(p_course_id uuid)
returns numeric
language sql
security definer
set search_path = public
stable
as $$
  select case
    when count(m.id) = 0 then 0
    else round(100.0 * count(mp.id) filter (where mp.is_completed) / count(m.id), 2)
  end
  from public.modules m
  left join public.module_progress mp
    on mp.module_id = m.id and mp.user_id = auth.uid()
  where m.course_id = p_course_id;
$$;

-- Statistiques globales pour le dashboard admin.
create or replace function public.admin_dashboard_stats()
returns table (
  total_students bigint,
  total_courses bigint,
  published_courses bigint,
  total_enrollments bigint,
  total_revenue_cents bigint
)
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  if not public.is_admin() then
    raise exception 'Accès refusé : réservé aux administrateurs';
  end if;

  return query
  select
    (select count(*) from public.profiles where role = 'student'),
    (select count(*) from public.courses),
    (select count(*) from public.courses where status = 'published'),
    (select count(*) from public.enrollments),
    (select coalesce(sum(amount_total_cents), 0) from public.orders where status = 'paid');
end;
$$;

-- Statistiques par cours (inscriptions, revenu) pour le dashboard admin.
create or replace function public.admin_course_stats()
returns table (
  course_id uuid,
  title text,
  status public.course_status,
  total_enrollments bigint,
  total_revenue_cents bigint
)
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  if not public.is_admin() then
    raise exception 'Accès refusé : réservé aux administrateurs';
  end if;

  return query
  select
    c.id,
    c.title,
    c.status,
    count(distinct e.user_id),
    coalesce(sum(oi.unit_price_cents) filter (where o.status = 'paid'), 0)
  from public.courses c
  left join public.enrollments e on e.course_id = c.id
  left join public.order_items oi on oi.course_id = c.id
  left join public.orders o on o.id = oi.order_id
  group by c.id, c.title, c.status
  order by c.created_at desc;
end;
$$;
