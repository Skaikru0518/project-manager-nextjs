# Vercel Deploy Guide

## Prerequisites
1. Vercel account
2. GitHub repository with this code
3. PostgreSQL database (AWS RDS or similar)

## Environment Variables
Set these in Vercel Dashboard > Settings > Environment Variables:

```
DATABASE_URL=postgresql://[user]:[password]@[host]/[database]
JWT_SECRET=[generate-secure-random-string]
NEXTAUTH_SECRET=[generate-secure-random-string]
NEXTAUTH_URL=https://your-domain.vercel.app
```

## Deploy Steps

### Option 1: Via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# For production
vercel --prod
```

### Option 2: Via GitHub Integration
1. Push code to GitHub
2. Import project in Vercel Dashboard
3. Select your repository
4. Configure environment variables
5. Deploy

## Build Configuration
- Framework: Next.js
- Build Command: `prisma generate && prisma db push && next build`
- Output Directory: `.next`
- Install Command: `npm install`

## Database Setup
Before first deploy, ensure your PostgreSQL database is ready:
1. Database should be accessible from Vercel (public or whitelisted IPs)
2. Run migrations: `prisma db push`

## Post-Deploy
1. Update NEXTAUTH_URL to your production domain
2. Test authentication flow
3. Monitor logs in Vercel Dashboard

## Troubleshooting
- If build fails: Check Vercel build logs
- Database connection issues: Verify DATABASE_URL and network access
- Auth issues: Verify JWT_SECRET and NEXTAUTH_SECRET are set correctly