-- ============================================================================
-- LEVEL UP — Migration 0005 : Offres commerciales, commandes et paiement Stripe
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Promotions / codes promo
-- ----------------------------------------------------------------------------
create table public.promotions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,
  discount_type public.promotion_type not null,
  discount_value integer not null,
  applies_to_all_courses boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  max_redemptions integer,
  times_redeemed integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint promotions_dates_check check (ends_at is null or starts_at is null or ends_at > starts_at),
  constraint promotions_max_redemptions_positive check (max_redemptions is null or max_redemptions > 0),
  constraint promotions_discount_value_check check (
    (discount_type = 'percentage' and discount_value between 1 and 100)
    or (discount_type = 'fixed_amount' and discount_value > 0)
  )
);

create trigger trg_promotions_set_updated_at
  before update on public.promotions
  for each row execute function public.set_updated_at();

create or replace function public.normalize_promo_code()
returns trigger
language plpgsql
as $$
begin
  new.code := upper(trim(new.code));
  return new;
end;
$$;

create trigger trg_promotions_normalize_code
  before insert or update on public.promotions
  for each row execute function public.normalize_promo_code();

-- Association entre une promotion ciblée et des cours spécifiques,
-- utilisée uniquement quand applies_to_all_courses = false.
create table public.promotion_courses (
  promotion_id uuid not null references public.promotions (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  primary key (promotion_id, course_id)
);

create index promotion_courses_course_idx on public.promotion_courses (course_id);

-- ----------------------------------------------------------------------------
-- Commandes (paiement Stripe).
-- IMPORTANT : ces lignes sont créées/mises à jour côté serveur (Edge Function
-- avec la clé service_role, qui contourne RLS) une fois le paiement Stripe
-- confirmé. Le prix ne doit jamais être déterminé par le client.
-- ----------------------------------------------------------------------------
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete restrict,
  status public.order_status not null default 'pending',
  amount_total_cents integer not null default 0,
  currency text not null default 'EUR',
  promotion_id uuid references public.promotions (id) on delete set null,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  paid_at timestamptz,
  constraint orders_amount_non_negative check (amount_total_cents >= 0)
);

create index orders_user_idx on public.orders (user_id);
create index orders_status_idx on public.orders (status);

create trigger trg_orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete restrict,
  unit_price_cents integer not null,
  created_at timestamptz not null default now(),
  constraint order_items_price_non_negative check (unit_price_cents >= 0),
  constraint order_items_order_course_unique unique (order_id, course_id)
);

create index order_items_course_idx on public.order_items (course_id);
