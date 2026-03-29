import { supabase } from './supabaseClient';
import type { Database } from './supabaseTypes';

// Auth functions

/**
 * Sign up a new user with email and password
 */
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

/**
 * Sign in with email and password
 */
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

/**
 * Sign out the current user
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

/**
 * Get the current user session
 */
export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  return { data, error };
};

// Profile functions

/**
 * Get a user profile by ID
 */
export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  return { data, error };
};

/**
 * Create or update a user profile
 */
export const upsertProfile = async (profile: {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  website?: string;
}) => {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(profile)
    .select();

  return { data, error };
};

// Category functions

/**
 * Get all categories
 */
export const getCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  return { data, error };
};

// Product functions

/**
 * Get published products with optional filters
 */
export const getProducts = async ({
  categoryId,
  sellerId,
  search,
  limit = 10,
  offset = 0,
}: {
  categoryId?: string;
  sellerId?: string;
  search?: string;
  limit?: number;
  offset?: number;
} = {}) => {
  let query = supabase
    .from('products')
    .select('*, categories(name), profiles(*)')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  if (sellerId) {
    query = query.eq('seller_id', sellerId);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }

  const { data, error } = await query;

  return { data, error };
};

/**
 * Get a single product by ID
 */
export const getProduct = async (productId: string) => {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name), profiles(*)')
    .eq('id', productId)
    .single();

  return { data, error };
};

/**
 * Get products in the same category, excluding the current product
 */
export const getSimilarProducts = async (productId: string, categoryId: string, limit = 4) => {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name), profiles(*)')
    .eq('category_id', categoryId)
    .eq('is_published', true)
    .neq('id', productId)
    .limit(limit);

  return { data, error };
};

/**
 * Get products created by a specific user
 */
export const getMyProducts = async (userId: string) => {
  if (!userId) {
    return { data: null, error: new Error('User ID is required') };
  }

  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name), profiles(*)')
    .eq('seller_id', userId)
    .order('created_at', { ascending: false });

  return { data, error };
};

/**
 * Create a new product
 */
export const createProduct = async (product: {
  title: string;
  description: string;
  price: number;
  category_id: string;
  product_type: string;
  is_published?: boolean;
}, userId: string) => {
  if (!userId) {
    return { data: null, error: new Error('User ID is required') };
  }

  const { data, error } = await supabase
    .from('products')
    .insert({
      ...product,
      seller_id: userId,
      is_published: product.is_published || false,
    })
    .select();

  return { data, error };
};

/**
 * Update a product
 */
export const updateProduct = async (productId: string, updates: {
  title?: string;
  description?: string;
  price?: number;
  category_id?: string;
  product_type?: string;
  is_published?: boolean;
  image_url?: string;
}, userId?: string) => {
  // If userId is provided, we can add a check or just rely on RLS
  const query = supabase
    .from('products')
    .update(updates)
    .eq('id', productId);

  if (userId) {
    query.eq('seller_id', userId);
  }

  const { data, error } = await query.select();

  return { data, error };
};

/**
 * Delete a product
 */
export const deleteProduct = async (productId: string) => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);

  return { error };
};

// Product image functions

/**
 * Get images for a product
 */
export const getProductImages = async (productId: string) => {
  const { data, error } = await supabase
    .from('product_images')
    .select('*')
    .eq('product_id', productId)
    .order('display_order');

  return { data, error };
};

/**
 * Upload a product image to storage and create a database entry
 */
export const uploadProductImage = async ({
  productId,
  file,
  displayOrder = 0,
}: {
  productId: string;
  file: File;
  displayOrder?: number;
}) => {
  // Create a unique file path
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
  const filePath = `${productId}/${fileName}`;

  // Check if we've forced bucket existence in localStorage
  const forceBucketExists = localStorage.getItem('bucket-exists') === 'true';

  // Upload the file to storage
  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Supabase error uploading image:', {
      message: uploadError.message,
      details: (uploadError as any).details,
      hint: (uploadError as any).hint,
      code: (uploadError as any).code
    });
    // If we get a permission error...
    if (forceBucketExists && uploadError.message && (uploadError.message.includes('permission') || uploadError.message.includes('policy'))) {
      console.error('Permission error uploading to bucket. You may need to set up proper RLS policies:', uploadError);
      return {
        data: null,
        error: {
          ...uploadError,
          message: 'Permission denied. You need to set up proper RLS policies for the storage.objects table.'
        }
      };
    }

    return { data: null, error: uploadError };
  }

  // Get the public URL
  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);

  // Create a database entry for the image
  const { data, error } = await supabase
    .from('product_images')
    .insert({
      product_id: productId,
      storage_path: filePath,
      display_order: displayOrder,
    })
    .select();

  return { data, error, publicUrl };
};

/**
 * Delete a product image
 */
export const deleteProductImage = async (imageId: string, storagePath: string) => {
  // Delete the file from storage
  const { error: storageError } = await supabase.storage
    .from('product-images')
    .remove([storagePath]);

  // Delete the database entry
  const { error: dbError } = await supabase
    .from('product_images')
    .delete()
    .eq('id', imageId);

  return { storageError, dbError };
};

// Message functions

/**
 * Send a message to another user
 */
export const sendMessage = async (recipientId: string, content: string) => {
  const { data: session } = await supabase.auth.getSession();

  if (!session.session?.user.id) {
    return { data: null, error: new Error('Not authenticated') };
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({
      sender_id: session.session.user.id,
      recipient_id: recipientId,
      content,
    })
    .select();

  return { data, error };
};

/**
 * Get messages between the current user and another user
 */
export const getMessages = async (otherId: string) => {
  const { data: session } = await supabase.auth.getSession();

  if (!session.session?.user.id) {
    return { data: null, error: new Error('Not authenticated') };
  }

  const userId = session.session.user.id;

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`and(sender_id.eq.${userId},recipient_id.eq.${otherId}),and(sender_id.eq.${otherId},recipient_id.eq.${userId})`)
    .order('created_at');

  return { data, error };
};

/**
 * Mark a message as read
 */
export const markMessageAsRead = async (messageId: string) => {
  const { data, error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('id', messageId)
    .select();

  return { data, error };
};

/**
 * Get a list of users the current user has conversations with
 */
export const getConversations = async () => {
  const { data: session } = await supabase.auth.getSession();

  if (!session.session?.user.id) {
    return { data: null, error: new Error('Not authenticated') };
  }

  const userId = session.session.user.id;

  // Get unique users the current user has messaged with
  const { data, error } = await supabase
    .from('messages')
    .select('sender_id, recipient_id, created_at')
    .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (error || !data) {
    return { data: null, error };
  }

  // Extract unique user IDs from conversations
  const userIds = new Set<string>();
  data.forEach(message => {
    if (message.sender_id === userId) {
      userIds.add(message.recipient_id);
    } else {
      userIds.add(message.sender_id);
    }
  });

  // Get profiles for these users
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .in('id', Array.from(userIds));

  return { data: profiles, error: profilesError };
};

// Purchase functions

/**
 * Get purchases made by the current user
 */
export const getMyPurchases = async () => {
  const { data: session } = await supabase.auth.getSession();

  if (!session.session?.user.id) {
    return { data: null, error: new Error('Not authenticated') };
  }

  const { data, error } = await supabase
    .from('purchases')
    .select('*, products(*)')
    .eq('buyer_id', session.session.user.id)
    .order('created_at', { ascending: false });

  return { data, error };
};

/**
 * Get sales for products created by the current user
 */
export const getMySales = async () => {
  const { data: session } = await supabase.auth.getSession();

  if (!session.session?.user.id) {
    return { data: null, error: new Error('Not authenticated') };
  }

  const { data, error } = await supabase
    .from('purchases')
    .select('*, products(*)')
    .eq('products.seller_id', session.session.user.id)
    .order('created_at', { ascending: false });

  return { data, error };
};
