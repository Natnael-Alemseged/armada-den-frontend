# 🚀 Vercel Deployment Quick Start

## Copy-Paste Environment Variables for Vercel

### Step 1: Go to Vercel Dashboard
1. Visit [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project (or import it first)
3. Go to **Settings** → **Environment Variables**

### Step 2: Add These Variables

Copy and paste these variables one by one:

#### Variable 1: NEXT_PUBLIC_API_URL
```
Name: NEXT_PUBLIC_API_URL
Value: https://your-backend-api.com/api
```
**Replace** `https://your-backend-api.com/api` with your actual backend URL

#### Variable 2: NEXT_PUBLIC_APP_URL
```
Name: NEXT_PUBLIC_APP_URL
Value: https://your-project.vercel.app
```
**Replace** `https://your-project.vercel.app` with your Vercel deployment URL

#### Variable 3 (Optional): OPENAI_API_KEY
```
Name: OPENAI_API_KEY
Value: sk-...your-key-here
```
Only add if you're using OpenAI features

---

## Quick Deploy Steps

### Option A: Deploy via Vercel Dashboard (Easiest)

1. **Import Project**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Git Repository"
   - Select your repository
   - Click "Import"

2. **Configure Project**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (leave as is)
   - Build Command: `npm run build` (auto-filled)
   - Output Directory: `.next` (auto-filled)

3. **Add Environment Variables**
   - Click "Environment Variables"
   - Add the variables from Step 2 above
   - Select "Production", "Preview", and "Development" for each

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete
   - Your app is live! 🎉

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables
vercel env add NEXT_PUBLIC_API_URL production
# Enter: https://your-backend-api.com/api

vercel env add NEXT_PUBLIC_APP_URL production
# Enter: https://your-project.vercel.app

# Deploy to production
vercel --prod
```

---

## Post-Deployment Checklist

After deployment, verify these:

- [ ] **Homepage loads** - Visit your Vercel URL
- [ ] **Login works** - Try to register/login
- [ ] **API connection** - Check browser console for errors
- [ ] **Environment variables** - Verify in Vercel dashboard
- [ ] **CORS settings** - Ensure backend allows your Vercel domain
- [ ] **SSL/HTTPS** - Should be automatic with Vercel
- [ ] **Custom domain** (optional) - Add in Vercel settings

---

## Common Issues & Fixes

### ❌ "Network Error" or API not connecting

**Fix:**
1. Check `NEXT_PUBLIC_API_URL` is correct
2. Verify backend CORS allows your Vercel domain
3. Ensure backend is publicly accessible (not localhost)

### ❌ Environment variables not working

**Fix:**
1. Ensure variable names start with `NEXT_PUBLIC_`
2. Redeploy after adding variables (Vercel → Deployments → Redeploy)
3. Check variable values have no extra spaces

### ❌ Build fails

**Fix:**
1. Check build logs in Vercel dashboard
2. Ensure all dependencies are in `package.json`
3. Try building locally first: `npm run build`

### ❌ 404 on routes

**Fix:**
1. Ensure you're using Next.js App Router (not Pages Router)
2. Check file structure matches Next.js conventions
3. Verify `next.config.ts` is properly configured

---

## Update Deployment

To update your deployed app:

1. **Push to Git**
   ```bash
   git add .
   git commit -m "Your changes"
   git push
   ```

2. **Automatic Deploy**
   - Vercel automatically deploys on push to main branch
   - Check deployment status in Vercel dashboard

3. **Manual Redeploy**
   - Go to Vercel dashboard
   - Click "Deployments"
   - Click "..." on latest deployment
   - Click "Redeploy"

---

## Custom Domain Setup

1. Go to **Project Settings** → **Domains**
2. Click "Add Domain"
3. Enter your domain (e.g., `app.yourdomain.com`)
4. Follow DNS configuration instructions
5. Wait for DNS propagation (5-30 minutes)

---

## Environment Variables Reference

| Variable | Example | Required |
|----------|---------|----------|
| `NEXT_PUBLIC_API_URL` | `https://api.example.com/api` | ✅ Yes |
| `NEXT_PUBLIC_APP_URL` | `https://app.example.com` | ✅ Yes |
| `OPENAI_API_KEY` | `sk-proj-...` | ⚠️ Optional |

---

## Support

- 📖 Full guide: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- 🐛 Issues: Check browser console and Vercel logs
- 💬 Vercel Docs: [vercel.com/docs](https://vercel.com/docs)

---

**Ready to deploy? Start with Option A above! 🚀**
