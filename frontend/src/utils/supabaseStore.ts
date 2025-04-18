import { create } from 'zustand';
import { supabase } from './supabaseClient';

interface SupabaseState {
  // Connection status
  isConfigured: boolean;
  isLoading: boolean;
  error: string | null;
  
  // User authentication
  user: any | null;
  session: any | null;
  
  // Actions
  checkConnection: () => Promise<boolean>;
  setIsConfigured: (status: boolean) => void;
  loadUser: () => Promise<void>;
  clearUser: () => void;
}

export const useSupabaseStore = create<SupabaseState>((set, get) => ({
  // Initial state
  isConfigured: false,
  isLoading: false,
  error: null,
  user: null,
  session: null,
  
  // Check if Supabase is properly configured
  checkConnection: async () => {
    set({ isLoading: true, error: null });
    try {
      // First check if the URL and key have been updated from defaults
      const projectUrl = (supabase as any).supabaseUrl;
      const anonKey = (supabase as any).supabaseKey;
      
      if (
        projectUrl === 'YOUR_SUPABASE_URL' || 
        anonKey === 'YOUR_SUPABASE_ANON_KEY'
      ) {
        set({ 
          isConfigured: false, 
          isLoading: false,
          error: "Supabase credentials not configured" 
        });
        return false;
      }
      
      // Try to query the categories table as a test
      const { error } = await supabase
        .from('categories')
        .select('name')
        .limit(1);
      
      const isConfigured = !error;
      set({ isConfigured, isLoading: false, error: error?.message || null });
      return isConfigured;
    } catch (err: any) {
      set({ 
        isConfigured: false, 
        isLoading: false,
        error: err.message || "Failed to connect to Supabase" 
      });
      return false;
    }
  },
  
  // Manually set configuration status
  setIsConfigured: (status: boolean) => {
    set({ isConfigured: status });
  },
  
  // Load the current user's session
  loadUser: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        set({ error: error.message, isLoading: false });
        return;
      }
      
      if (data.session) {
        set({ 
          user: data.session.user,
          session: data.session,
          isLoading: false 
        });
      } else {
        set({ user: null, session: null, isLoading: false });
      }
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },
  
  // Clear user data (used for logout)
  clearUser: () => {
    set({ user: null, session: null });
  },
}));

// Set up auth state change listener
supabase.auth.onAuthStateChange((event, session) => {
  if (session) {
    useSupabaseStore.setState({ 
      user: session.user,
      session: session
    });
  } else {
    useSupabaseStore.setState({ 
      user: null,
      session: null
    });
  }
});
