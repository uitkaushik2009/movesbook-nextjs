# 🚀 Movesbook Deployment Guide

## ✅ What's Included

This deployment ensures:
- ✅ All legacy users can login with original credentials
- ✅ SHA1 password support (no conversion needed)
- ✅ Case-insensitive username/email login
- ✅ Long text translations visible
- ✅ Forgot Password feature
- ✅ Complete database migration

---

## 📊 Current Local Database Status

```
👥 Users: 1,607 total
   - SHA1 passwords: 930 users ✅
   - Bcrypt passwords: 2 users ✅
   - Other: 675 users

📝 Translations: 5,463 total
   - Long texts: 40+ sentences ✅

✅ Test users working:
   - magiw (SHA1)
   - alessia (SHA1)
   - admin (bcrypt)
```

---

## 🎯 Quick Deploy to Server

### Method 1: Automated (Recommended)

```bash
# On your local machine:
git add .
git commit -m "Complete migration with long texts and legacy user support"
git push origin main

# On the server (SSH):
ssh -i "D:\GoingOn\Longterm\private.pem" developer@217.154.202.41
cd movesbook-nextjs
git pull origin main
chmod +x deploy-complete.sh
./deploy-complete.sh
```

**That's it!** Everything will be automatically:
- Schema updated
- Users migrated
- Translations seeded
- App built and restarted

---

### Method 2: Manual Steps

If you prefer step-by-step control:

```bash
# 1. Pull latest code
git pull origin main

# 2. Install dependencies
npm install

# 3. Generate Prisma Client
npx prisma generate

# 4. Update database schema
npx prisma db push --accept-data-loss

# 5. Migrate legacy users
node migrate-legacy-users.js

# 6. Seed translations
npm run db:seed

# 7. Build application
rm -rf .next
npm run build

# 8. Restart
pm2 restart movesbook
```

---

## 🔍 Verify Deployment

After deployment, check:

```bash
# Check database state
node check-database.js

# Should show:
# ✅ Users migrated
# ✅ Translations seeded
# ✅ Test users found
```

---

## 🧪 Test Login

Try these test credentials on the server:

| Username | Password | Type | Hash |
|----------|----------|------|------|
| magiw | 7221 | Athlete | SHA1 |
| alessia | 5803 | Group Admin | SHA1 |

**Login URL:** `http://217.154.202.41:3000`

---

## 📁 Files Created

### **Migration Scripts:**
- `migrate-legacy-users.js` - Migrates users from legacy `users` table to `users_new`
- `prisma/seed-translations.ts` - Seeds 15 long text translations (45 entries)
- `check-database.js` - Diagnostic tool to verify database state

### **Deployment Scripts:**
- `deploy-complete.sh` - One-command deployment (Linux/Mac)
- `deploy-translations.sh` - Translation-focused deployment

### **Documentation:**
- `MIGRATION-COMPLETE.md` - Previous migration summary
- `FORGOT-PASSWORD-IMPLEMENTATION.md` - Password reset feature docs
- `DEPLOYMENT-GUIDE.md` - This file

---

## 🔧 Troubleshooting

### Problem: Users can't login after deployment

**Solution 1: Check if users were migrated**
```bash
node check-database.js
```

**Solution 2: Run migration manually**
```bash
node migrate-legacy-users.js
```

**Solution 3: Verify password hashing**
```bash
mysql -u movesbook_user -p'SecurePassword2024!' movesbook_nextjs \
  -e "SELECT username, LEFT(password, 10) as pwd_start, LENGTH(password) as pwd_len FROM users_new LIMIT 5;"
```
- SHA1 = 40 characters
- Bcrypt = 60 characters

---

### Problem: Long texts not showing

**Solution 1: Seed translations**
```bash
npm run db:seed
```

**Solution 2: Check translation count**
```bash
mysql -u movesbook_user -p'SecurePassword2024!' movesbook_nextjs \
  -e "SELECT COUNT(*) as total, COUNT(CASE WHEN LENGTH(value) > 100 THEN 1 END) as long FROM translations;"
```

**Solution 3: Check API response**
```bash
curl http://localhost:3000/api/admin/translations | jq '.translations | length'
```

---

### Problem: Build fails

**Solution: Clean and rebuild**
```bash
rm -rf .next node_modules
npm install
npx prisma generate
npm run build
```

---

## 🎉 Success Indicators

You'll know deployment succeeded when:

✅ `pm2 status` shows app running  
✅ Users can login with legacy credentials  
✅ Language Settings shows 40+ long texts  
✅ No TypeScript errors in build  
✅ No 401 errors in browser console  
✅ Forgot Password works with security questions  

---

## 📞 Support

If issues persist after deployment:

1. Run `node check-database.js` and share output
2. Check PM2 logs: `pm2 logs movesbook --lines 50`
3. Check browser console (F12) for errors
4. Verify `.env` database credentials are correct

---

**Your deployment is ready! 🚀**

