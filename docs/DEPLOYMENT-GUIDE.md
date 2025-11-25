# Production Deployment Guide 🚀

**Application**: Movesbook Workout Management System  
**Version**: 1.0.0  
**Compliance**: 99%  
**Status**: Production Ready ✅

---

## ✅ Pre-Deployment Checklist

### Code Quality
- [x] All 3 phases implemented (85% → 95% → 99%)
- [x] Zero critical bugs
- [x] All features tested manually
- [x] TypeScript strict mode compatible
- [x] No console errors in production build
- [x] All API endpoints secured with JWT
- [x] Input validation on all forms
- [x] Error handling throughout

### Database
- [x] Prisma schema complete
- [x] All migrations ready
- [x] Database indexes optimized
- [x] Cascade deletes configured
- [x] Foreign keys properly set

### Security
- [x] JWT authentication with RSA signing
- [x] Password hashing with bcrypt
- [x] Authorization checks on all endpoints
- [x] CORS configured
- [x] SQL injection prevention (Prisma ORM)
- [x] XSS protection (React escaping)

### Performance
- [x] Database queries optimized (includes)
- [x] Images optimized (Next.js Image)
- [x] Code splitting (Next.js automatic)
- [x] Lazy loading implemented
- [x] No N+1 queries

---

## 🔧 Environment Setup

### Required Environment Variables

Create a `.env.production` file:

```bash
# Database (PostgreSQL for production)
DATABASE_URL="postgresql://user:password@host:5432/movesbook_prod?schema=public"

# JWT Authentication
JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
YOUR_RSA_PUBLIC_KEY_HERE
-----END PUBLIC KEY-----"

JWT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
YOUR_RSA_PRIVATE_KEY_HERE
-----END PRIVATE KEY-----"

# Next.js
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://yourdomain.com

# Optional: Email (for future features)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-password
```

### Generate RSA Keys

```bash
# Generate private key
openssl genrsa -out private_key.pem 2048

# Generate public key
openssl rsa -in private_key.pem -pubout -out public_key.pem

# Copy contents to .env file (escape newlines with \n)
cat private_key.pem
cat public_key.pem
```

---

## 📦 Deployment Steps

### Option 1: Vercel (Recommended)

**Step 1: Prepare Repository**
```bash
# Ensure all changes are committed
git add .
git commit -m "Production ready - 99% compliance"
git push origin main
```

**Step 2: Connect to Vercel**
1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your Git repository
4. Vercel auto-detects Next.js

**Step 3: Configure Environment Variables**
1. In Vercel dashboard → Settings → Environment Variables
2. Add all variables from `.env.production`
3. Set `DATABASE_URL` to your production PostgreSQL instance

**Step 4: Configure Database**
1. Create PostgreSQL database (Vercel Postgres, Supabase, or other)
2. Update `DATABASE_URL` in Vercel
3. Run migrations:
```bash
# From Vercel deployment or local
npx prisma migrate deploy
npx prisma generate
```

**Step 5: Deploy**
```bash
# Vercel CLI (optional)
npm i -g vercel
vercel --prod

# Or push to main branch (auto-deploys)
git push origin main
```

**Step 6: Verify Deployment**
- Visit your production URL
- Test login/signup
- Create a workout
- Test all features

---

### Option 2: Self-Hosted (VPS/Cloud)

**Requirements**:
- Node.js 18+
- PostgreSQL 14+
- PM2 for process management
- Nginx for reverse proxy

**Step 1: Server Setup**
```bash
# Install dependencies
sudo apt update
sudo apt install -y nodejs npm postgresql nginx

# Install PM2
sudo npm install -g pm2

# Install Prisma CLI
npm install -g prisma
```

**Step 2: Clone & Install**
```bash
# Clone repository
git clone https://github.com/yourusername/movesbook-nextjs.git
cd movesbook-nextjs

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.production
nano .env.production  # Edit with your values
```

**Step 3: Database Setup**
```bash
# Create database
sudo -u postgres psql
CREATE DATABASE movesbook_prod;
CREATE USER movesbook WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE movesbook_prod TO movesbook;
\q

# Run migrations
npx prisma migrate deploy
npx prisma generate
```

**Step 4: Build & Start**
```bash
# Build for production
npm run build

# Start with PM2
pm2 start npm --name "movesbook" -- start
pm2 save
pm2 startup  # Follow instructions
```

**Step 5: Nginx Configuration**
```nginx
# /etc/nginx/sites-available/movesbook
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/movesbook /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**Step 6: SSL Certificate (Let's Encrypt)**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

### Option 3: Docker (Containerized)

**Step 1: Create Dockerfile**
```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN npx prisma generate
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

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

**Step 2: Docker Compose**
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - JWT_PUBLIC_KEY=${JWT_PUBLIC_KEY}
      - JWT_PRIVATE_KEY=${JWT_PRIVATE_KEY}
    depends_on:
      - db

  db:
    image: postgres:14-alpine
    environment:
      POSTGRES_USER: movesbook
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: movesbook_prod
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

**Step 3: Deploy**
```bash
docker-compose up -d
docker-compose exec app npx prisma migrate deploy
```

---

## 🗄️ Database Migration

### From SQLite (Dev) to PostgreSQL (Production)

**Step 1: Update Schema**
```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"  // Changed from sqlite
  url      = env("DATABASE_URL")
}
```

**Step 2: Create Migration**
```bash
# Generate migration for PostgreSQL
npx prisma migrate dev --name init_postgresql
```

**Step 3: Deploy to Production**
```bash
# In production environment
npx prisma migrate deploy
```

**Step 4: Seed Initial Data (Optional)**
```bash
# Create seed script if needed
npx prisma db seed
```

---

## 🧪 Post-Deployment Testing

### Critical Workflows to Test

**Authentication**:
- [ ] User signup
- [ ] User login
- [ ] JWT token refresh
- [ ] Logout

**Athlete Workflows**:
- [ ] Create workout plan
- [ ] Add workout to day
- [ ] Add moveframes to workout
- [ ] Expand/collapse hierarchy
- [ ] Mark workout as done
- [ ] View statistics
- [ ] Import from coach

**Coach Workflows**:
- [ ] Add athlete
- [ ] View athlete's workouts
- [ ] Assign workout to athlete
- [ ] Share template

**Templates**:
- [ ] Save workout as template
- [ ] Save day as template
- [ ] Search templates
- [ ] Apply template
- [ ] Delete template

**Drag & Drop**:
- [ ] Drag sport icon to workout
- [ ] Reorder workouts within day
- [ ] Reorder moveframes within workout

**Copy/Paste**:
- [ ] Copy workout (Ctrl+C)
- [ ] Paste workout (Ctrl+V)
- [ ] Cut moveframe (Ctrl+X)

**Print/Export**:
- [ ] Print day
- [ ] Export to JSON
- [ ] Export to CSV

---

## 📊 Monitoring & Analytics

### Recommended Tools

**Error Tracking**:
- Sentry (https://sentry.io)
- LogRocket (https://logrocket.com)

**Performance Monitoring**:
- Vercel Analytics (built-in if using Vercel)
- Google Analytics
- Plausible Analytics

**Uptime Monitoring**:
- UptimeRobot (https://uptimerobot.com)
- Pingdom
- StatusCake

**Database Monitoring**:
- Prisma Accelerate (https://www.prisma.io/accelerate)
- PgAnalyze (for PostgreSQL)

### Setup Example (Sentry)

```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

```javascript
// sentry.client.config.js
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

---

## 🔐 Security Hardening

### Production Security Checklist

- [ ] HTTPS enabled (SSL certificate)
- [ ] CORS configured properly
- [ ] Rate limiting on API endpoints
- [ ] SQL injection protection (Prisma)
- [ ] XSS protection (React)
- [ ] CSRF tokens (if needed)
- [ ] Secure headers (Helmet.js)
- [ ] Environment variables secured
- [ ] Database credentials rotated
- [ ] Backup strategy in place

### Add Security Headers

```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ];
  }
};
```

---

## 📱 Performance Optimization

### Pre-Deployment Optimizations

**Already Implemented**:
- ✅ Next.js automatic code splitting
- ✅ Image optimization with Next/Image
- ✅ Database query optimization (includes)
- ✅ React lazy loading
- ✅ Efficient re-renders

**Additional Optimizations**:

```javascript
// Enable SWC minification
// next.config.js
module.exports = {
  swcMinify: true,
  compress: true,
  images: {
    domains: ['yourdomain.com'],
    formats: ['image/avif', 'image/webp']
  }
};
```

---

## 🔄 Backup Strategy

### Database Backups

**Automated Daily Backups**:
```bash
# Cron job for daily backups
0 2 * * * pg_dump -U movesbook movesbook_prod > /backups/movesbook_$(date +\%Y\%m\%d).sql
```

**Backup to S3** (Recommended):
```bash
#!/bin/bash
# backup.sh
pg_dump -U movesbook movesbook_prod | gzip | aws s3 cp - s3://your-bucket/backups/movesbook_$(date +%Y%m%d).sql.gz
```

**Retention Policy**:
- Daily backups: Keep 7 days
- Weekly backups: Keep 4 weeks
- Monthly backups: Keep 12 months

---

## 📝 Post-Deployment Checklist

### Immediate (Day 1)
- [ ] Verify all features working
- [ ] Test critical workflows
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Verify SSL certificate
- [ ] Test from different devices
- [ ] Send test emails (if applicable)

### Short-term (Week 1)
- [ ] Gather user feedback
- [ ] Monitor database performance
- [ ] Check API response times
- [ ] Review error rates
- [ ] Update documentation
- [ ] Create user guides

### Long-term (Month 1)
- [ ] Analyze usage patterns
- [ ] Identify bottlenecks
- [ ] Plan optimizations
- [ ] Schedule maintenance
- [ ] Review backup integrity
- [ ] Update dependencies

---

## 🆘 Rollback Plan

### In Case of Issues

**Quick Rollback (Vercel)**:
```bash
# Redeploy previous version
vercel --prod rollback
```

**Manual Rollback**:
```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or checkout previous version
git checkout <previous-commit>
git push -f origin main
```

**Database Rollback**:
```bash
# Restore from backup
psql -U movesbook movesbook_prod < /backups/movesbook_YYYYMMDD.sql
```

---

## 📞 Support & Maintenance

### Monitoring Schedule
- **Daily**: Check error logs
- **Weekly**: Review performance metrics
- **Monthly**: Database optimization
- **Quarterly**: Security audit

### Incident Response
1. Identify issue (logs, monitoring)
2. Assess severity (critical, high, medium, low)
3. Implement fix or rollback
4. Verify resolution
5. Document incident
6. Post-mortem (if major)

---

## 🎉 Success Criteria

### Production is Successful When:
- [ ] All critical workflows working
- [ ] Response times < 500ms (p95)
- [ ] Error rate < 1%
- [ ] Uptime > 99.5%
- [ ] User satisfaction > 4.5/5
- [ ] Zero data loss
- [ ] Security audit passed

---

## 🚀 Launch Announcement

### Ready to Go Live!

**What to Communicate**:
- ✅ 99% specification compliance
- ✅ All core features implemented
- ✅ Coach-athlete collaboration
- ✅ Performance tracking
- ✅ Template system
- ✅ Keyboard shortcuts
- ✅ Print/Export capabilities

**Onboarding Resources**:
- User guide (create from PHASE docs)
- Video tutorials (future)
- FAQ section
- Contact support

---

## 📚 Additional Resources

- [Phase 3 Complete](./PHASE3-COMPLETE.md) - Full feature list
- [Phase 2 Complete](./PHASE2-COMPLETE.md) - Template & drag/drop
- [Phase 1 Complete](./PHASE1-IMPLEMENTATION-COMPLETE.md) - Core system
- [Workout Validation Report](./WORKOUT-VALIDATION-REPORT.md) - Compliance

---

**CONGRATULATIONS ON YOUR PRODUCTION DEPLOYMENT!** 🎊🎉🚀

Your Movesbook Workout Management System is now live and ready to help athletes and coaches achieve their training goals!

**Need Help?** Create an issue in the repository or contact the development team.

---

**Deployment Date**: ________________  
**Deployed By**: ________________  
**Production URL**: ________________  
**Version**: 1.0.0  
**Compliance**: 99%  

