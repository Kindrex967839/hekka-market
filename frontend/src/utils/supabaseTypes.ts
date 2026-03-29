// Define types for Supabase database tables

/**
 * Profile table - stores user profiles from Clerk
 * RLS policies:
 * - Public profiles are viewable by everyone
 * - Anyone can insert/update profiles (controlled by application logic)
 */
export interface Profile {
  id: string; // Clerk user ID
  username: string; // unique username
  full_name?: string; // optional full name
  avatar_url?: string; // optional avatar image URL
  email?: string; // user email
  bio?: string; // optional user bio/description
  website?: string; // optional website URL
  created_at: string; // timestamp
  updated_at: string; // timestamp
}

/**
 * Category table - stores product categories
 * RLS policies:
 * - Categories are viewable by everyone
 * - Only administrators can insert/update/delete (implement as needed)
 */
export interface Category {
  id: string; // UUID
  name: string; // category name (unique)
  description?: string; // optional category description
  created_at: string; // timestamp
}

/**
 * Product table - stores product listings
 * RLS policies:
 * - Published products are viewable by everyone
 * - Sellers can view all their own products (published or not)
 * - Sellers can insert/update/delete their own products
 */
export interface Product {
  id: string; // UUID
  title: string; // product title
  description: string; // product description
  price: number; // product price
  category_id: string; // references categories.id
  seller_id: string; // references auth.users
  is_published: boolean; // whether product is publicly visible
  image_url?: string; // main product image URL
  product_type: 'digital_download' | 'subscription' | string; // product type
  created_at: string; // timestamp
  updated_at: string; // timestamp
}

/**
 * ProductImage table - stores images for products
 * RLS policies:
 * - Images of published products are viewable by everyone
 * - Sellers can view/insert/update/delete images of their own products
 */
export interface ProductImage {
  id: string; // UUID
  product_id: string; // references products.id
  storage_path: string; // path in storage bucket
  display_order: number; // order for display (0-based)
  created_at: string; // timestamp
}

/**
 * Message table - stores direct messages between users
 * RLS policies:
 * - Users can view messages they've sent or received
 * - Users can send messages (insert with sender_id = auth.uid())
 * - Users can mark messages as read if they are the recipient
 * - Users can delete messages they've sent or received
 */
export interface Message {
  id: string; // UUID
  sender_id: string; // references auth.users
  recipient_id: string; // references auth.users
  content: string; // message content
  is_read: boolean; // whether message has been read
  created_at: string; // timestamp
}

/**
 * Purchase table - stores completed purchases
 * RLS policies:
 * - Buyers can view their own purchases
 * - Sellers can view purchases of their products
 * - Only system can insert purchases (via API/server function)
 */
export interface Purchase {
  id: string; // UUID
  product_id: string; // references products.id
  buyer_id: string; // references auth.users
  transaction_id: string; // from payment processor (Lemon Squeezy)
  amount: number; // purchase amount
  status: 'completed' | 'refunded' | string; // purchase status
  created_at: string; // timestamp
}

// Database schema type - defines the structure of our tables
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, 'id' | 'created_at'>;
        Update: Partial<Omit<Category, 'id' | 'created_at'>>;
      };
      products: {
        Row: Product;
        Insert: Omit<Product, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>;
      };
      product_images: {
        Row: ProductImage;
        Insert: Omit<ProductImage, 'id' | 'created_at'>;
        Update: Partial<Omit<ProductImage, 'id' | 'created_at'>>;
      };
      messages: {
        Row: Message;
        Insert: Omit<Message, 'id' | 'created_at' | 'is_read'> & { is_read?: boolean };
        Update: Partial<Omit<Message, 'id' | 'created_at' | 'sender_id' | 'recipient_id' | 'content'>>;
      };
      purchases: {
        Row: Purchase;
        Insert: Omit<Purchase, 'id' | 'created_at'>;
        Update: Partial<Omit<Purchase, 'id' | 'created_at' | 'product_id' | 'buyer_id' | 'transaction_id'>>;
      };
    };
  };
}
