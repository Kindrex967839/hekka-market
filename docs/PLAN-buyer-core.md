# PLAN: Buyer Core (Option C)

This plan covers the implementation of the Buyer experience, focusing on dynamic product discovery and a detailed product view.

## Finalized Decisions
- **Search Logic**: **Database-driven (Server-side)** using Supabase full-text search.
- **Details Layout**: **Geometric/Modular** (keeping consistency with Categories/Sell pages).
- **Checkout**: **Direct Lemon Squeezy Overlay**.
- **Discovery**: Include a **"Similar Products"** section on the details page.

## Phase 1: Dynamic Explore Page
- [ ] Connect `Explore.tsx` to Supabase `products` table.
- [ ] Implement category filtering using the `category_id`.
- [ ] Implement search field logic (client or server side based on Phase 0).
- [ ] Replace `sampleData.ts` usage with live data.

## Phase 2: Product Details Page
- [ ] Create `ProductDetails.tsx` in `frontend/src/pages/`.
- [ ] Fetch product data, seller info, and images from Supabase.
- [ ] Implement the "Buy Now" button with Lemon Squeezy integration.
- [ ] Design a high-impact, geometric layout (seamless with existing UI).

## Phase 3: Routing & SEO
- [ ] Add `/product/:productId` route to `user-routes.tsx`.
- [ ] Ensure proper meta tags for search engine sharing.

## Verification Checklist
- [ ] Verify search returns correct results for partial titles.
- [ ] Verify category filters update the product grid instantly.
- [ ] Verify checkout overlay opens on button click.
- [ ] Verify images load correctly from Supabase Storage.
