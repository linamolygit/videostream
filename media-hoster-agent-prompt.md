# 🎯 AI Engineering Agent Prompt — Media Hoster Platform Rebuild

Use this as a direct prompt/spec for your AI coding agent (Antigravity). Copy-paste as-is or split into phases.

---

## 🧭 Context / Goal

Build a **two-part secure media streaming ecosystem**:

1. **WordPress Plugin** — Lightweight, zero-config plugin that lets a blog admin attach a pre-generated streaming link (video or image carousel) to any blog post. No API keys, no backend connection setup required inside the plugin — it just consumes a link.
2. **Media Hoster SaaS** — A public, open-source, multi-tenant SaaS platform where **anyone can sign up**, upload their video (with a mandatory thumbnail) or multiple images, and generate a secure streaming link to paste into their own WordPress plugin.

The two are fully decoupled — the plugin has zero knowledge of accounts, tokens, or APIs. It only stores and renders a link per post.

---

## 🧩 PART 1 — WordPress Plugin Requirements

### 1.1 Core Behavior
- Plugin dashboard shows a **list of blog posts** (dropdown/searchable list).
- Admin selects a post → pastes the **streaming link** (generated from Media Hoster site) → chooses **display position** (before content / after content / at a specific shortcode position) → clicks **Save**.
- No API token field, no "connect to backend" settings page — **remove all API-connection UI entirely**. The plugin is a dumb, secure renderer of whatever link is pasted.

### 1.2 Frontend Rendering Logic
| Scenario | What shows |
|---|---|
| Real human visitor, link = video | Thumbnail image with a play button overlay. Actual `<video>` tag NOT present in initial DOM — only injected on trusted click. |
| Real human visitor, link = image set | Carousel/slider of the images (lazy-loaded, swipeable, arrows + dots). |
| Bot / crawler / social-media-scraper (Facebook, Google Ads reviewer, etc.) | Show **only the article text** — no thumbnail, no video, no image carousel, no player markup at all in raw HTML response. |
| Any automated/programmatic click event | Reject — only genuine (`isTrusted`) user clicks should be able to trigger stream loading. |

### 1.3 Non-negotiable Security Rules for Plugin
- Never render the raw streaming link in page source/HTML for bots — detect via User-Agent + known bot signatures (Googlebot, AdsBot, facebookexternalhit, bingbot, etc.) server-side in PHP **before** output, not just hide via CSS/JS.
- The pasted link itself must be an **opaque, non-guessable token URL** (never the raw media URL) — plugin never needs to know or store the real file source.
- No shortcodes/settings should expose account credentials, API keys, or backend URLs.

---

## 🧩 PART 2 — Media Hoster SaaS Site (Rebuild as proper multi-tenant platform)

### 2.1 Product Positioning
- Fully **open-source**, self-serve SaaS. Anyone visits the site → creates a free account → starts uploading immediately.
- **Home page = Dashboard** (post-login). No separate marketing landing page needed as the main `/` route — logged-out users see login/signup, logged-in users land directly on their dashboard.

### 2.2 Signup/Account Flow
- Standard signup (email + password, or email OTP) → each user gets an isolated workspace.
- Each user can only see/manage their own uploaded media (multi-tenant data isolation — enforce `user_id` scoping on every query, not just at the UI level).

### 2.3 Dashboard (Home Page) Requirements
| Section | Purpose |
|---|---|
| Stats cards | Total videos, total images, total stream links generated, storage used |
| Upload button | Prominent CTA → opens upload modal/page |
| Media library | Grid/list of all uploaded content (video thumbnails + image sets) with search/filter |
| Quick actions | Copy stream link, regenerate link, delete media, edit thumbnail |

### 2.4 Upload Flow
**Video upload:**
1. User uploads video file → **mandatory thumbnail image upload** (block submission if thumbnail missing).
2. Both stored in **Cloudflare R2** (video in one bucket/path, thumbnail in another or same bucket with folder separation).
3. After upload completes → **"Generate Stream Link"** button appears.
4. Click → backend creates DB record + opaque UUID + returns the final stream link.

**Image upload (carousel/gallery mode):**
1. User can upload **unlimited images** in one batch (multi-file upload with progress bar per file).
2. All images grouped under a single UUID/media record (treated as one "gallery" unit).
3. Same **Generate Stream Link** flow — one link represents the whole image set.

### 2.5 Stream Link Output
- After generation, link should be shown in a **copyable box** with a "Copy" button + a note: *"Paste this into your WordPress plugin dashboard."*
- Link itself must **not** leak the R2 bucket URL or file path — it must go through the same tokenized/secure delivery mechanism as the current architecture (opaque UUID + backend-issued signed token, not a static R2 public URL).

### 2.6 UI/UX Rebuild Requirements (current UI is broken/inconsistent)
- Rebuild as a **proper SaaS product UI** — not just functional screens.
- **Navbar**: Logo, Dashboard, Media Library, Upload, Profile/Account dropdown (with logout), consistent across all pages, sticky on scroll.
- **Footer**: Standard SaaS footer — product links, docs/help, privacy/terms, GitHub link (since open-source), copyright.
- Consistent design system: same button styles, spacing, colors, typography across Dashboard, Upload, Profile, Login/Signup pages — no page should look like it belongs to a different app.
- Empty states (no videos yet, no images yet) should have proper illustrations/CTAs, not blank pages.
- Loading states for uploads (progress bars for large video files, per-image progress for batch image uploads).
- Fully responsive — dashboard should work cleanly on mobile too, since admins may manage from phone.

---

## 🔐 Security Requirements to Carry Over (do not regress on these)

While rebuilding, the agent must preserve/fix these from the current implementation:
1. **Stream token must be encrypted, not just base64** — raw source URL should never be recoverable by decoding the token client-side.
2. **Signature (HMAC) must cover the full payload** — including `source` and `filename`, not just `uuid:expires:action`. Use a real HMAC function (`crypto.createHmac`), not manual string concatenation + SHA256.
3. **Rate-limit** the public media/token endpoints per IP to prevent brute-force/enumeration of UUIDs.
4. **Referer/Origin check** on the Cloudflare Worker stream endpoint so direct token URL sharing outside the intended flow is harder to exploit.
5. Multi-tenant data isolation — every DB query for media/videos must be scoped to the logged-in `user_id`; no cross-account data leaks.

---

## ✅ Deliverable Checklist for the Agent

- [ ] WordPress plugin: remove API/backend connection settings entirely
- [ ] WordPress plugin: post-selector + link-paste + position-selector UI
- [ ] WordPress plugin: bot-safe server-side rendering (PHP-level, not JS-only hiding)
- [ ] WordPress plugin: carousel support for image-set links
- [ ] SaaS site: multi-tenant signup/login with isolated workspaces
- [ ] SaaS site: dashboard as home page for logged-in users
- [ ] SaaS site: video + mandatory thumbnail upload to Cloudflare R2
- [ ] SaaS site: multi-image gallery upload (unlimited images) to R2
- [ ] SaaS site: "Generate Stream Link" flow producing a secure, tokenized link
- [ ] SaaS site: full UI rebuild — navbar, footer, dashboard, upload flow, consistent design system
- [ ] Security: encrypted + fully-signed tokens, rate limiting, referer checks, tenant isolation
