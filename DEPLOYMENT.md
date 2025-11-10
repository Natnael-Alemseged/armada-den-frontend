# Deployment Guide - Armada Den Frontend

This guide will help you deploy the Armada Den frontend application to Vercel or other hosting platforms.

## 📋 Prerequisites

- Node.js 18+ installed
- A backend API running and accessible
- A Vercel account (or other hosting platform)

## 🔐 Environment Variables

### Required Variables

Copy these environment variables to your deployment platform:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://your-backend-api.com/api

# Application URL
NEXT_PUBLIC_APP_URL=https://your-frontend-domain.com
```

### Optional Variables

```bash
# OpenAI API Key (if using client-side AI features)
OPENAI_API_KEY=your-openai-api-key

# Analytics (optional)
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=your-ga-id

# Error Tracking (optional)
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

## 🚀 Deploy to Vercel

### Method 1: Using Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Add environment variables:
```bash
vercel env add NEXT_PUBLIC_API_URL
vercel env add NEXT_PUBLIC_APP_URL
```

5. Deploy to production:
```bash
vercel --prod
```

### Method 2: Using Vercel Dashboard

1. **Import Project**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New" → "Project"
   - Import your Git repository

2. **Configure Build Settings**
   - Framework Preset: `Next.js`
   - Build Command: `npm run build` (or `pnpm build`)
   - Output Directory: `.next`
   - Install Command: `npm install` (or `pnpm install`)

3. **Add Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add the following variables:

   ```
   NEXT_PUBLIC_API_URL = https://your-backend-api.com/api
   NEXT_PUBLIC_APP_URL = https://your-frontend-domain.com
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete

## 🌐 Deploy to Other Platforms

### Netlify

1. **Build Settings**
   ```
   Build command: npm run build
   Publish directory: .next
   ```

2. **Environment Variables**
   - Add the same environment variables as Vercel
   - Go to Site Settings → Environment Variables

### AWS Amplify

1. **Build Settings**
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm install
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

2. **Environment Variables**
   - Add environment variables in App Settings → Environment Variables

### Docker Deployment

1. **Create Dockerfile** (if not exists):
   ```dockerfile
   FROM node:18-alpine AS base

   # Install dependencies
   FROM base AS deps
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci

   # Build the application
   FROM base AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   RUN npm run build

   # Production image
   FROM base AS runner
   WORKDIR /app
   ENV NODE_ENV production
   
   RUN addgroup --system --gid 1001 nodejs
   RUN adduser --system --uid 1001 nextjs

   COPY --from=builder /app/public ./public
   COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
   COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

   USER nextjs
   EXPOSE 3000
   ENV PORT 3000

   CMD ["node", "server.js"]
   ```

2. **Build and Run**:
   ```bash
   docker build -t armada-den-frontend .
   docker run -p 3000:3000 \
     -e NEXT_PUBLIC_API_URL=https://your-api.com/api \
     -e NEXT_PUBLIC_APP_URL=https://your-domain.com \
     armada-den-frontend
   ```

## ✅ Post-Deployment Checklist

- [ ] Verify API connection is working
- [ ] Test user authentication (login/register)
- [ ] Test Gmail integration
- [ ] Test search functionality
- [ ] Test chat functionality
- [ ] Verify all environment variables are set correctly
- [ ] Check browser console for errors
- [ ] Test on mobile devices
- [ ] Verify CORS settings on backend
- [ ] Set up custom domain (if applicable)
- [ ] Configure SSL/HTTPS
- [ ] Set up monitoring/analytics (optional)

## 🔧 Troubleshooting

### API Connection Issues

**Problem**: "Network Error" or "Failed to fetch"

**Solutions**:
1. Verify `NEXT_PUBLIC_API_URL` is correct
2. Check CORS settings on backend
3. Ensure backend is accessible from deployment
4. Check browser console for detailed errors

### Authentication Not Working

**Problem**: Login fails or redirects incorrectly

**Solutions**:
1. Verify backend API endpoints are correct
2. Check that cookies/credentials are being sent
3. Ensure `withCredentials: true` is set in axios
4. Verify CORS allows credentials

### Environment Variables Not Loading

**Problem**: App uses default values instead of env vars

**Solutions**:
1. Ensure variables start with `NEXT_PUBLIC_` for client-side access
2. Rebuild and redeploy after adding variables
3. Check variable names match exactly (case-sensitive)
4. Verify variables are set in deployment platform

### Build Failures

**Problem**: Build fails during deployment

**Solutions**:
1. Check Node.js version (should be 18+)
2. Clear cache and rebuild
3. Check for TypeScript errors
4. Verify all dependencies are installed

## 📊 Performance Optimization

1. **Enable Caching**
   - Configure CDN caching for static assets
   - Use Vercel's Edge Network

2. **Image Optimization**
   - Use Next.js Image component
   - Configure image domains in `next.config.js`

3. **Code Splitting**
   - Already handled by Next.js
   - Use dynamic imports for large components

4. **Monitoring**
   - Set up Vercel Analytics
   - Configure error tracking (Sentry)
   - Monitor API response times

## 🔒 Security Considerations

1. **Environment Variables**
   - Never commit `.env.local` to Git
   - Use different keys for development/production
   - Rotate API keys regularly

2. **HTTPS**
   - Always use HTTPS in production
   - Configure secure cookies

3. **CORS**
   - Configure backend CORS to allow only your domain
   - Don't use `*` in production

4. **API Keys**
   - Keep OpenAI and other API keys secure
   - Use backend proxy for sensitive operations

## 📞 Support

If you encounter issues during deployment:
1. Check the browser console for errors
2. Review deployment logs
3. Verify all environment variables
4. Test API endpoints independently

---

**Last Updated**: November 2025
