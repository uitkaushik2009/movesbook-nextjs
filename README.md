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

### Authentication & User Management
- ✅ **Transparent login modals** with glass morphism
- ✅ **Email or username login**
- ✅ **Admin panel** with dedicated authentication
- ✅ **User type management** (Athlete, Coach, Team, Club)

### 🆕 Comprehensive Workout Management System ✅ **PHASES 1-3 COMPLETE - 99% Compliant!**
- ✅ **Hierarchical Structure**: Year → Week → Day → Session → Moveframe → Movelap
- ✅ **Four Sections**:
  - Section A: Current Microcycle (3 weeks)
  - Section B: Yearly Workout Plan (52 weeks)
  - Section C: Workouts Done (Sport Diary)
  - Section D: Archive/Templates Library **✨ NEW - PHASE 2**
- ✅ **Complete Sport-Specific Forms**: All 12 sports fully implemented
  - Swimming (distance, speed, style, pace/100m)
  - Cycling (cadence, power, gear, terrain)
  - Running (incline, terrain, HR zones)
  - Strength (sets, reps, weight, tempo)
  - Rowing (stroke rate, pace/500m, power)
  - Generic (duration, intensity for 7 other sports)
- ✅ **Visual Status Tracking**: 7 status states with color-coded symbols (Circle, Square, Triangle)
- ✅ **Customizable Settings**:
  - Training Periods (with colors)
  - Workout Sections (with colors)
  - Main Sports ordering (drag-to-reorder)
- ✅ **Auto-Generation**: Movelaps generated from reps (e.g., "400m x 6" creates 6 movelaps)
- ✅ **Multi-User Support**: Athletes, Coaches, Team Managers, Club Trainers
- ✅ **Three-Column Layout**: Left sidebar (navigation), Central grid (workouts), Right sidebar (tools)
- ✅ **Expand/Collapse Hierarchy**: Day → Workout → Moveframe → Movelap
- ✅ **Translation Support**: 100+ translatable keys
- ✅ **Integrated Workout Page**: Accessible from navigation at `/workouts`
- ✅ **Add Workout Flow**: Create workouts with auto-status calculation and validation
- ✅ **Template System** **✨ PHASE 2**:
  - Save favorite workouts/days as templates
  - Search and filter templates (by sport, difficulty, tags)
  - Apply templates instantly with 1-click
  - Track template usage and popularity
  - Rich metadata (distance, duration, difficulty)
- ✅ **Drag & Drop** **✨ PHASE 2**:
  - Drag sport icons to workouts
  - Reorder workouts within day
  - Reorder moveframes within workout
  - Visual feedback and drop zones
  - Faster workout creation
- ✅ **Copy/Move/Paste** **✨ PHASE 2**:
  - Copy workouts between days
  - Move workouts with cut/paste
  - Copy/move moveframes between workouts
  - Clipboard system with visual feedback
  - Preserves complete data structure
- ✅ **Coach-Athlete Management** **✨ PHASE 3**:
  - Athlete selector for coaches
  - Add athletes by email
  - View athlete workout plans
  - Assign workouts to athletes
  - Coach notes for each athlete
- ✅ **Import from Coach** **✨ PHASE 3**:
  - Browse coach's shared templates
  - Search and filter workouts
  - 1-click import to any day
  - Template sharing system
- ✅ **Section C - Workouts Done** **✨ PHASE 3**:
  - Mark workouts as done with details
  - Completion percentage tracking
  - Actual performance data (HR, calories, feeling)
  - Filter view for completed workouts
  - Real-time statistics dashboard
- ✅ **Keyboard Shortcuts** **✨ PHASE 3**:
  - Ctrl+C/Cmd+C to copy
  - Ctrl+X/Cmd+X to cut
  - Ctrl+V/Cmd+V to paste
  - Escape to close modals
  - Delete key support
- ✅ **Print & Export** **✨ PHASE 3**:
  - Print workouts (day/week/all)
  - Export to JSON (complete structure)
  - Export to CSV (Excel-compatible)
  - Customizable export options

### UI/UX
- ✅ **Mobile responsive design**
- ✅ **Modern UI/UX** with Tailwind CSS
- ✅ **Translation system** (multi-language support)

📖 **Workout System Documentation**:
- [Phase 3 Complete](docs/PHASE3-COMPLETE.md) ✅ **NEW - 100% Done! 99% Compliant!** 🎉
- [Phase 2 Complete](docs/PHASE2-COMPLETE.md) ✅
- [Phase 1 Complete](docs/PHASE1-IMPLEMENTATION-COMPLETE.md) ✅
- [Validation Report](docs/WORKOUT-VALIDATION-REPORT.md)
- [Gap Analysis](docs/WORKOUT-GAPS-SUMMARY.md)
- [Next Steps (Phase 3-4)](docs/WORKOUT-NEXT-STEPS.md)
- [Quick Start Guide](docs/WORKOUT-QUICKSTART.md)
- [Complete System Documentation](docs/WORKOUT-SYSTEM-COMPLETE.md)
- [Implementation Summary](docs/WORKOUT-IMPLEMENTATION-SUMMARY.md)

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

