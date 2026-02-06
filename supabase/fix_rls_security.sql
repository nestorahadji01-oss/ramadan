-- =============================================
-- FIX RLS SECURITY FOR NIYYAH APP
-- Run this in Supabase SQL Editor
-- =============================================

-- ===================
-- 1. ACTIVATION_CODES TABLE
-- ===================

-- Enable RLS
ALTER TABLE public.activation_codes ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to read codes (needed for verification)
CREATE POLICY "Allow public read access for verification"
ON public.activation_codes
FOR SELECT
USING (true);

-- Policy: Only service role can insert/update/delete
-- (Admin operations via server-side API)
CREATE POLICY "Service role full access"
ON public.activation_codes
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- ===================
-- 2. EBOOKS TABLE
-- ===================

-- Enable RLS
ALTER TABLE public.ebooks ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to read ebooks (public library)
CREATE POLICY "Allow public read access to ebooks"
ON public.ebooks
FOR SELECT
USING (true);

-- Policy: Only service role can manage ebooks
CREATE POLICY "Service role manages ebooks"
ON public.ebooks
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- =============================================
-- VERIFICATION: Check RLS is enabled
-- =============================================
-- Run this to verify:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
