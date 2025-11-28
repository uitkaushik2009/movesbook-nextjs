# Movesbook Next.js - Production Ready

## 🚀 Workout Management System

A comprehensive fitness and sports management platform built with Next.js, Prisma, and MySQL.

---

## ✨ Features

### Core Features
- 🏋️ **Workout Management** - Create, track, and manage workout plans
- 📊 **Analytics & Progress Tracking** - Visualize your fitness journey
- 👥 **Multi-User Support** - Athletes, Coaches, Admins, Teams, Clubs
- 🌐 **12 Languages** - Full internationalization support
- 🎨 **Customizable Themes** - Light, Dark, Auto, Time-based modes
- 📱 **Responsive Design** - Works on all devices

### Admin Features
- 🔧 **Language Management** - Manage translations for all supported languages
- 🎨 **Color Schemes** - Customize application colors
- ⚙️ **Display Settings** - Configure grid layouts, themes, fonts
- 👤 **User Management** - Manage 1,600+ users
- 🏢 **Organization Management** - Clubs, Teams, Groups, Coaching

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14
- **Database:** MySQL (via Prisma ORM)
- **Styling:** Tailwind CSS
- **Authentication:** JWT + bcrypt
- **State Management:** React Context API
- **TypeScript:** Full type safety

---

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- MySQL 8.0+
- npm or yarn

### Setup

```bash
# 1. Clone the repository
git clone <repository-url>
cd movesbook-nextjs

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp env.example .env
# Edit .env with your database credentials

# 4. Run Prisma migrations
npx prisma db push
npx prisma generate

# 5. Start development server
npm run dev
```

---

## 🗄️ Database

### Schema
The application uses Prisma ORM with MySQL:
- **24 Prisma models** for core functionality
- **1,606 users** migrated and active
- **5,424 translations** across 12 languages
- **75 clubs** and organizations

### Key Tables
- `users_new` - User accounts
- `translations` - All language translations
- `user_settings` - Admin configurations
- `clubs_new`, `teams_new`, `groups_new` - Organizations
- `workout_*` - Workout data (7 tables)

---

## 🌐 Supported Languages

- 🇬🇧 English
- 🇫🇷 French
- 🇩🇪 German
- 🇮🇹 Italian
- 🇪🇸 Spanish
- 🇵🇹 Portuguese
- 🇷🇺 Russian
- 🇮🇳 Hindi
- 🇨🇳 Chinese
- 🇸🇦 Arabic
- 🇯🇵 Japanese
- 🇮🇩 Indonesian

---

## 🔐 Authentication

### User Types
- **Athlete** - Track personal workouts
- **Coach** - Manage athlete programs
- **Team Manager** - Oversee team activities
- **Club Trainer** - Club-level management
- **Group Admin** - Group administration
- **Admin** - Full system access

### Login
- Email/Username + Password
- JWT token-based sessions
- Hybrid authentication (supports legacy users)

---

## 📁 Project Structure

```
movesbook-nextjs/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   ├── contexts/         # React contexts
│   ├── hooks/            # Custom hooks
│   ├── lib/              # Utility libraries
│   └── types/            # TypeScript types
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Database migrations
├── public/               # Static assets
└── package.json          # Dependencies

```

---

## 🚀 Deployment

### Production Build

```bash
# 1. Build the application
npm run build

# 2. Start production server
npm start
```

### Docker Deployment

```bash
# Build Docker image
docker build -t movesbook-nextjs .

# Run container
docker run -p 3000:3000 -e DATABASE_URL="mysql://..." movesbook-nextjs
```

### Environment Variables

Required for production:

```env
DATABASE_URL="mysql://user:password@host:3306/database"
JWT_SECRET="your-secure-secret-key"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="https://yourdomain.com"
```

---

## 📊 Admin Panel

Access at: `/admin`

### Features
- Dashboard with system overview
- User management (1,600+ users)
- Language & translation management
- Color scheme customization
- Display mode configuration
- System settings

---

## 🎨 Customization

### Themes
- **Light Mode** - Clean, bright interface
- **Dark Mode** - Easy on the eyes
- **Auto Mode** - Follows system preference
- **Time-Based** - Auto-switch at 6 AM/PM

### Colors
- Customizable color schemes
- Save/export color configurations
- Pre-defined schemes available

### Display
- Grid size: Compact, Comfortable, Spacious
- Font sizes: 14px - 20px
- Sidebar positioning: Fixed, Floating
- Image quality settings

---

## 📝 API Routes

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/admin/login` - Admin login

### Translations
- `GET /api/admin/translations` - Fetch all translations
- `POST /api/admin/translations/update` - Update translations
- `POST /api/admin/translations/sync` - Sync from static files

### User Settings
- `GET /api/user/settings` - Get user settings
- `POST /api/user/settings` - Save user settings
- `PATCH /api/user/settings` - Update specific settings

---

## 🔧 Development

### Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Prisma Studio (database GUI)
npx prisma studio

# Generate Prisma client
npx prisma generate
```

---

## 📚 Documentation

Comprehensive documentation available:
- `DATA-PERSISTENCE-GUIDE.md` - Database and persistence details

---

## 🤝 Support

For issues or questions:
- Create an issue in the repository
- Contact system administrator

---

## 📄 License

Proprietary - All rights reserved

---

## 🎉 Version

**v2.0.0** - Production Ready (Prisma Edition)

- ✅ Full Prisma ORM integration
- ✅ 1,606 users migrated
- ✅ 5,424 translations active
- ✅ 12 languages supported
- ✅ Production optimized

---

**Built with ❤️ using Next.js and Prisma**

