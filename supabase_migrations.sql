-- Esegui questo script nel SQL Editor di Supabase

-- 1. Tabella PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    role TEXT,
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

-- Policy per PREGNANCIES
ALTER TABLE public.pregnancies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Utenti possono vedere la propria gravidanza condivisa"
ON public.pregnancies FOR SELECT
USING (auth.uid() = creator_id OR auth.uid() = partner_id);

CREATE POLICY "Utenti possono aggiornare la propria gravidanza condivisa"
ON public.pregnancies FOR UPDATE
USING (auth.uid() = creator_id OR auth.uid() = partner_id);

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

-- Policy per NOTIFICATIONS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Utenti vedono le proprie notifiche"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Utenti possono aggiornare le proprie notifiche"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Utenti possono inviare notifiche"
ON public.notifications FOR INSERT
WITH CHECK (true);

