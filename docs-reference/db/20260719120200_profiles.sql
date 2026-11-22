-- ============================================================================
-- LEVEL UP — Migration 0003 : Profils utilisateurs
-- ============================================================================

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text,
  avatar_url text,
  bio text,
  role public.app_role not null default 'student',
  stripe_customer_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_role_idx on public.profiles (role);

create trigger trg_profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Création automatique du profil à l'inscription (Supabase Auth).
-- SECURITY DEFINER : la fonction s'exécute avec les droits du propriétaire
-- de la table (postgres), ce qui contourne RLS pour cette seule opération.
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Garde profiles.email synchronisé si l'email change côté Supabase Auth.
create or replace function public.handle_user_email_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email is distinct from old.email then
    update public.profiles set email = new.email, updated_at = now() where id = new.id;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_email_updated
  after update of email on auth.users
  for each row execute function public.handle_user_email_update();

-- ----------------------------------------------------------------------------
-- Fonction de sécurité centrale : l'utilisateur courant est-il admin ?
-- SECURITY DEFINER pour éviter toute récursion RLS sur public.profiles
-- (sans ça, une policy sur profiles qui appelle is_admin() qui relit
-- profiles déclencherait à nouveau la policy, etc.)
-- ----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Empêche un utilisateur non-admin de modifier son propre rôle, même s'il
-- passe par ailleurs les policies RLS de mise à jour de son profil.
create or replace function public.prevent_role_self_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- auth.uid() est NULL en dehors d'une session API authentifiée (ex : SQL
  -- Editor Supabase, script de migration, connexion directe service_role).
  -- On ne bloque que les changements de rôle effectués via l'API par un
  -- utilisateur authentifié qui n'est pas admin — ce qui laisse la porte
  -- ouverte pour promouvoir le tout premier admin en SQL direct.
  if new.role is distinct from old.role
     and auth.uid() is not null
     and not public.is_admin() then
    raise exception 'Seul un administrateur peut modifier le rôle d''un utilisateur';
  end if;
  return new;
end;
$$;

create trigger trg_prevent_role_self_update
  before update on public.profiles
  for each row execute function public.prevent_role_self_update();
