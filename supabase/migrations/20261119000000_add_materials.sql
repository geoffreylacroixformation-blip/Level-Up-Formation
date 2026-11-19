/*
# Migration: Table materials (ressources téléchargeables)

## Summary
Permet aux admins/formateurs d'uploader des fichiers (Google Docs, Slides, PDF, etc.)
liés à un cours, de les convertir en PDF avec filigrane, et de les proposer en téléchargement
aux élèves inscrits.

## Changes
1. Table `materials` avec colonnes:
   - `course_id` → FK vers `courses`
   - `title`, `description`
   - `file_type` (enum: google_docs, google_slides, pdf, docx, pptx, xlsx, zip, other)
   - `file_url` (URL du fichier original)
   - `pdf_url` (URL du PDF généré avec filigrane)
   - `original_filename`, `file_size`
   - `download_count`
   - `is_published`
   - `sort_order`
   - `created_at`, `updated_at`
   - `created_by` (FK vers profiles)
2. RLS policies: admins CRUD, public SELECT sur published
3. Trigger updated_at
4. Index pour les requêtes fréquentes
*/

-- Enum pour le type de fichier
DO $$ BEGIN
    CREATE TYPE filetype AS ENUM (
        'google_docs', 'google_slides', 'pdf', 'docx',
        'pptx', 'xlsx', 'zip', 'other'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Table materials
CREATE TABLE IF NOT EXISTS materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    file_type filetype NOT NULL DEFAULT 'other',
    file_url TEXT NOT NULL,
    pdf_url TEXT,
    original_filename TEXT,
    file_size BIGINT,
    download_count INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- RLS
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

-- Anyone can read published materials
CREATE POLICY "Materials published visibles par tous" ON materials
    FOR SELECT USING (is_published = true);

-- Only admins can manage materials
CREATE POLICY "Admins manage materials" ON materials
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Trigger updated_at
DROP TRIGGER IF EXISTS materials_updated_at ON materials;
CREATE TRIGGER materials_updated_at
    BEFORE UPDATE ON materials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Index
CREATE INDEX IF NOT EXISTS ix_materials_course_id ON materials(course_id);
CREATE INDEX IF NOT EXISTS ix_materials_is_published ON materials(is_published);
CREATE INDEX IF NOT EXISTS ix_materials_sort_order ON materials(sort_order);
