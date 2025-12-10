# 🗺️ NEXT STEPS ROADMAP - Movesbook Development

## 📊 Current Status: ✅ Core CRUD Operations Complete

---

## 🎯 PHASE 1: MOVEFRAME FEATURES (PRIORITY: HIGH)

### **1.1 Moveframe Copy/Move Operations**
**Current**: Alert "coming soon"  
**Need**: Full implementation

**Tasks**:
- [ ] Create `CopyMoveframeModal` component
- [ ] Add API endpoint: `POST /api/workouts/moveframes/copy`
- [ ] Add API endpoint: `POST /api/workouts/moveframes/move`
- [ ] Implement moveframe selection UI
- [ ] Add target workout selection
- [ ] Handle movelaps during copy/move
- [ ] Add position selection (before/after/replace)

**Files to Create**:
- `src/components/workouts/modals/CopyMoveframeModal.tsx`
- `src/components/workouts/modals/MoveMoveframeModal.tsx`
- `src/app/api/workouts/moveframes/copy/route.ts`
- `src/app/api/workouts/moveframes/move/route.ts`

**Estimated Time**: 3-4 hours

---

### **1.2 Moveframe Info Panel**
**Current**: Alert "MF Info feature coming soon"  
**Need**: Detailed moveframe information display

**Tasks**:
- [ ] Create `MoveframeInfoPanel` component
- [ ] Show moveframe details (letter, sport, section, type)
- [ ] Display all movelaps in a formatted view
- [ ] Show calculated totals (distance, time, reps)
- [ ] Add quick edit/delete actions
- [ ] Make it expandable/collapsible

**Files to Create**:
- `src/components/workouts/MoveframeInfoPanel.tsx`

**Estimated Time**: 2 hours

---

### **1.3 Column Settings Feature**
**Current**: Alert "Column settings feature coming soon"  
**Need**: Customizable column visibility

**Tasks**:
- [ ] Create `ColumnSettingsModal` component
- [ ] Allow users to show/hide table columns
- [ ] Save preferences to UserSettings
- [ ] Apply settings to all tables
- [ ] Add preset layouts (Minimal, Standard, Full)
- [ ] Add column reordering (drag & drop)

**Files to Create**:
- `src/components/workouts/modals/ColumnSettingsModal.tsx`

**Estimated Time**: 3 hours

---

## 🎯 PHASE 2: BULK OPERATIONS (PRIORITY: MEDIUM)

### **2.1 Bulk Movelap Generation**
**Need**: Auto-generate multiple movelaps at once

**Tasks**:
- [ ] Add "Bulk Add" button in movelap section
- [ ] Create pattern-based generation UI
- [ ] Support variations (linear, pyramid, alternating)
- [ ] Preview before creating
- [ ] Batch insert to database

**Files to Create**:
- `src/components/workouts/BulkMovelapModal.tsx`
- `src/app/api/workouts/movelaps/bulk/route.ts`

**Estimated Time**: 4 hours

---

### **2.2 Template System**
**Need**: Save and load workout templates

**Tasks**:
- [ ] Create "Save as Template" button
- [ ] Build template browser/selector
- [ ] Implement template categories
- [ ] Add template sharing (public/private)
- [ ] Support workout and day templates
- [ ] Quick apply template to any day

**Files to Create**:
- `src/components/workouts/TemplateLibraryModal.tsx`
- `src/components/workouts/SaveTemplateModal.tsx`
- `src/app/api/templates/route.ts`

**Estimated Time**: 6-8 hours

---

## 🎯 PHASE 3: ADVANCED FEATURES (PRIORITY: MEDIUM)

### **3.1 Battery Mode Implementation**
**Current**: Basic support exists  
**Need**: Full battery mode functionality

**Tasks**:
- [ ] Create battery moveframe container
- [ ] Allow multiple moveframes in battery
- [ ] Set cycle/repetition count
- [ ] Calculate total reps across all MFs
- [ ] Display battery in special format
- [ ] Support nested batteries (optional)

**Estimated Time**: 5-6 hours

---

### **3.2 Favorites System**
**Need**: Quick access to frequent exercises

**Tasks**:
- [ ] Add "Save to Favorites" for moveframes
- [ ] Create favorites library panel
- [ ] Categorize favorites by sport
- [ ] Quick insert from favorites
- [ ] Import/export favorites
- [ ] Sync across devices

**Files to Create**:
- `src/components/workouts/FavoritesPanel.tsx`
- `src/app/api/favorites/route.ts`

**Estimated Time**: 4-5 hours

---

### **3.3 Workout Analytics & Reports**
**Need**: Performance tracking and insights

**Tasks**:
- [ ] Weekly/monthly summary views
- [ ] Sport-specific analytics
- [ ] Progress charts (distance, time, volume)
- [ ] Export reports (PDF, Excel)
- [ ] Comparison views (week-to-week)
- [ ] Load/intensity graphs

**Files to Create**:
- `src/components/workouts/AnalyticsPanel.tsx`
- `src/app/api/analytics/route.ts`

**Estimated Time**: 8-10 hours

---

## 🎯 PHASE 4: UI/UX IMPROVEMENTS (PRIORITY: LOW-MEDIUM)

### **4.1 Table Enhancements**
**Tasks**:
- [ ] Add row highlighting on hover
- [ ] Implement sticky headers for long scrolls
- [ ] Add row numbering
- [ ] Color-code by completion status
- [ ] Add quick filters (sport, section, status)
- [ ] Implement sorting (by date, sport, distance)

**Estimated Time**: 3-4 hours

---

### **4.2 Keyboard Shortcuts**
**Need**: Power user efficiency

**Tasks**:
- [ ] Add keyboard navigation (arrows, tab)
- [ ] Quick actions (Ctrl+N for new, Ctrl+E for edit)
- [ ] Copy/paste shortcuts (Ctrl+C, Ctrl+V)
- [ ] Delete shortcut (Del key)
- [ ] Help modal (? key) showing all shortcuts

**Files to Create**:
- `src/hooks/useKeyboardShortcuts.ts`
- `src/components/KeyboardShortcutsHelp.tsx`

**Estimated Time**: 4 hours

---

### **4.3 Drag & Drop Enhancements**
**Current**: Basic D&D exists  
**Need**: Improved UX

**Tasks**:
- [ ] Visual drop zones
- [ ] Better drag previews
- [ ] Undo/redo for moves
- [ ] Multi-select drag
- [ ] Snap-to-position guides

**Estimated Time**: 3-4 hours

---

## 🎯 PHASE 5: MOBILE OPTIMIZATION (PRIORITY: MEDIUM)

### **5.1 Responsive Tables**
**Tasks**:
- [ ] Card view for mobile devices
- [ ] Swipe gestures for actions
- [ ] Bottom sheets for modals
- [ ] Touch-optimized buttons
- [ ] Simplified mobile layout

**Estimated Time**: 6-8 hours

---

### **5.2 Offline Support**
**Tasks**:
- [ ] Service worker setup
- [ ] Cache API responses
- [ ] Queue offline edits
- [ ] Sync when online
- [ ] Conflict resolution

**Estimated Time**: 8-10 hours

---

## 🎯 PHASE 6: COLLABORATION FEATURES (PRIORITY: LOW)

### **6.1 Coach-Athlete Workflow**
**Current**: Basic structure exists  
**Need**: Full implementation

**Tasks**:
- [ ] Coach can assign workouts
- [ ] Athlete receives notifications
- [ ] Feedback/comments on workouts
- [ ] Approval workflow
- [ ] Version history

**Estimated Time**: 10-12 hours

---

### **6.2 Team Training Plans**
**Tasks**:
- [ ] Share workouts with team
- [ ] Role-based permissions
- [ ] Group analytics
- [ ] Team calendar view
- [ ] Bulk operations for team

**Estimated Time**: 8-10 hours

---

## 🎯 IMMEDIATE NEXT STEP (RECOMMENDED)

### 🚀 **START HERE: Moveframe Copy/Move + MF Info Panel**

**Why**:
- Completes core moveframe functionality
- High user value
- Builds on existing patterns
- Moderate complexity
- Can be done in 1 day

**Steps**:
1. Implement Moveframe Copy/Move operations (3-4 hours)
2. Add Moveframe Info Panel (2 hours)
3. Test thoroughly (1 hour)
4. Deploy and get user feedback

---

## 📋 TECHNICAL DEBT TO ADDRESS

### **Code Quality**:
- [ ] Add unit tests for API routes
- [ ] Add integration tests for CRUD operations
- [ ] Implement error boundaries
- [ ] Add loading skeletons
- [ ] Improve error messages
- [ ] Add API rate limiting
- [ ] Implement request caching

### **Performance**:
- [ ] Optimize database queries (add indexes)
- [ ] Implement pagination for large datasets
- [ ] Add virtual scrolling for long lists
- [ ] Lazy load modals
- [ ] Optimize bundle size
- [ ] Add image optimization

### **Security**:
- [ ] Add CSRF protection
- [ ] Implement rate limiting
- [ ] Add input sanitization
- [ ] Audit dependencies
- [ ] Add security headers
- [ ] Implement session timeout

---

## 📊 PRIORITY MATRIX

| Feature | Priority | Effort | Impact | Score |
|---------|----------|--------|--------|-------|
| Moveframe Copy/Move | HIGH | 3h | HIGH | 🔥🔥🔥 |
| MF Info Panel | HIGH | 2h | HIGH | 🔥🔥🔥 |
| Column Settings | MEDIUM | 3h | MEDIUM | 🔥🔥 |
| Bulk Movelaps | MEDIUM | 4h | HIGH | 🔥🔥🔥 |
| Template System | MEDIUM | 8h | HIGH | 🔥🔥 |
| Battery Mode | MEDIUM | 6h | MEDIUM | 🔥🔥 |
| Analytics | LOW | 10h | MEDIUM | 🔥 |
| Mobile Optimization | MEDIUM | 8h | HIGH | 🔥🔥🔥 |
| Keyboard Shortcuts | LOW | 4h | LOW | 🔥 |

---

## 🎯 RECOMMENDED DEVELOPMENT SEQUENCE

### **Week 1**: Core Features Completion
- Day 1-2: Moveframe Copy/Move + MF Info
- Day 3: Column Settings
- Day 4-5: Bulk Movelap Generation

### **Week 2**: Templates & Advanced
- Day 1-3: Template System
- Day 4-5: Battery Mode Full Implementation

### **Week 3**: UX & Performance
- Day 1-2: Table Enhancements
- Day 3-4: Keyboard Shortcuts
- Day 5: Performance Optimization

### **Week 4**: Mobile & Polish
- Day 1-3: Mobile Optimization
- Day 4-5: Bug fixes & Polish

---

## 🤔 WHICH FEATURE SHOULD YOU BUILD NEXT?

**Ask yourself**:
1. What do users need most urgently?
2. What has the best ROI (impact/effort)?
3. What builds on existing code?
4. What provides competitive advantage?

**My recommendation**: Start with **Moveframe Copy/Move + MF Info Panel** because:
- ✅ Users are asking for it (placeholder text)
- ✅ Completes core workflow
- ✅ Relatively quick to implement
- ✅ High user satisfaction
- ✅ Follows existing patterns

---

## 📞 READY TO START?

Choose one of these commands:
1. **"implement moveframe copy/move"** - Start Phase 1.1
2. **"create MF info panel"** - Start Phase 1.2
3. **"add column settings"** - Start Phase 1.3
4. **"show me something else"** - Explore other options

---

**Last Updated**: December 10, 2025  
**Status**: 🎯 Ready for next phase  
**Current Progress**: Core CRUD ✅ Complete

