# HEKKA MARKET Supabase Implementation Guide

## 1. Create Supabase Project

1. Go to https://app.supabase.com/
2. Sign in with your account (email: matera_apps@proton.me)
3. Click "New Project"
4. Fill in project details:
   - Name: HEKKA MARKET
   - Database Password: Use a secure password
   - Region: Choose closest to your users
   - Pricing Plan: Select appropriate plan

## 2. Configure Environment Variables

1. Create `.env.local` in the frontend directory:

   ```bash
   cd frontend
   touch .env.local
   ```

2. Add your Supabase credentials to `frontend/.env.local`:
   ```plaintext
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

3. Update `frontend/src/utils/supabaseClient.ts`:
   ```typescript
   const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
   const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
   ```

4. Add `.env.local` to `.gitignore`:
   ```plaintext
   # Environment Variables
   .env.local
   .env.*.local
   ```

## 3. Storage Setup

1. In Supabase Dashboard, go to Storage
2. Create a new bucket named 'product-images'
3. Set bucket public/private access as needed

## 4. Authentication Setup

1. In Supabase Dashboard, go to Authentication
2. Configure Email authentication:
   - Enable Email provider
   - Configure email templates if needed
3. Set up any additional auth providers as needed

## 5. Start Development

1. Install dependencies:
   ```bash
   make
   ```

2. Start the servers:
   ```bash
   make run-backend   # Terminal 1
   make run-frontend  # Terminal 2
   ```

3. Access the application:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:8000

## 6. Verify Setup

1. Test user registration/login
2. Verify storage uploads work
3. Test database connections
4. Ensure RLS policies are working

## Notes

- The backend server runs on port 8000
- The frontend development server runs on port 5173
- The frontend Vite server proxies API requests to the backend
- Never commit `.env.local` to version control
- Always use environment variables for sensitive credentials