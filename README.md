# Hekka Market

A modern e-commerce marketplace application with authentication, product listings, and user profiles.

## Stack

- **Frontend**: React + TypeScript with Vite
  - Package manager: `yarn`
  - Authentication: Clerk
  - State management: Zustand
  - UI components: Custom themed components

- **Backend**: Python FastAPI server
  - Package manager: `uv`
  - Database: Supabase (PostgreSQL)
  - Storage: Supabase Storage for product images

## Features

- User authentication with Clerk (email/password)
- Email verification flow
- User profiles with username support
- Integration between Clerk authentication and Supabase database
- Product listings and categories
- Image upload and management

## Quickstart

1. Install dependencies:

```bash
make
```

2. Set up environment variables:
   - Create `frontend/.env.local` with the following:
   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
   ```

3. Start the backend and frontend servers in separate terminals:

```bash
make run-backend
make run-frontend
```

## Development Notes

- The backend server runs on port 8000
- The frontend development server runs on port 5173
- The frontend Vite server proxies API requests to the backend on port 8000
- Clerk is used for authentication, with JWT tokens passed to Supabase
- Supabase is used for database and storage, but not for authentication

## Accessing the Application

Visit <http://localhost:5173> to view the application.
