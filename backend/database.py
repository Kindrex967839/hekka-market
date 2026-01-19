import os
from supabase import create_client, Client

def get_supabase_client() -> Client:
    """
    Initialize and return a Supabase client using environment variables.
    """
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_ANON_KEY")
    
    if not url or not key:
        raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY/ANON_KEY must be set in environment variables")
        
    return create_client(url, key)
