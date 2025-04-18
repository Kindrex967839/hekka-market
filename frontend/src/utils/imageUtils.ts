import { supabase } from './supabaseClient';
import { getProductImages } from './supabaseUtils';

/**
 * Get the primary image URL for a product
 * @param productId The product ID
 * @returns The URL of the primary image or null if no images are found
 */
export const getProductImageUrl = async (productId: string): Promise<string | null> => {
  try {
    // Get the product images from the database
    const { data, error } = await getProductImages(productId);

    if (error || !data || data.length === 0) {
      return null;
    }

    // Sort by display_order and get the first image
    const primaryImage = data.sort((a, b) => a.display_order - b.display_order)[0];

    // Get the public URL for the image
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(primaryImage.storage_path);

    return publicUrl;
  } catch (error) {
    console.error('Error getting product image URL:', error);
    return null;
  }
};

/**
 * Get a fallback image URL for a product
 * @param productId The product ID
 * @returns A fallback image URL
 */
export const getFallbackImageUrl = (productId: string): string => {
  // Use a more reliable placeholder service
  // We're using placeholder.com which is very stable
  const colors = [
    '3b82f6', // blue
    '10b981', // green
    'f59e0b', // amber
    'ef4444', // red
    '8b5cf6', // purple
    'ec4899', // pink
  ];

  // Use the product ID to select a consistent color
  const colorIndex = parseInt(productId.substring(0, 8), 16) % colors.length;
  const color = colors[colorIndex];

  return `https://via.placeholder.com/800x600/${color}/ffffff?text=Product+${productId.substring(0, 4)}`;
};
