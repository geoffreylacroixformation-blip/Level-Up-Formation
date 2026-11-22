-- ============================================================================
-- LEVEL UP — Migration 0004 : Cours, modules et ressources de modules
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Cours
-- ----------------------------------------------------------------------------
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  short_description text,
  description text,
  category_id uuid not null references public.categories (id) on delete restrict,
  level_id smallint not null references public.levels (id) on delete restrict,
  cover_image_url text,
  price_cents integer not null default 0,
  currency text not null default 'EUR',
  status public.course_status not null default 'draft',
  is_featured boolean not null default false,
  created_by uuid references public.profiles (id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search_vector tsvector generated always as (
    setweight(to_tsvector('french', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('french', coalesce(short_description, '')), 'B') ||
    setweight(to_tsvector('french', coalesce(description, '')), 'C')
  ) stored,
  constraint courses_slug_lowercase check (slug = lower(slug)),
  constraint courses_price_non_negative check (price_cents >= 0)
);

create index courses_category_idx on public.courses (category_id);
create index courses_level_idx on public.courses (level_id);
create index courses_status_idx on public.courses (status);
create index courses_search_idx on public.courses using gin (search_vector);

create trigger trg_courses_set_updated_at
  before update on public.courses
  for each row execute function public.set_updated_at();

create or replace function public.set_course_slug()
returns trigger
language plpgsql
as $$
begin
  if new.slug is null or trim(new.slug) = '' then
    new.slug := public.slugify(new.title);
  end if;
  return new;
end;
$$;

create trigger trg_courses_set_slug
  before insert on public.courses
  for each row execute function public.set_course_slug();

-- Renseigne published_at une seule fois, au premier passage en "published"
-- (que ce soit dès la création ou lors d'un update ultérieur).
create or replace function public.set_course_published_at()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'published' and new.published_at is null then
    if tg_op = 'INSERT' or old.status is distinct from 'published' then
      new.published_at := now();
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_courses_set_published_at
  before insert or update on public.courses
  for each row execute function public.set_course_published_at();

-- ----------------------------------------------------------------------------
-- Modules d'un cours
-- ----------------------------------------------------------------------------
create table public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  title text not null,
  slug text not null,
  description text,
  display_order integer not null default 0,
  is_free_preview boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint modules_slug_lowercase check (slug = lower(slug)),
  constraint modules_course_slug_unique unique (course_id, slug)
);

create index modules_course_order_idx on public.modules (course_id, display_order);

create trigger trg_modules_set_updated_at
  before update on public.modules
  for each row execute function public.set_updated_at();

create or replace function public.set_module_slug()
returns trigger
language plpgsql
as $$
begin
  if new.slug is null or trim(new.slug) = '' then
    new.slug := public.slugify(new.title);
  end if;
  return new;
end;
$$;

create trigger trg_modules_set_slug
  before insert on public.modules
  for each row execute function public.set_module_slug();

-- ----------------------------------------------------------------------------
-- Ressources d'un module : Markdown, PDF, Google Docs/Slides, images,
-- scripts Bash/PowerShell/Python, archives ZIP. Un module peut avoir
-- plusieurs ressources.
-- ----------------------------------------------------------------------------
create table public.module_resources (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules (id) on delete cascade,
  content_type public.module_content_type not null,
  title text not null,
  content text,
  file_path text,
  external_url text,
  is_downloadable boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint module_resources_content_check check (
    (content_type = 'markdown' and content is not null)
    or (content_type in ('google_docs', 'google_slides') and external_url is not null)
    or (content_type in ('pdf', 'image', 'bash_script', 'powershell_script', 'python_script', 'zip_archive') and file_path is not null)
  )
);

create index module_resources_module_order_idx on public.module_resources (module_id, display_order);

create trigger trg_module_resources_set_updated_at
  before update on public.module_resources
  for each row execute function public.set_updated_at();
