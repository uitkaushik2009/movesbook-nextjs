# 🚀 Pre-Deployment Checklist

**Run this checklist BEFORE deploying to ensure all users can login with previous credentials.**

---

## ✅ Step 1: Verify Local Workspace

### 1.1 Check Prisma Schema
```bash
# Verify User model has @@map("users_new")
grep -A50 "model User" prisma/schema.prisma | grep "@@map"
```
**Expected:** `@@map("users_new")`

### 1.2 Verify Authentication Files
```bash
# Check SHA1 support in auth.ts
grep -n "hashPasswordSHA1\|hashedPassword.length === 40" src/lib/auth.ts
```
**Expected:** Both functions present

### 1.3 Test Local Database Connection
```bash
# Count users in local database
npx prisma studio
# Or
node check-database.js
```
**Expected:** See your 75 users with SHA1 passwords

---

## ✅ Step 2: Run Pre-Deployment Check Script

```bash
chmod +x pre-deployment-check.sh
./pre-deployment-check.sh
```

**Expected:** All checks pass ✅

---

## ✅ Step 3: Verify Critical Files Exist

Required files:
- ✅ `prisma/schema.prisma` - Has `@@map("users_new")`
- ✅ `src/lib/auth.ts` - SHA1 support
- ✅ `src/app/api/auth/login/route.ts` - Main login
- ✅ `migrate-legacy-users.js` - User migration
- ✅ `check-database.js` - Database verification
- ✅ `deploy-complete.sh` - Deployment automation
- ✅ `prisma/seed-translations.ts` - Translation seeding

---

## ✅ Step 4: Test Locally

### 4.1 Generate Prisma Client
```bash
npx prisma generate
```

### 4.2 Test Build
```bash
npm run build
```
**Expected:** No TypeScript errors

### 4.3 Test Local Login
```bash
npm run dev
```
Visit `http://localhost:3000` and test:
- ✅ magiw / 7221
- ✅ alessia / 5803

---

## ✅ Step 5: Prepare for Deployment

### 5.1 Commit All Changes
```bash
git add .
git commit -m "Complete user authentication system with SHA1 support"
git push origin main
```

### 5.2 Verify GitHub
Check that all files are pushed to GitHub

---

## 🚀 Step 6: Deploy to Server

### 6.1 SSH to Server
```bash
ssh -i "D:\GoingOn\Longterm\private.pem" developer@217.154.202.41
```

### 6.2 Pull Latest Code
```bash
cd movesbook-nextjs
git pull origin main
```

### 6.3 Run Complete Deployment
```bash
chmod +x deploy-complete.sh
./deploy-complete.sh
```

**This will:**
1. Install dependencies
2. Generate Prisma Client
3. Update database schema
4. Migrate legacy users (if table exists)
5. Seed translations
6. Build application
7. Restart with PM2

---

## ✅ Step 7: Verify Deployment

### 7.1 Check Database
```bash
node check-database.js
```
**Expected:** All users migrated, correct password counts

### 7.2 Test User Logins
Visit `http://217.154.202.41:3000` or `https://movesbook.com`

Test these users:
- ✅ magiw / 7221
- ✅ alessia / 5803
- ✅ admin / admin (if exists)

### 7.3 Check PM2 Logs
```bash
pm2 logs movesbook --lines 50
```
**Expected:** No errors, app running

### 7.4 Monitor for 401 Errors
Open browser console (F12) and check for:
- ❌ No 401 Unauthorized errors
- ✅ Successful API calls

---

## 🔧 Troubleshooting

### Issue: Users can't login (401 error)

**Solution 1: Check if users exist**
```bash
mysql -u movesbook_user -p'SecurePassword2024!' movesbook_nextjs \
  -e "SELECT COUNT(*) FROM users_new;"
```

**Solution 2: Run migration manually**
```bash
node migrate-legacy-users.js
```

**Solution 3: Verify @@map is set**
```bash
grep "@@map" prisma/schema.prisma
npx prisma generate
pm2 restart movesbook
```

---

### Issue: Password hash doesn't match

**Check password type:**
```bash
mysql -u movesbook_user -p'SecurePassword2024!' movesbook_nextjs \
  -e "SELECT username, LENGTH(password), LEFT(password, 10) FROM users_new LIMIT 5;"
```
- SHA1 = 40 characters
- bcrypt = 60 characters

---

### Issue: Long texts not showing

**Solution:**
```bash
npm run db:seed
pm2 restart movesbook
```

---

## 📋 Post-Deployment Checklist

After deployment, verify:
- ✅ All existing users can login
- ✅ SHA1 passwords work
- ✅ New user registration works
- ✅ Password reset works
- ✅ Language settings show long texts
- ✅ No 401 errors in browser console
- ✅ PM2 shows app as "online"
- ✅ Database has all users

---

## 🎯 Success Criteria

✅ **Deployment is successful when:**
1. `check-database.js` shows correct user count
2. Test logins work (magiw, alessia)
3. No 401 errors in browser console
4. PM2 shows `online` status
5. All legacy users can login with original passwords

---

## 📞 Emergency Rollback

If deployment fails critically:
```bash
# On server
cd movesbook-nextjs
git log --oneline -5  # Find previous commit
git checkout <previous-commit-hash>
npm run build
pm2 restart movesbook
```

---

**Last updated:** December 1, 2025

