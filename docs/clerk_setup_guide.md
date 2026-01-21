# 🔐 Clerk & Supabase Connection Guide

The error we are seeing (`Failed to get session from Clerk`) happens because Clerk doesn't have the specific "Instruction Manual" (JWT Template) needed to talk to Supabase. 

Follow these exact steps to fix it.

---

## Phase 1: Get your Supabase Secret

**If you are using Supabase Cloud (hosted):**
1. Go to your **Supabase Dashboard**.
2. Click **Project Settings** (Cog icon at the bottom left).
3. Click **API** in the sidebar.
4. Scroll down to **JWT Settings**.
5. Copy the **JWT Secret**. (You might need to click "Reveal").

**If you are running Supabase Locally:**
1. The default JWT secret for local development is usually:
   ```
   super-secret-jwt-token-with-at-least-32-characters-long
   ```
   *(Try this first if you aren't sure)*

---

## Phase 2: Create the Template in Clerk

1. Go to your **Clerk Dashboard**.
2. Click **JWT Templates** in the sidebar.
3. Click the **New Template** button.
4. Select the **Supabase** icon.
5. **CRITICAL SETTINGS:**
   - **Name:** `supabase` (Must be lowercase!)
   - **Signing Key:** Paste the **JWT Secret** you copied in Phase 1.
   - **Audience (aud):** Ensure this is set to `authenticated`. (CRITICAL)
   - **Role (role):** Usually `authenticated`.
6. Click **Save**.

---

## Phase 3: Test It

1. Go back to your Hekka Market tab.
2. Refresh the page.
3. Click the **FORCE RE-CONNECT** button in the debug panel.
4. It should now say **CONNECTED ✅** and **MATCH ✅**.
