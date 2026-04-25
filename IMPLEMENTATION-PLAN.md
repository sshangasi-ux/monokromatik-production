# MONOKROMATIK FEATURE IMPLEMENTATION PLAN
**Date:** April 25, 2026
**Status:** IN PROGRESS

## 🎯 FEATURES TO IMPLEMENT (7 Total)

### ✅ **COMPLETED:**
- [x] About Page (deployed)
- [x] Homepage with 5 articles (deployed)
- [x] Basic navigation (deployed)
- [x] Mobile responsive design (deployed)

### 🚧 **IN PROGRESS:**

---

## **FEATURE 1: NEWSLETTER INTEGRATION (ConvertKit)**

**Priority:** ⭐⭐⭐⭐⭐ (CRITICAL - #1 Asset Building)

**Components to Create:**
1. `app/components/NewsletterSignup.tsx` - Reusable newsletter form
2. `app/api/newsletter/route.ts` - API route for ConvertKit integration
3. Add to Homepage (hero section)
4. Add to Article pages (footer)
5. Add to About page (sidebar)

**ConvertKit Setup:**
- API Key: (user will provide)
- Form ID: (user will provide)
- Integration: REST API

**UI Specifications:**
```
┌─────────────────────────────────────────┐
│  GET THE PULSE                          │
│  ────────────────────────────────       │
│  Every Sunday, 8AM GMT.                 │
│  The African stories BBC won't tell.    │
│  5-minute read. No spam.                │
│                                          │
│  [EMAIL INPUT] [SUBSCRIBE]              │
│                                          │
│  ⚡ Last week: Burna Boy, PSL drama,   │
│     Nairobi tech boom                    │
└─────────────────────────────────────────┘
```

**Files:**
- `/app/components/NewsletterSignup.tsx`
- `/app/api/newsletter/route.ts`

---

## **FEATURE 2: GENERATE 15 MORE ARTICLES**

**Priority:** ⭐⭐⭐⭐⭐ (CRITICAL - Content is King)

**Article Distribution:**
- Sports: 5 articles (total: 6 after adding 1 more)
- Music: 5 articles (total: 7 after adding 2 more)
- Culture: 3 articles (total: 5 after adding 2 more)
- Entertainment: 2 articles (total: 2 new)

**Content Strategy:**
- Original commentary with diaspora perspective
- Proper source attribution
- 700-900 words each
- SEO-optimized headlines
- Compelling images from Unsplash

**Implementation:**
- Generate JSON with all 15 articles
- Import to `data/articles.json`
- Deploy to Vercel

---

## **FEATURE 3: SOCIAL SHARING BUTTONS**

**Priority:** ⭐⭐⭐⭐⭐ (CRITICAL - Virality)

**Component:** `app/components/SocialShare.tsx`

**Platforms:**
- Twitter/X (diaspora engagement)
- WhatsApp (African primary platform)
- Facebook (older diaspora)
- LinkedIn (professional diaspora)

**Placement:**
- Top of article (before content)
- Bottom of article (after content)
- Floating sidebar (desktop)

**UI:**
```
Share: [🐦 Twitter] [📱 WhatsApp] [📘 Facebook] [💼 LinkedIn]
```

**Files:**
- `/app/components/SocialShare.tsx`
- Update `/app/article/[id]/page.tsx`

---

## **FEATURE 4: RELATED ARTICLES COMPONENT**

**Priority:** ⭐⭐⭐⭐ (HIGH - Session Duration)

**Component:** `app/components/RelatedArticles.tsx`

**Logic:**
1. Same category as current article
2. Most recent (published date)
3. Exclude current article
4. Limit: 3 articles

**UI:**
```
┌─────────────────────────────────────────┐
│  READ NEXT                              │
│  ────────────────────────────────       │
│                                          │
│  [IMG] Article Title 1                  │
│        CATEGORY • 4 min read             │
│                                          │
│  [IMG] Article Title 2                  │
│        CATEGORY • 5 min read             │
│                                          │
│  [IMG] Article Title 3                  │
│        CATEGORY • 3 min read             │
└─────────────────────────────────────────┘
```

**Files:**
- `/app/components/RelatedArticles.tsx`
- Update `/app/article/[id]/page.tsx`

---

## **FEATURE 5: TRENDING SECTION**

**Priority:** ⭐⭐⭐⭐ (HIGH - Social Proof)

**Component:** `app/components/TrendingArticles.tsx`

**Logic:**
1. Track views (simple counter or Google Analytics)
2. Last 7 days
3. Top 5 articles
4. Update daily

**UI (Homepage Sidebar):**
```
┌─────────────────────────────────────────┐
│  🔥 TRENDING NOW                        │
│  ────────────────────────────────       │
│  1. Article Title (2.4K views)          │
│     CATEGORY                             │
│                                          │
│  2. Article Title (1.8K views)          │
│     CATEGORY                             │
│                                          │
│  3. Article Title (1.2K views)          │
│     CATEGORY                             │
└─────────────────────────────────────────┘
```

**Files:**
- `/app/components/TrendingArticles.tsx`
- `/app/page.tsx` (add to homepage)

---

## **FEATURE 6: MOBILE RESPONSIVENESS TEST**

**Priority:** ⭐⭐⭐⭐ (HIGH - 70%+ traffic)

**Test Sizes:**
- iPhone SE (375px) - Minimum
- iPhone 14 Pro (393px) - Common
- iPad (768px) - Tablet
- Desktop (1440px+) - Large

**Checks:**
- [ ] Navigation hamburger works
- [ ] Images resize properly
- [ ] Text readable (16px min)
- [ ] Touch targets 44px min
- [ ] No horizontal scroll
- [ ] Forms usable on mobile

**Files:**
- Test all components
- Update responsive classes as needed

---

## **FEATURE 7: SEARCH FUNCTIONALITY**

**Priority:** ⭐⭐⭐⭐ (HIGH - UX)

**Component:** `app/components/SearchBar.tsx`

**Features:**
- Search articles by title/content
- Live results (as you type)
- Search page `/search?q=query`
- Highlight matches

**UI (Header):**
```
[🔍 Search articles...         ]
```

**Search Results Page:**
```
Search results for "amapiano"

Found 3 articles:

1. [Article Title]
   Excerpt with highlighted "amapiano"...
   
2. [Article Title]
   Excerpt...
```

**Files:**
- `/app/components/SearchBar.tsx`
- `/app/search/page.tsx`
- `/app/api/search/route.ts`

---

## 📋 EXECUTION ORDER:

1. ✅ **Newsletter** (30 min) - Start building email list NOW
2. ✅ **15 Articles** (60 min) - Critical mass of content
3. ✅ **Social Sharing** (20 min) - Enable virality
4. ✅ **Related Articles** (20 min) - Increase session time
5. ✅ **Trending Section** (30 min) - Social proof
6. ✅ **Mobile Test** (20 min) - Ensure accessibility
7. ✅ **Search** (30 min) - Improve discovery

**Total Estimated Time:** 3.5 hours
**Deployment:** After each major feature

---

## 🚀 NEXT STEPS:

Starting with Feature 1 (Newsletter) NOW...
