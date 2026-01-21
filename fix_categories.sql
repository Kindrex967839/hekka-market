-- HEKKAMARKET: Fix Categories & Restore Visibility
-- Run this in your Supabase SQL Editor

-- 1. Ensure RLS is enabled on categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 2. Restore public read access (which was dropped in the nuclear wipe)
DROP POLICY IF EXISTS "Categories are viewable by everyone." ON public.categories;
CREATE POLICY "Categories are viewable by everyone." 
ON public.categories FOR SELECT USING (true);

-- 3. Re-seed categories if they were deleted or missing
-- We use 'ON CONFLICT DO NOTHING' to avoid errors if they already exist
INSERT INTO public.categories (name, description) VALUES
('Digital Art', 'Digital artwork, illustrations, and designs'),
('Templates', 'Website templates, document templates, and design templates'),
('E-books', 'Digital books, guides, and educational materials'),
('Software', 'Applications, plugins, and software tools'),
('Music', 'Audio tracks, sound effects, and music files'),
('Courses', 'Online courses, tutorials, and educational content'),
('Photography', 'Stock photos, photo packs, and digital photography'),
('Graphics', 'Icons, UI elements, and graphic design assets')
ON CONFLICT (name) DO NOTHING;
