-- HEKKA MARKET - Image URL Backfill Script (V2)
-- Run this in your Supabase SQL Editor to fix products missing display images

-- 1. Add the missing image_url column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='image_url') THEN
        ALTER TABLE public.products ADD COLUMN image_url TEXT;
    END IF;
END $$;

-- 2. Backfill missing values from product_images table
DO $$
DECLARE
    p_rec RECORD;
    v_storage_path TEXT;
    v_supabase_url TEXT := 'https://hwypnvbuklyzwbgavvvi.supabase.co'; -- Your project URL
    v_public_url TEXT;
BEGIN
    FOR p_rec IN 
        SELECT id FROM products WHERE image_url IS NULL OR image_url = ''
    LOOP
        -- Get the first image for this product
        SELECT storage_path INTO v_storage_path 
        FROM product_images 
        WHERE product_id = p_rec.id 
        ORDER BY display_order ASC, created_at ASC 
        LIMIT 1;

        IF v_storage_path IS NOT NULL THEN
            -- Construct the public URL
            v_public_url := v_supabase_url || '/storage/v1/object/public/product-images/' || v_storage_path;
            
            -- Update the product
            UPDATE products SET image_url = v_public_url WHERE id = p_rec.id;
            RAISE NOTICE 'Updated product % with image %', p_rec.id, v_public_url;
        END IF;
    END LOOP;
END $$;
