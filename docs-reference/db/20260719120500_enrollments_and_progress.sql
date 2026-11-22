-- ============================================================================
-- LEVEL UP — Migration 0006 : Inscriptions (accès) et suivi de progression
-- ============================================================================

-- Accès accordé à un utilisateur sur un cours (après paiement, ou attribution
-- manuelle par un admin).
create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete restrict,
  order_id uuid references public.orders (id) on delete set null,
  enrolled_at timestamptz not null default now(),
  constraint enrollments_user_course_unique unique (user_id, course_id)
);

create index enrollments_course_idx on public.enrollments (course_id);

-- L'utilisateur courant a-t-il accès à ce cours ? SECURITY DEFINER pour être
-- réutilisable dans les policies RLS d'autres tables (modules, storage...).
create or replace function public.is_enrolled(p_course_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.enrollments
    where course_id = p_course_id and user_id = auth.uid()
  );
$$;

-- Progression d'un utilisateur sur un module donné.
create table public.module_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  module_id uuid not null references public.modules (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  is_completed boolean not null default false,
  completed_at timestamptz,
  last_viewed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint module_progress_user_module_unique unique (user_id, module_id)
);

create index module_progress_user_course_idx on public.module_progress (user_id, course_id);
create index module_progress_module_idx on public.module_progress (module_id);

create or replace function public.set_module_progress_completed_at()
returns trigger
language plpgsql
as $$
begin
  if new.is_completed = true and new.completed_at is null then
    if tg_op = 'INSERT' or old.is_completed is distinct from true then
      new.completed_at := now();
    end if;
  elsif new.is_completed = false then
    new.completed_at := null;
  end if;
  return new;
end;
$$;

create trigger trg_module_progress_completed_at
  before insert or update on public.module_progress
  for each row execute function public.set_module_progress_completed_at();
