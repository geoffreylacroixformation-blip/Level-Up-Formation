-- ============================================================================
-- LEVEL UP — Migration 0002 : Tables de référence (catégories & niveaux)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Catégories (Systèmes, Réseaux, Cybersécurité, Intelligence Artificielle, ...)
-- Table dynamique : l'admin peut en ajouter d'autres sans migration, comme
-- demandé par l'architecture fonctionnelle.
-- ----------------------------------------------------------------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  icon text,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint categories_slug_lowercase check (slug = lower(slug))
);

create index categories_display_order_idx on public.categories (display_order);

create trigger trg_categories_set_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

create or replace function public.set_category_slug()
returns trigger
language plpgsql
as $$
begin
  if new.slug is null or trim(new.slug) = '' then
    new.slug := public.slugify(new.name);
  end if;
  return new;
end;
$$;

create trigger trg_categories_set_slug
  before insert on public.categories
  for each row execute function public.set_category_slug();

-- ----------------------------------------------------------------------------
-- Niveaux (Level 1, Level 2, Level 3) : ensemble fixe à 3 valeurs, décrit
-- explicitement dans l'architecture fonctionnelle. Table plutôt qu'un enum
-- pour permettre à l'admin d'éditer les libellés/descriptions sans migration.
-- ----------------------------------------------------------------------------
create table public.levels (
  id smallint primary key,
  name text not null unique,
  label text not null,
  description text,
  constraint levels_id_range check (id between 1 and 3)
);

comment on table public.levels is 'Ensemble fixe des 3 niveaux définis par l''architecture fonctionnelle Level Up.';

insert into public.levels (id, name, label, description) values
  (1, 'Level 1', 'Découverte', 'Le cours permet d''apprendre les bases.'),
  (2, 'Level 2', 'Approfondissement', 'Le cours permet de devenir autonome.'),
  (3, 'Level 3', 'Expert', 'Le cours permet de maîtriser complètement une technologie.')
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- Données de référence initiales : catégories du MVP
-- ----------------------------------------------------------------------------
insert into public.categories (name, slug, display_order) values
  ('Systèmes', 'systemes', 1),
  ('Réseaux', 'reseaux', 2),
  ('Cybersécurité', 'cybersecurite', 3),
  ('Intelligence Artificielle', 'intelligence-artificielle', 4)
on conflict (name) do nothing;
