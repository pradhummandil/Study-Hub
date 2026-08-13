# Video Learning P0 Debug & Forensic Analysis

**Target URL:** `https://studyhub-bypradhum.vercel.app/video-learning`  
**Timestamp:** `2026-08-14T03:04:00Z`  
**Severity:** `P0 - CRITICAL PRODUCTION BUG`

---

## 1. REPRODUCE THE BUG

### Runtime Error & Network Failures Captured
1. **PostgREST Query Logic Parsing Error (HTTP 400 Bad Request):**
   - **Error Code:** `PGRST100`
   - **Error Message:** `failed to parse logic tree ((title.ili.*q*,description.ili.*q*,...))`
   - **Details:** `unexpected "i" expecting "not" or operator (eq, gt, ...)`
   - **HTTP Status:** `400 Bad Request`
   - **Component/File throwing:** `src/lib/videoLearningApi.ts` in `fetchVideosPaginated` and `fetchShorts`
   - **Root Cause:** Use of non-existent PostgREST operator `ili` instead of `ilike` in `supabase.from('youtube_videos').select().or(...)`. Whenever any search term was typed or category search triggered, the API request broke with HTTP 400.

2. **Invisible Text / Inherited Text Contrast Bug:**
   - **Component throwing:** `VideoLearningPage.tsx`, `VideoCard.tsx`, `PlaylistCard.tsx`
   - **Root Cause:** Hero section used dark background (`bg-forest`) with white text, but child elements inherited text colors or CSS variables (`--foreground`, `text-transparent`, `text-white/40`), making text unreadable over light background or dark background overrides.
   - **Fix Required:** Enforce explicit semantic color palette (`#F8F6F0` background, `#1C201D` primary text, `#6C706D` secondary text, `#2D5A3F` primary action, `#C86D51` accent, `#EDE8DB` surface, `#FFFFFF` card).

3. **Loading Timeout & Error State Handling:**
   - **Root Cause:** On network delay or query failure, fallback returned empty array or silently timed out after 4.5 seconds without presenting a clear user-facing error recovery card.

---

## 2. RENDERING FLOW TRACE

```
VideoLearningPage
 └── VideoLearningErrorBoundary
      ├── Navbar (#F8F6F0 / #1C201D)
      ├── Hero Section
      │    ├── Heading: "Learn from the lessons that move you forward." (#1C201D / #C86D51)
      │    └── Description (#6C706D)
      ├── Search Bar (#FFFFFF bg, #1C201D text, #6C706D placeholder, #2D5A3F focus)
      ├── Category Filter Chips (All, GATE, JEE Main, JEE Advanced, NEET, CUET, UPSC, Other)
      ├── Real YouTube Video Grid (fetchVideosPaginated → Supabase `youtube_videos`)
      │    └── VideoCard (Real Thumbnail + Fallback, Title #1C201D, Meta #6C706D, Hover Preview)
      ├── Verified Channels & Structured Course Playlists (fetchChannels, fetchPlaylists)
      └── Load More Pagination
```

---

## 3. SUPABASE TABLES & RLS AUDIT

- `youtube_videos`: 1,000+ real records verified.
  - Verified columns: `id`, `youtube_video_id`, `title`, `description`, `thumbnail`, `thumbnail_url`, `duration`, `duration_seconds`, `published_at`, `channel_id`, `channel_name`, `channel_handle`, `video_type`, `exam`, `subject`, `topic`, `language`, `source_url`, `embed_url`, `status`, `is_short`, `view_count`.
- `youtube_channels`: 6 verified channels.
- `youtube_playlists`: 26 verified playlists.
- `youtube_shorts`: 1,000 verified shorts.
- **RLS Access:** Unauthenticated (anon) SELECT enabled and tested — HTTP 200 OK for standard queries.

---

## 4. ACTION PLAN & FIXES TO APPLY

1. **Fix `videoLearningApi.ts` PostgREST Syntax:**
   - Replace `title.ili.*${q}*` with `title.ilike.%${q}%`.
   - Update `fetchVideosPaginated`, `fetchShorts`, and all filter composing logic.
   - Throw/handle error explicitly if Supabase query fails.

2. **Fix Color Palette & Text Visibility:**
   - Force `#F8F6F0` page background.
   - Force `#1C201D` primary text, `#6C706D` secondary text across all headings, cards, badges, inputs, placeholders.
   - Update Hero to `#1C201D` text with `#C86D51` accent phrase on light `#F8F6F0` paper surface.
   - Update Search bar to `#FFFFFF` background, `rgba(28,32,29,.14)` border, `#1C201D` text, `#6C706D` placeholder, `#2D5A3F` focus ring.
   - Update Filter chips to: Inactive (`#EDE8DB` bg, `#6C706D` text), Active (`#2D5A3F` bg, `#FFFFFF` text).

3. **Wrap in `VideoLearningErrorBoundary` & Handle Loading/Error States:**
   - Create `VideoLearningErrorBoundary` to catch any component render crashes.
   - Show skeleton loaders for initial 4.5s max, then real data or error state.
   - Standardize error card with Title: *"We couldn't load Video Learning."*, Description: *"Your saved lesson library is temporarily unavailable."*, and Actions: `[Try again]`, `[Go to Studio]`.

4. **Enhance VideoCard & Fallbacks:**
   - Thumbnail fallback: clean `#EDE8DB` parchment SVG thumbnail on `onError`.
   - Channel avatar fallback: neutral circular avatar on `onError` or null avatar.
   - Typed optional property access across all fields (`channel_name`, `view_count`, `duration`, `published_at`).
   - Muted hover preview after ~500ms on desktop only.

5. **Production Build & Verification:**
   - Run `npm run build`, preview, and verify all 22 checklist items.
