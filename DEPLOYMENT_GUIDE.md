# GitHub Deployment Guide (Urdu/Hindi)

Is guide mein step-by-step instructions hain ki aap apne Next.js dashboard project ko GitHub par kaise deploy karein.

## Prerequisites

- Git installed hona chahiye ([Download Git](https://git-scm.com/download/win))
- GitHub account hona chahiye
- Node.js aur npm installed hona chahiye (already hai)

---

## Part 1: GitHub Par Code Push Karna

### Step 1: Git Repository Initialize Karein

```bash
cd c:\Users\ads\Desktop\dashboard
git init
```

### Step 2: GitHub Par Naya Repository Banayein

1. [GitHub.com](https://github.com) par jayein aur login karein
2. Top-right corner mein **"+"** icon par click karein → **"New repository"** select karein
3. Repository details bharein:
   - **Repository name**: `nexusbot-dashboard` (ya koi bhi naam)
   - **Description** (optional): "Dashboard for Nexus Bot"
   - **Visibility**: Public ya Private (aapki choice)
   - ⚠️ **Important**: "Add README file", ".gitignore", ya "license" ko **checked NA karein**
4. **"Create repository"** par click karein

### Step 3: Files Ko Stage Aur Commit Karein

```bash
# Sabhi files ko add karein (except jo .gitignore mein hain)
git add .

# Pehla commit banayein
git commit -m "Initial commit: Dashboard project"
```

### Step 4: GitHub Repository Ko Remote Ke Taur Par Add Karein

GitHub par naya repository banne ke baad, aapko ek URL milega. Woh use karein:

```bash
# Replace YOUR_USERNAME aur YOUR_REPO_NAME apne actual values se
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Example:
# git remote add origin https://github.com/username/nexusbot-dashboard.git
```

### Step 5: Code Ko GitHub Par Push Karein

```bash
# Main branch ko rename karein (agar zarurat ho)
git branch -M main

# Code push karein
git push -u origin main
```

✅ **Congratulations!** Aapka code ab GitHub par hai!

---

## Part 2: Vercel Par Live Deploy Karna (Recommended for Next.js)

Next.js projects ke liye **Vercel** sabse best deployment platform hai (yeh free bhi hai).

### Step 1: Vercel Account Banayein

1. [Vercel.com](https://vercel.com) par jayein
2. **"Sign Up"** par click karein
3. **"Continue with GitHub"** select karein aur authorize karein

### Step 2: Project Import Karein

1. Vercel dashboard mein **"Add New"** → **"Project"** par click karein
2. Apni GitHub repository select karein (`nexusbot-dashboard`)
3. **"Import"** par click karein

### Step 3: Environment Variables Set Karein

Aapke `.env.local` file mein environment variables hain. Woh Vercel mein add karne honge:

1. **"Environment Variables"** section mein jayein
2. Apne `.env.local` file se values copy karein aur add karein:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY`
   - Etc. (jo bhi aapke `.env.local` mein hai)

### Step 4: Deploy Karein

1. **"Deploy"** button par click karein
2. Wait karein (2-3 minutes)
3. ✅ Deployment complete! Aapko ek live URL milega jaise: `https://your-project.vercel.app`

---

## Part 3: Future Updates Deploy Karna

Jab bhi aap code mein changes karein:

```bash
# Changes ko stage karein
git add .

# Commit with message
git commit -m "Updated feature X"

# Push to GitHub
git push
```

**Vercel automatically naya build deploy kar dega!** 🎉

---

## Alternative: GitHub Pages (Static Sites Only)

⚠️ **Note**: GitHub Pages sirf static sites ke liye hai. Next.js apps ko Vercel ya similar platform par deploy karein.

---

## Troubleshooting

### Problem: Git command not found
**Solution**: Git install karein: https://git-scm.com/download/win

### Problem: Authentication failed when pushing
**Solution**: GitHub Personal Access Token use karein:
1. GitHub → Settings → Developer settings → Personal access tokens → Generate new token
2. Token ko password ki jagah use karein

### Problem: Vercel build failed
**Solution**: 
- Environment variables check karein
- Build logs check karein
- Ensure `package.json` mein sahi scripts hain (`build`, `start`)

---

## Commands Quick Reference

```bash
# Status check
git status

# Naye changes add aur push karna
git add .
git commit -m "Your message here"
git push

# Remote repository dekhna
git remote -v

# Branches dekhna
git branch
```

---

## Important Notes

- ✅ `.env.local` file GitHub par push **nahi** hogi (good for security)
- ✅ Sensitive keys ko hamesha environment variables mein rakhein
- ✅ Production deployment ke liye Vercel use karein (free tier available)
- ✅ Har meaningful change ke baad commit karein

---

## Help & Resources

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
