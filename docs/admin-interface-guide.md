# 🛡️ Admin Interface Guide

## Overview

The admin interface provides a dedicated system administration panel with a professional Movesbook-branded navbar for managing the entire platform.

---

## 📍 Access

**URL:** `/admin/dashboard`

**Login:** Use Admin Login modal from the main site

**Requirements:** Must have `ADMIN` user type

---

## 🎨 Admin Navbar Design

The admin navbar features a professional red-themed design matching Movesbook branding:

### **Top Bar (Red)**
```
┌─────────────────────────────────────────────────────────────────────────┐
│ [Logo] Movesbook          System Administration    [User Info] [Photo] │
│        The Global Sport Network...                                       │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Left Section:
- **Logo** - White box with "Logo" text
- **Movesbook** - Yellow "Moves" + White "book"
- **Tagline** - "The Global Sport Network, Your Sport Network"

#### Center:
- **System Administration** - Large yellow title

#### Right Section:
- **Current Operator** label
- **Admin Name** with dropdown indicator
- **Last Login** timestamp
- **Profile Photo** (or initials)
- **Settings Icon**

### **Navigation Bar (Dark Gray)**
```
┌─────────────────────────────────────────────────────────────────────────┐
│ home | Single User | Coaches | Groups | Teams | Settings | 🌐 English  │
│                                               Search in [All Users] 🔍  │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Left Side Menu Items:
1. 🏠 **home** - Admin dashboard
2. 👤 **Single User** - Individual user management
3. 🛡️ **Coaches** - Coach management
4. 👥 **Groups** - Group management
5. 👨‍👩‍👧‍👦 **Teams** - Team management
6. ⚙️ **Settings** - System settings & language editor
7. 🌐 **Language** - Dropdown to switch interface language

#### Right Side:
- **Search Bar** with category selector
- Categories: All Users, Athletes, Coaches, Teams, Clubs, Groups

---

## 📊 Admin Pages

### 1. Dashboard (`/admin/dashboard`)

**Features:**
- Overview statistics cards
  - Total Users
  - Active Coaches
  - Teams & Groups
  - Active Sessions
- Recent activity feed
- Quick access to main functions

### 2. Single User (`/admin/single-user`)

**Purpose:** Manage individual users

**Features:**
- Search by name, email, or ID
- Filter users by type
- User table with:
  - ID
  - Name
  - Email
  - Type (Athlete, Coach, etc.)
  - Status
  - Actions
- Add new user button

### 3. Coaches (`/admin/coaches`)

**Purpose:** Manage coaches and their assigned athletes

**Coming Soon:**
- Coach profiles
- Athlete assignments
- Performance metrics
- Certification tracking

### 4. Groups (`/admin/groups`)

**Purpose:** Manage groups and their members

**Coming Soon:**
- Group list
- Member management
- Group activities
- Reports

### 5. Teams (`/admin/teams`)

**Purpose:** Manage teams and their rosters

**Coming Soon:**
- Team list
- Roster management
- Team statistics
- Schedules

### 6. Settings (`/settings`)

**Purpose:** System settings and language management

**Features:**
- Access to all system settings
- **Language Section:**
  - Edit translations with rich text editor
  - Pagination through 300+ keys
  - 10 language editors
  - Add new languages

---

## 🔐 Security Features

### Authentication
- Separate admin login system
- Admin token stored in localStorage
- Auto-redirect to home if not logged in

### Session Management
- Displays last login time
- Shows current session duration
- Logout button in navbar

### Access Control
- All admin pages check for admin status
- Automatic redirect for unauthorized users
- Protected routes via middleware

---

## 🎯 Key Features

### ✨ Professional Design
- Movesbook-branded interface
- Red and yellow color scheme
- Clean, modern layout
- Responsive design

### ✨ Unified Navigation
- Persistent navbar across all admin pages
- Current page highlighting
- Easy access to all sections

### ✨ Language Support
- Switch interface language from navbar
- 10 languages supported
- Translations persist across sessions

### ✨ Search Functionality
- Global search bar in navbar
- Category filtering
- Search across user types

### ✨ User Context
- Always shows current operator
- Profile photo/initials
- Last login information
- Quick logout access

---

## 🚀 Usage Workflow

### Daily Admin Tasks

1. **Login**
   ```
   Main Site → Admin Login → Enter Credentials → Dashboard
   ```

2. **Manage Users**
   ```
   Single User → Search/Filter → Edit User → Save
   ```

3. **Edit Translations**
   ```
   Settings → Languages Tab → Navigate Keys → Edit → Save
   ```

4. **Switch Language**
   ```
   Click Language Dropdown → Select Language → Interface Updates
   ```

5. **Search Platform**
   ```
   Search Bar → Select Category → Enter Query → Search
   ```

6. **Logout**
   ```
   Click Settings Icon → Logout
   ```

---

## 🎨 Design Specifications

### Color Palette
- **Primary Red:** `#991B1B` to `#B91C1C` (Red 800-700)
- **Secondary Yellow:** `#FDE047` (Yellow 300)
- **Navigation Gray:** `#374151` (Gray 700)
- **Background:** `#F9FAFB` (Gray 50)

### Typography
- **Logo:** Bold, 3xl (30px)
- **System Administration:** Bold, 3xl (30px)
- **Page Titles:** Bold, 3xl (30px)
- **Nav Items:** Medium, base (16px)
- **Body Text:** Regular, sm (14px)

### Spacing
- **Container:** Max-width 1800px
- **Padding:** 24px (6 units)
- **Section Gaps:** 32px (8 units)

---

## 💡 Tips & Best Practices

### For Admins

1. **Regular Monitoring**
   - Check dashboard daily
   - Review recent activity
   - Monitor user statistics

2. **User Management**
   - Use filters to find specific users
   - Keep user types organized
   - Update statuses regularly

3. **Translation Management**
   - Edit translations systematically
   - Use pagination to work through keys
   - Save frequently

4. **Search Efficiently**
   - Use category filters
   - Be specific in queries
   - Bookmark common searches

### For Developers

1. **Adding New Admin Pages**
   - Use AdminNavbar component
   - Check admin authentication
   - Follow existing design patterns

2. **Extending Navigation**
   - Add items to AdminNavbar
   - Create corresponding pages
   - Update middleware if needed

3. **Maintaining Consistency**
   - Use Movesbook color scheme
   - Follow layout structure
   - Keep navbar persistent

---

## 📋 Components Reference

### AdminNavbar (`src/components/AdminNavbar.tsx`)

**Props:** None (reads from localStorage)

**Features:**
- Displays current admin user
- Language switcher
- Navigation menu
- Search functionality
- Responsive design

**Usage:**
```tsx
import AdminNavbar from '@/components/AdminNavbar';

export default function AdminPage() {
  return (
    <div>
      <AdminNavbar />
      {/* Page content */}
    </div>
  );
}
```

---

## 🔮 Future Enhancements

Planned features:

1. **Dashboard Analytics**
   - Real-time charts
   - User growth graphs
   - Activity heatmaps

2. **Advanced Search**
   - Multi-field search
   - Saved searches
   - Export results

3. **Notification System**
   - Admin alerts
   - System messages
   - Activity notifications

4. **Bulk Operations**
   - Batch user updates
   - Mass email notifications
   - Bulk imports/exports

5. **Reports & Analytics**
   - Custom reports
   - Data exports
   - Scheduled reports

---

## 🆚 Admin vs Regular Interface

| Feature | Admin Interface | Regular Interface |
|---------|----------------|-------------------|
| **Navbar** | Red Movesbook branded | Gradient cyan/purple |
| **Access** | Admin only | All users |
| **Purpose** | System management | User functionality |
| **Design** | Professional/corporate | Modern/sporty |
| **Features** | User management, settings | Profile, workouts, teams |

---

## ❓ FAQ

**Q: How do I access the admin interface?**  
A: Use the Admin Login modal from the main site with admin credentials.

**Q: Can regular users access admin pages?**  
A: No, admin pages check for ADMIN user type and redirect unauthorized users.

**Q: How do I add new menu items to the admin navbar?**  
A: Edit `src/components/AdminNavbar.tsx` and add the new navigation link.

**Q: Can I customize the admin navbar colors?**  
A: Yes, but maintain Movesbook branding (red, yellow, white).

**Q: Where do I manage translations?**  
A: Settings → Languages tab provides the rich text translation editor.

**Q: How do I logout from admin?**  
A: Click the Settings icon in the top right corner.

---

## 🎉 Summary

The admin interface provides:

- 🛡️ **Professional admin panel** with Movesbook branding
- 🎨 **Unified navigation** across all admin sections
- 🌐 **Multi-language support** built into navbar
- 🔍 **Global search** with category filtering
- 👤 **User context** always visible
- ⚙️ **Direct access** to settings and translations
- 🔐 **Secure authentication** and session management

**Perfect for system administrators managing the Movesbook platform!**

---

**Need help?** Check the specific page guides or contact the development team.

