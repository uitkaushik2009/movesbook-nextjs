# 🚀 Deployment Guide - MovesBook.com

## 📋 Pre-Deployment Checklist

### Critical Security Steps
- [ ] Change admin password from default
- [ ] Set strong `ADMIN_PASSWORD_HASH` in production .env
- [ ] Verify `private.pem` is secure and not in version control
- [ ] Configure production database (PostgreSQL recommended)
- [ ] Set up HTTPS/SSL
- [ ] Configure environment variables

---

## Production Deployment

### 1. Environment Configuration

Create `.env.production`:

```env
# Database (use PostgreSQL for production)
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# Admin Credentials
ADMIN_USERNAME="your_admin_username"
ADMIN_EMAIL="your_admin@email.com"
ADMIN_PASSWORD_HASH="generate_with_hash-admin-password.js"

# Security
NODE_ENV=production
```

### 2. Security Setup

```bash
# Generate production admin password
node hash-admin-password.js
# Copy hash to .env.production

# Verify private.pem exists
ls private.pem

# Ensure .gitignore includes sensitive files
```

### 3. Database Migration

For PostgreSQL:

```bash
# Update prisma/schema.prisma
# Change: provider = "sqlite"
# To:     provider = "postgresql"

# Push schema to production database
npx prisma db push

# Migrate users (if needed)
node migrate-users.js
```

### 4. Build & Deploy

```bash
# Install dependencies
npm install --production

# Build for production
npm run build

# Start production server
npm start
```

### 5. Security Checklist

- [ ] Change admin password from default
- [ ] Set strong JWT_SECRET
- [ ] Use HTTPS only
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Set secure headers
- [ ] Backup database regularly

### 6. Recommended Hosting

**Vercel** (Easiest):
```bash
vercel deploy
```

**Docker**:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📝 Post-Deployment

1. Test all authentication flows
2. Verify admin access works
3. Check database connections
4. Monitor error logs
5. Set up backup strategy

---

**Ready for production deployment** ✅

