import { supabase } from './supabaseClient';
import { User } from '@clerk/clerk-react';

/**
 * Creates or updates a user profile in Supabase
 */
export const syncUserProfile = async (user: User) => {
  if (!user) return null;
  
  try {
    const userId = user.id;
    const email = user.primaryEmailAddress?.emailAddress;
    const firstName = user.firstName;
    const lastName = user.lastName;
    const imageUrl = user.imageUrl;
    
    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from('profiles')
        .update({
          username: user.username || `user_${userId.substring(0, 8)}`,
          full_name: `${firstName || ''} ${lastName || ''}`.trim(),
          avatar_url: imageUrl,
          email: email,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select();
      
      if (error) {
        console.error('Error updating profile:', error);
        return null;
      }
      return data;
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          username: user.username || `user_${userId.substring(0, 8)}`,
          full_name: `${firstName || ''} ${lastName || ''}`.trim(),
          avatar_url: imageUrl,
          email: email,
        })
        .select();
      
      if (error) {
        console.error('Error creating profile:', error);
        return null;
      }
      return data;
    }
  } catch (error) {
    console.error('Error syncing user profile:', error);
    return null;
  }
};

/**
 * Gets a user profile from Supabase
 */
export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};
