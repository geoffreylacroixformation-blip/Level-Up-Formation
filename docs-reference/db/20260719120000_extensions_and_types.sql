-- ============================================================================
-- LEVEL UP — Migration 0001 : Extensions & types
-- Active les extensions PostgreSQL nécessaires et définit les types énumérés
-- et fonctions utilitaires génériques utilisés dans tout le schéma.
-- ============================================================================

-- gen_random_uuid() est native depuis PostgreSQL 13, mais on active pgcrypto
-- par convention / compatibilité (digest, crypt, etc. si besoin plus tard).
create extension if not exists pgcrypto;

-- Permet de retirer les accents (ex: "Réseaux" -> "Reseaux") pour générer des
-- slugs propres à partir de titres en français.
create extension if not exists unaccent;

-- ----------------------------------------------------------------------------
-- Types énumérés
-- ----------------------------------------------------------------------------

create type public.app_role as enum ('student', 'admin');

create type public.course_status as enum ('draft', 'published', 'unpublished', 'archived');

create type public.module_content_type as enum (
  'markdown',
  'pdf',
  'google_docs',
  'google_slides',
  'image',
  'bash_script',
  'powershell_script',
  'python_script',
  'zip_archive'
);

create type public.order_status as enum ('pending', 'paid', 'failed', 'refunded', 'cancelled');

create type public.promotion_type as enum ('percentage', 'fixed_amount');

-- ----------------------------------------------------------------------------
-- Fonctions utilitaires génériques
-- ----------------------------------------------------------------------------

-- Met à jour automatiquement la colonne updated_at sur chaque UPDATE.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Génère un slug URL-friendly à partir d'un texte, en gérant les accents
-- français (é, è, à, ç, ...). STABLE (et non IMMUTABLE) car unaccent()
-- dépend du dictionnaire de recherche configuré.
create or replace function public.slugify(p_text text)
returns text
language sql
stable
as $$
  select trim(both '-' from
    regexp_replace(
      lower(unaccent(coalesce(p_text, ''))),
      '[^a-z0-9]+', '-', 'g'
    )
  );
$$;
