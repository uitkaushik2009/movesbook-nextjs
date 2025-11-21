# 🚀 DEPLOY MOVESBOOK.COM

## ✅ READY FOR PRODUCTION

---

## 🎯 Quick Deploy

### Vercel (Recommended - Easiest)
```bash
vercel deploy --prod
```

### Manual Server
```bash
npm run build
npm start
```

### Docker
```bash
docker build -t movesbook .
docker run -d -p 3000:3000 movesbook
```

---

## ⚙️ Required Before Deploy

### 1. Set Production Environment

Create `.env.production`:
```env
DATABASE_URL="postgresql://..."
ADMIN_PASSWORD_HASH="generate_with_hash-admin-password.js"
NODE_ENV=production
```

### 2. Generate Admin Password
```bash
node hash-admin-password.js
```

---

## 📊 What You're Deploying

- ✅ 946 users from movesbook.net
- ✅ User + Admin authentication
- ✅ Transparent login modals
- ✅ Secure bcrypt + JWT
- ✅ Mobile responsive
- ✅ Production optimized

---

## 🎊 DEPLOY NOW!

**Choose method above and launch!** 🚀

See `DEPLOYMENT.md` for detailed guide.

