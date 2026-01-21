-- HEKKAMARKET: STANDARD AUTH FIX (V10)
-- Reverting to standard auth.jwt() helpers for maximum compatibility.
-- Run this in your Supabase SQL Editor.

--------------------------------------------------------------------------------
-- 1. DYNAMICALLY WIPE ALL POLICIES
--------------------------------------------------------------------------------
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

--------------------------------------------------------------------------------
-- 2. REBUILD BASE SECURITY (Profiles)
--------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles viewable by all" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (id = (auth.jwt() ->> 'sub'));

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (id = (auth.jwt() ->> 'sub'));

--------------------------------------------------------------------------------
-- 3. REBUILD PRODUCTS SECURITY
--------------------------------------------------------------------------------
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public products viewable by all" 
ON public.products FOR SELECT USING (is_published = true);

CREATE POLICY "Sellers can manage own products" 
ON public.products FOR ALL 
USING (seller_id = (auth.jwt() ->> 'sub'))
WITH CHECK (seller_id = (auth.jwt() ->> 'sub'));

--------------------------------------------------------------------------------
-- 4. REBUILD IMAGES & MESSAGES
--------------------------------------------------------------------------------
-- Images
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public image visibility" ON public.product_images FOR SELECT 
USING (exists (select 1 from public.products where products.id = product_id and products.is_published = true));
CREATE POLICY "Owners manage images" ON public.product_images FOR ALL
USING (exists (select 1 from public.products where products.id = product_id and products.seller_id = (auth.jwt() ->> 'sub')));

-- Messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage messages" ON public.messages FOR ALL 
USING ((auth.jwt() ->> 'sub') IN (sender_id, recipient_id));

--------------------------------------------------------------------------------
-- 5. PURCHASES & CATEGORIES
--------------------------------------------------------------------------------
-- Purchases
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Access relevant purchases" ON public.purchases FOR SELECT 
USING (
  buyer_id = (auth.jwt() ->> 'sub') OR 
  exists (select 1 from public.products where products.id = product_id and products.seller_id = (auth.jwt() ->> 'sub'))
);

-- Categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories viewable by all" ON public.categories FOR SELECT USING (true);
