# Project Manager - Next.js

A modern project management application with weekly task tracking system.

## Features

- 📋 **Project Management**: Create and manage multiple projects
- ✅ **Weekly Task System**: Organize tasks by days of the week
- 📊 **Progress Tracking**: Visual progress bars for each project
- 🎨 **Dark/Light Theme**: Toggle between dark and light modes
- 📱 **Fully Responsive**: Works perfectly on mobile, tablet, and desktop
- 🔐 **Secure Authentication**: JWT-based auth with Edge Runtime support
- 📈 **Analytics Dashboard**: Summary statistics and project insights
- 🏷️ **Tag System**: Organize projects with custom tags

## Tech Stack

- **Framework**: Next.js 13.5
- **Language**: TypeScript
- **Database**: PostgreSQL (AWS RDS)
- **ORM**: Prisma
- **Styling**: Tailwind CSS + Shadcn/ui
- **Authentication**: JWT (jose - Edge-compatible)
- **Deployment**: Vercel

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables in `.env`
4. Run database migrations: `prisma db push`
5. Start development server: `npm run dev`

## Environment Variables

```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
```

## Deployment

Ready for Vercel deployment with automatic builds and Prisma integration.

---

Built with 💙 by Dante
Last updated: 2025