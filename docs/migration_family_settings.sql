-- ==========================================
-- MIGRATION: family_settings table
-- Run this on Supabase SQL Editor
-- ==========================================

-- FAMILY_SETTINGS (Single-row global settings)
CREATE TABLE IF NOT EXISTS public.family_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  default_root_id UUID REFERENCES public.persons(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_family_settings_default_root ON public.family_settings(default_root_id);

-- RLS
ALTER TABLE public.family_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read settings" ON public.family_settings;
CREATE POLICY "Authenticated users can read settings" ON public.family_settings FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can manage settings" ON public.family_settings;
DROP POLICY IF EXISTS "Admins and Editors can manage settings" ON public.family_settings;
CREATE POLICY "Admins and Editors can manage settings" ON public.family_settings FOR ALL TO authenticated USING (public.is_admin() OR public.is_editor());

-- Trigger
DROP TRIGGER IF EXISTS tr_family_settings_updated_at ON public.family_settings;
CREATE TRIGGER tr_family_settings_updated_at BEFORE UPDATE ON public.family_settings FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Seed initial row (single-row table pattern)
INSERT INTO public.family_settings (id) VALUES (gen_random_uuid())
ON CONFLICT DO NOTHING;
