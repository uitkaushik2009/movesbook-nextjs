# MovesBook.com - Workout Management System

Modern workout tracking and management platform for athletes, coaches, teams, and clubs.

**Status**: ✅ Production Ready  
**Users**: 946 migrated from movesbook.net  
**Authentication**: JWT with RSA signing + bcrypt hashing

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma db push

# Start development server
npm run dev
```

Visit: http://localhost:3000

### Production Build

```bash
npm run build
npm start
```

## 🔐 Authentication

### User Login
- Login with **email** or **username**
- Supports athletes, coaches, team managers, and club trainers
- JWT-based authentication with RSA signing

### Admin Login
- Access via Admin button in navbar
- Secure bcrypt password hashing
- Environment variable configuration

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 14.2.33
- **Language**: TypeScript 5.0
- **UI**: React 18
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion

### Backend
- **API**: Next.js API Routes
- **Database**: SQLite (dev) / PostgreSQL (production)
- **ORM**: Prisma 6.19.0
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt

## 📁 Project Structure

```
movesbook/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── api/            # API routes (backend)
│   │   ├── admin/          # Admin pages
│   │   └── ...             # Other pages
│   ├── components/          # React components
│   ├── lib/                # Utilities & auth
│   ├── hooks/              # Custom React hooks
│   └── types/              # TypeScript types
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── dev.db             # SQLite database
├── public/                 # Static assets
└── package.json
```

## 🔑 Environment Variables

Create a `.env` file:

```env
DATABASE_URL="file:./prisma/dev.db"
ADMIN_USERNAME="admin"
ADMIN_EMAIL="admin@movesbook.com"
ADMIN_PASSWORD_HASH="your_bcrypt_hash_here"
```

Generate admin password hash:
```bash
node hash-admin-password.js
```

## 🗄️ Database

### Setup
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# View database
npx prisma studio
```

### User Migration
To migrate users from movesbook.net:
```bash
node migrate-users.js
```

## 🔐 Security Features

- ✅ **bcrypt password hashing** (12 rounds)
- ✅ **JWT tokens** with RSA-256 signing
- ✅ **No plain text passwords**
- ✅ **Environment variable configuration**
- ✅ **Auto password upgrade** (SHA1 → bcrypt)
- ✅ **Secure authentication flow**

## 🎨 Features

- ✅ **Transparent login modals** with glass morphism
- ✅ **Email or username login**
- ✅ **Admin panel** with dedicated authentication
- ✅ **User type management** (Athlete, Coach, Team, Club)
- ✅ **Workout planning & tracking**
- ✅ **Mobile responsive design**
- ✅ **Modern UI/UX**

## 📦 Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:push      # Push schema to database
npm run db:studio    # Open Prisma Studio
```

## 🛠️ Utilities

### Admin Tools
```bash
node hash-admin-password.js    # Generate admin password hash
node reset-user-password.js    # Reset user password
```

### Migration Tools
```bash
node migrate-users.js          # Migrate users from movesbook.net
node generate-keys.js          # Generate RSA key pair
```

## 🚀 Deployment

### Environment Setup

1. **Generate RSA Keys** (if not already done):
```bash
node generate-keys.js
```

2. **Set Environment Variables**:
```env
NODE_ENV=production
DATABASE_URL=your_production_database_url
ADMIN_PASSWORD_HASH=your_secure_hash
```

3. **Build & Deploy**:
```bash
npm run build
npm start
```

### Recommended Hosting
- Vercel (recommended for Next.js)
- AWS (EC2, ECS, Lambda)
- Google Cloud Platform
- Azure
- Railway
- Digital Ocean

### Database for Production
- PostgreSQL (recommended)
- MySQL
- MongoDB (with Prisma)

Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"  // Change from sqlite
  url      = env("DATABASE_URL")
}
```

## 📄 License

Copyright © 2025 MovesBook

## 🤝 Support

For issues or questions, contact the development team.

---

**Version**: 1.0.0  
**Status**: Production Ready ✅  
**Last Updated**: November 2025

