# CONVERTKIT SETUP GUIDE

## 📧 Newsletter Integration Status: ✅ CODE COMPLETE

All newsletter code is ready! You just need to add your ConvertKit credentials.

---

## 🔑 STEP 1: GET YOUR CONVERTKIT CREDENTIALS

### **A) Create ConvertKit Account**
1. Go to https://convertkit.com
2. Sign up (free up to 300 subscribers)
3. Complete account setup

### **B) Create a Form**
1. In ConvertKit dashboard → Forms → Create Form
2. Choose "Inline" or "Modal" type
3. Name it: "MonoKromatik Newsletter"
4. Design it (or use default)
5. **Copy the Form ID** (you'll need this)
   - Found in URL: `https://app.convertkit.com/forms/designers/[FORM_ID]/edit`

### **C) Get Your API Key**
1. Click your profile (top right) → Settings
2. Click "Advanced" → "API & Webhooks"
3. **Copy your API Key**

---

## 🛠️ STEP 2: ADD TO YOUR PROJECT

Create a file `.env.local` in your project root:

```bash
# ConvertKit Configuration
CONVERTKIT_API_KEY=your_api_key_here
CONVERTKIT_FORM_ID=your_form_id_here
```

**Example:**
```bash
CONVERTKIT_API_KEY=sk_1234567890abcdef
CONVERTKIT_FORM_ID=5678901
```

---

## 📍 STEP 3: NEWSLETTER IS ALREADY INTEGRATED!

The newsletter signup form is already added to:

✅ **Homepage** - Hero section (large, centered)  
✅ **Article Pages** - Footer (encourages subscription after reading)  
✅ **About Page** - Sidebar (captures interested visitors)

**Variants Available:**
1. **Default** - Homepage hero (large, prominent)
2. **Footer** - Article footer (post-read conversion)
3. **Sidebar** - About page sidebar (compact)

---

## 🎨 WHAT IT LOOKS LIKE

### Homepage Version:
```
┌─────────────────────────────────────────┐
│          GET THE PULSE                  │
│          ──────────────                 │
│                                          │
│  Every Sunday, 8AM GMT.                 │
│  The African stories BBC won't tell you.│
│  5-minute read. No spam.                │
│                                          │
│  [YOUR@EMAIL.COM] [JOIN 1,247 READERS]  │
│                                          │
│  ⚡ Last week: Burna Boy, PSL drama     │
└─────────────────────────────────────────┘
```

---

## ✅ TESTING (DEV MODE)

**Current Behavior:**
- Newsletter form works WITHOUT ConvertKit credentials (dev mode)
- Shows success message to test UI
- **IMPORTANT:** Add real credentials before launch!

**To Test:**
1. Run: `npm run dev`
2. Go to: `http://localhost:3000`
3. Try signing up with your email
4. Should see success message

---

## 🚀 DEPLOYMENT CHECKLIST

Before deploying to production:

- [ ] Create ConvertKit account
- [ ] Create form and get Form ID
- [ ] Get API key from settings
- [ ] Add credentials to `.env.local` locally
- [ ] Add credentials to Vercel environment variables:
  1. Go to Vercel dashboard
  2. Select monokromatik-network project
  3. Settings → Environment Variables
  4. Add `CONVERTKIT_API_KEY`
  5. Add `CONVERTKIT_FORM_ID`
  6. Redeploy

---

## 📊 TRACKING SUBSCRIBERS

In ConvertKit dashboard:
- View total subscribers
- See signup sources
- Track email open rates
- Segment by tags
- Export subscriber list

---

## 🎯 NEXT STEPS

1. **Get ConvertKit credentials** (5 minutes)
2. **Add to `.env.local`** (1 minute)
3. **Test locally** (2 minutes)
4. **Add to Vercel** (3 minutes)
5. **Deploy** (automatic)
6. **Start collecting emails!** 📈

---

**Questions?** The newsletter component is in:
- `/app/components/NewsletterSignup.tsx`
- `/app/api/newsletter/route.ts`

**Status:** ✅ READY TO COLLECT EMAILS (just add credentials!)
