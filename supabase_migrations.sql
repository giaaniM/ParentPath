-- Esegui questo script nel SQL Editor di Supabase per configurare o resettare il DB

-- 1. Tabella PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    role TEXT,
    birth_date DATE,
    active_pregnancy_id UUID,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    avatar_url TEXT
);

-- 2. Tabella PREGNANCIES
CREATE TABLE IF NOT EXISTS public.pregnancies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    partner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    baby_name TEXT,
    baby_sex TEXT,
    status TEXT DEFAULT 'gravidanza',
    conception_date DATE,
    invite_code VARCHAR(10) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Creazione dell'indice per velocizzare le ricerche del codice invito
CREATE INDEX IF NOT EXISTS idx_pregnancies_invite_code ON public.pregnancies(invite_code);

-- Policy per PREGNANCIES (Resettate)
ALTER TABLE public.pregnancies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Utenti possono vedere la propria gravidanza condivisa" ON public.pregnancies;
CREATE POLICY "Utenti possono vedere la propria gravidanza condivisa"
ON public.pregnancies FOR SELECT
USING (auth.uid() = creator_id OR auth.uid() = partner_id);

DROP POLICY IF EXISTS "Utenti possono aggiornare la propria gravidanza condivisa" ON public.pregnancies;
CREATE POLICY "Utenti possono aggiornare la propria gravidanza condivisa"
ON public.pregnancies FOR UPDATE
USING (auth.uid() = creator_id OR auth.uid() = partner_id);

DROP POLICY IF EXISTS "Utenti possono creare gravidanze" ON public.pregnancies;
CREATE POLICY "Utenti possono creare gravidanze"
ON public.pregnancies FOR INSERT
WITH CHECK (auth.uid() = creator_id);

-- 3. Tabella NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Colonne per dati condivisi tra partner
ALTER TABLE public.pregnancies ADD COLUMN IF NOT EXISTS shared_notes JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.pregnancies ADD COLUMN IF NOT EXISTS shared_appointments JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.pregnancies ADD COLUMN IF NOT EXISTS shared_custom_tasks JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.pregnancies ADD COLUMN IF NOT EXISTS shared_completed_tasks JSONB DEFAULT '{}'::jsonb;

-- Funzione RPC per preview codice invito (accessibile anche da utenti anonimi)
-- SECURITY DEFINER bypassa RLS — restituisce solo i dati necessari per la preview
DROP FUNCTION IF EXISTS public.preview_invite_code(text);
CREATE OR REPLACE FUNCTION public.preview_invite_code(code text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  preg record;
  creator record;
  week_info text;
  diff_weeks int;
BEGIN
  SELECT id, creator_id, partner_id, baby_name, baby_sex, conception_date, status
  INTO preg
  FROM pregnancies
  WHERE invite_code = upper(trim(code))
  LIMIT 1;

  IF preg IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Codice non valido o scaduto.');
  END IF;

  SELECT name, role, birth_date INTO creator FROM profiles WHERE id = preg.creator_id;

  IF preg.conception_date IS NOT NULL THEN
    diff_weeks := GREATEST(0, EXTRACT(day FROM now() - preg.conception_date)::int / 7);
    IF preg.status = 'nato' THEN
      week_info := 'Bimbo di ' || GREATEST(1, (diff_weeks - 40) / 4)::text || ' mesi';
    ELSE
      week_info := 'Settimana ' || LEAST(diff_weeks, 42)::text;
    END IF;
  END IF;

  RETURN json_build_object(
    'success', true,
    'pregnancyId', preg.id,
    'babyName', preg.baby_name,
    'babySex', preg.baby_sex,
    'status', preg.status,
    'weekInfo', week_info,
    'creatorId', preg.creator_id,
    'partnerId', preg.partner_id,
    'creator', json_build_object(
      'name', creator.name,
      'role', creator.role,
      'birth_date', creator.birth_date
    )
  );
END;
$$;

-- Permetti esecuzione anche agli utenti anonimi
GRANT EXECUTE ON FUNCTION public.preview_invite_code(text) TO anon;
GRANT EXECUTE ON FUNCTION public.preview_invite_code(text) TO authenticated;

-- Policy per NOTIFICATIONS (Resettate)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Utenti vedono le proprie notifiche" ON public.notifications;
CREATE POLICY "Utenti vedono le proprie notifiche"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Utenti possono aggiornare le proprie notifiche" ON public.notifications;
CREATE POLICY "Utenti possono aggiornare le proprie notifiche"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Utenti possono inviare notifiche" ON public.notifications;
CREATE POLICY "Utenti possono inviare notifiche"
ON public.notifications FOR INSERT
WITH CHECK (true);


-- ── NUOVE FEATURE: TRACCIAMENTO PESO E SINTOMI ──────────────────────────────
-- Aggiunta colonne a profiles per dati personali mamma (non condivisi con partner)

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS weight_logs  JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS symptoms_log JSONB DEFAULT '[]'::jsonb;

-- Commento esplicativo
COMMENT ON COLUMN public.profiles.weight_logs  IS 'Storico pesi mamma: [{id, date, value, unit}]';
COMMENT ON COLUMN public.profiles.symptoms_log IS 'Storico sintomi mamma: [{id, date, week, symptom, intensity, note}]';
