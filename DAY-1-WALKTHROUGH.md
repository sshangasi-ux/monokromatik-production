# 🚀 MonoKromatik Content Automation Pipeline
## Day 1 Walkthrough Guide

Welcome to your AI-powered content pipeline! This guide will walk you through the complete setup and usage.

---

## ✅ **WHAT'S BEEN SET UP**

### **1. RSS Feed Aggregation**
- **File:** `lib/rss-feeds.ts`
- **Sources:** 20 African media outlets (Africanews, BBC Africa, OkayAfrica, Pulse, KickOff, etc.)
- **Categories:** News, Culture, Sports, Entertainment, Music
- **Media Support:** ✅ Images, ✅ Videos, ✅ Full Content

### **2. Story Fetcher (with Media Extraction)**
- **File:** `lib/fetch-stories.ts`
- **Features:**
  - Extracts images from multiple sources (media:content, media:thumbnail, enclosures, HTML)
  - Extracts videos (YouTube, Vimeo, media enclosures)
  - Extracts full content (HTML + text)
  - Auto-generates excerpts
  - Categorizes by media type (image/video/text)
  - Rate limiting (500ms between feeds)

### **3. AI Curation Engine**
- **File:** `lib/curate-stories.ts`
- **Features:**
  - Uses Claude API to rank stories by diaspora relevance
  - Filters out negative narratives (war, poverty, disease)
  - Scores stories 1-10 based on:
    - Diaspora appeal (40%)
    - Positive framing (30%)
    - Engagement potential (20%)
    - Timeliness (10%)

### **4. Article Generation**
- **File:** `lib/generate-article.ts`
- **Features:**
  - Generates 600-800 word articles
  - Diaspora-focused angle
  - Energetic, authentic tone
  - Auto-creates slugs and tags
  - Preserves media elements (images, videos)

### **5. Test Pipeline**
- **File:** `scripts/test-pipeline.ts`
- **Flow:** RSS → Pre-filter → Claude Curation → Article Generation
- **Output:** JSON files with curated stories and generated articles

---

## 📋 **STEP-BY-STEP WALKTHROUGH**

### **STEP 1: Add Your Anthropic API Key**

1. Open `.env.local` in your project root
2. Replace `your_api_key_here` with your actual Anthropic API key:

```env
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxx
```

3. Save the file

**Where to get your API key:**
- Go to: https://console.anthropic.com/
- Navigate to: API Keys → Create Key
- Copy the key (starts with `sk-ant-`)

---

### **STEP 2: Run the Test Pipeline**

Open your terminal and run:

```bash
cd ~/Downloads/monokromatik-production\ 2/
npm run test:pipeline
```

**What happens:**
1. 📡 Fetches stories from 10-15 African RSS feeds
2. 🔍 Pre-filters negative content
3. 🤖 Claude AI curates top 5 stories
4. ✍️  Generates 3 full articles
5. 💾 Saves output to `output/` directory

**Expected output:**
```
🚀 MonoKromatik Content Pipeline Test
============================================================

📡 STEP 1: FETCHING RSS FEEDS
============================================================
   Fetching: OkayAfrica...
   ✅ Got 15 stories from OkayAfrica
   Fetching: KickOff...
   ✅ Got 12 stories from KickOff
   ...

📊 MEDIA STATISTICS:
   Total stories: 156
   With images: 89 (57.1%)
   With videos: 12 (7.7%)
   Text only: 55

🔍 STEP 2: PRE-FILTERING NEGATIVE CONTENT
============================================================
   Filtered out: 8 negative stories
   Remaining: 148 stories

🤖 STEP 3: AI CURATION (Claude API)
============================================================
   1. [Score: 9] Burna Boy announces surprise album release
      → Burna Boy collaboration - huge diaspora appeal, music, positive

   2. [Score: 8] PSL playoff thriller: Sundowns edge Pirates
      → PSL playoff drama - sports content diaspora loves, engaging
   ...

✍️  STEP 4: ARTICLE GENERATION (Claude API)
============================================================
   ✍️  Generating article: "Burna Boy announces surprise album release"
   ✅ Generated: "Burna Boy Drops Surprise Album: What Diaspora Fans Need to Know"
   📝 Word count: 687 words
   🏷️  Tags: afrobeats, burna-boy, music
   ...

✅ PIPELINE TEST COMPLETE!
============================================================
   Fetched: 156 stories
   Filtered: 148 stories
   Curated: 5 stories
   Generated: 3 articles

📂 Output files:
   output/curated-stories.json
   output/generated-articles.json

🎉 Ready for production deployment!
```

---

### **STEP 3: Review Generated Content**

**File 1: `output/curated-stories.json`**
Contains the top 5 curated stories with metadata:
```json
[
  {
    "title": "Burna Boy announces surprise album release",
    "source": "OkayAfrica",
    "category": "music",
    "imageUrl": "https://...",
    "excerpt": "Grammy-winning artist Burna Boy...",
    ...
  }
]
```

**File 2: `output/generated-articles.json`**
Contains 3 full articles ready to publish:
```json
[
  {
    "title": "Burna Boy Drops Surprise Album: What Diaspora Fans Need to Know",
    "slug": "burna-boy-drops-surprise-album",
    "content": "# Burna Boy Drops Surprise Album\n\n...",
    "excerpt": "Grammy winner Burna Boy just dropped a surprise...",
    "category": "music",
    "tags": ["afrobeats", "burna-boy", "music"],
    "imageUrl": "https://...",
    ...
  }
]
```

---

## 🔧 **CUSTOMIZATION OPTIONS**

### **Change Feed Sources**
Edit `lib/rss-feeds.ts`:
```typescript
export const RSS_FEEDS: RSSFeed[] = [
  {
    url: 'https://your-favorite-source.com/feed',
    name: 'Your Source',
    category: 'culture',
    language: 'en',
    region: 'West Africa'
  },
  // ... add more feeds
];
```

### **Adjust Curation Criteria**
Edit `lib/curate-stories.ts`:
- Change scoring weights (diaspora appeal, positive framing, etc.)
- Add/remove negative keywords
- Adjust top stories limit (default: 5)

### **Modify Article Style**
Edit `lib/generate-article.ts`:
- Change word count (default: 600-800)
- Adjust tone (energetic, formal, casual)
- Customize structure (hook, context, closing)

---

## 🚨 **TROUBLESHOOTING**

### **Error: "ANTHROPIC_API_KEY not set"**
- **Solution:** Make sure you've added your API key to `.env.local`
- **Check:** Open `.env.local` and verify the key starts with `sk-ant-`

### **Error: "No stories fetched"**
- **Solution:** Check your internet connection
- **Check:** Some RSS feeds might be temporarily down
- **Fix:** Run again in 5-10 minutes

### **Error: "Failed to generate article"**
- **Solution:** Check Claude API rate limits (50 requests/min)
- **Fix:** Wait 60 seconds and try again

### **Error: "Module not found"**
- **Solution:** Run `npm install` to install dependencies
- **Check:** Make sure you're in the project directory

---

## 📊 **NEXT STEPS (WEEK 1)**

### **1. Automate Daily Content (Day 2)**
Create a cron job to run the pipeline daily:
```bash
# Add to crontab (runs at 6 AM daily)
0 6 * * * cd ~/Downloads/monokromatik-production\ 2/ && npm run test:pipeline
```

### **2. Publish to Site (Day 3)**
- Import articles from `generated-articles.json`
- Upload to Sanity CMS
- Deploy to Vercel

### **3. Add Newsletter (Day 4)**
- Integrate ConvertKit
- Auto-send top 5 articles every Sunday

### **4. Enable Monetization (Day 5)**
- Apply for Ezoic
- Set up Google AdSense
- Add Amazon affiliate links

---

## 💡 **PRO TIPS**

1. **Start Small:** Run with 3-5 feeds first, then scale up
2. **Monitor Quality:** Review first 10 generated articles manually
3. **Adjust Prompts:** Fine-tune curation/generation prompts based on output quality
4. **Track Metrics:** Monitor which categories perform best (culture vs sports vs music)
5. **Build Iteratively:** Week 1 = basic automation, Week 2 = add features, Week 3 = refine

---

## 🎯 **SUCCESS METRICS (Week 1)**

- ✅ 3-5 articles published daily
- ✅ 50% with images
- ✅ 10% with videos
- ✅ All focused on culture/sports/entertainment
- ✅ Zero negative narratives

---

## 🆘 **NEED HELP?**

- **Documentation:** Check `/lib/*.ts` files for inline comments
- **Examples:** Look at `output/` files for sample output
- **Debug Mode:** Add `console.log()` to scripts for detailed logs

---

## 🎉 **YOU'RE READY!**

Your AI-powered content pipeline is fully set up. Run `npm run test:pipeline` and watch the magic happen!

**Questions?** Just ask! 🚀
