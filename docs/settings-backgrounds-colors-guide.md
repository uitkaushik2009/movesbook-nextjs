# 🎨 Backgrounds & Colors Settings - Complete Guide

## Overview

The Backgrounds & Colors Settings section provides comprehensive visual customization for your workout interface with real-time preview and accessibility validation.

---

## ✨ Features Implemented

### **1. Page Background**
- ✅ Background color picker
- ✅ Opacity slider (0-100%)
- ✅ Hex color input with validation
- ✅ Visual color swatch preview

### **2. Headers Configuration** (Collapsible Section)
- **Day Headers**
  - Background color
  - Text color (with contrast checker)
- **Moveframe Headers**
  - Background color
  - Text color (with contrast checker)
- **Movelap Headers**
  - Background color
  - Text color (with contrast checker)

### **3. Button Colors** (Collapsible Section)
Each button type has:
- Base color
- Hover state color
- Interactive preview
- **Button Types:**
  - Add Button (Green)
  - Edit Button (Orange)
  - Delete Button (Red)
  - Print Button (Gray)

### **4. Row Colors** (Collapsible Section)
- **Selected Row**
  - Background color
  - Text color (with contrast checker)
- **Alternate Row** (Zebra striping)
  - Background color
  - Text color
- **Microlap Background**
  - Background color
  - Text color

### **5. Live Preview Panel**
- Real-time visual feedback
- Interactive button hover states
- Complete workout interface simulation
- Shows:
  - Day headers
  - Moveframe headers with action buttons
  - Movelap headers
  - Row striping (alternate colors)
  - Selected row highlighting
  - Microlap details section

### **6. Color Scheme Management**
- ✅ **Save** custom color schemes
- ✅ **Load** saved schemes
- ✅ **Delete** schemes
- ✅ **Export** settings to JSON file
- ✅ **Import** settings from JSON file
- ✅ **Reset** to default colors

### **7. Accessibility Features**
- ✅ **Contrast ratio calculation** (WCAG 2.1)
- ✅ **Accessibility warnings** for low contrast
- ✅ **4.5:1 minimum** for normal text
- ✅ Visual indicators (✓ for pass, ⚠ for fail)

### **8. User Experience**
- ✅ Collapsible sections to reduce clutter
- ✅ Sticky preview panel (follows scroll)
- ✅ Color picker with hex input
- ✅ Hover state previews
- ✅ Confirmation dialogs for destructive actions
- ✅ Success/error notifications

---

## 🎯 How to Use

### **Basic Color Customization**

1. **Go to Settings**
   ```
   Settings → Backgrounds & Colors
   ```

2. **Choose an Element**
   - Expand the section (Headers, Buttons, or Rows)
   - Click on the color swatch or edit the hex code
   - See changes instantly in the preview panel

3. **Adjust Opacity**
   - Use the opacity slider for page background
   - Drag from 0% (transparent) to 100% (opaque)

4. **Check Accessibility**
   - Look for contrast ratio indicators
   - Green ✓ means accessible (4.5:1 or higher)
   - Orange ⚠ means low contrast (below 4.5:1)

### **Testing Button Hover States**

1. **In the Preview Panel:**
   - Hover over Add, Edit, Delete, or Print buttons
   - See the hover color in action
   - Adjust hover colors in the Button Colors section

### **Saving Your Color Scheme**

1. **Click "Save Scheme"** button
2. **Enter a name** (e.g., "Ocean Theme", "Dark Mode")
3. **Click Save**
4. **Your scheme appears** in the "Saved Color Schemes" section

### **Loading a Saved Scheme**

1. **Find your scheme** in the saved schemes grid
2. **Click "Load"** button
3. **All colors update** instantly

### **Exporting Settings**

1. **Click "Export"** button
2. **Downloads JSON file** (e.g., `movesbook-colors-1234567890.json`)
3. **Save for backup** or share with team members

### **Importing Settings**

1. **Click "Import"** button
2. **Select JSON file** from your computer
3. **Colors applied automatically**

### **Resetting to Defaults**

1. **Click "Reset"** button
2. **Confirm the action**
3. **All colors revert** to default Movesbook theme

---

## 🎨 Color Customization Guide

### **Default Color Palette**

```typescript
Page Background: #ffffff (White)
Day Header: #f8fafc (Slate 50) + #1e293b (Slate 800 text)
Moveframe Header: #e0f2fe (Sky 100) + #0c4a6e (Sky 900 text)
Movelap Header: #dbeafe (Blue 100) + #1e3a8a (Blue 900 text)
Selected Row: #3b82f6 (Blue 500) + #ffffff (White text)
Alternate Row: #f1f5f9 (Slate 100)

Buttons:
- Add: #10b981 (Green 500) → Hover: #059669 (Green 600)
- Edit: #f59e0b (Amber 500) → Hover: #d97706 (Amber 600)
- Delete: #ef4444 (Red 500) → Hover: #dc2626 (Red 600)
- Print: #6b7280 (Gray 500) → Hover: #4b5563 (Gray 600)
```

### **Recommended Color Combinations**

#### **1. Ocean Theme**
```
Day Header: #e0f2fe (Sky blue) + #0c4a6e (Dark blue text)
Moveframe: #bfdbfe (Light blue) + #1e40af (Blue text)
Selected Row: #2563eb (Blue) + #ffffff (White text)
Buttons: Blue/Cyan tones
```

#### **2. Forest Theme**
```
Day Header: #d1fae5 (Green 100) + #065f46 (Green 800 text)
Moveframe: #a7f3d0 (Green 200) + #047857 (Green 700 text)
Selected Row: #10b981 (Green 500) + #ffffff (White text)
Buttons: Green/Emerald tones
```

#### **3. Sunset Theme**
```
Day Header: #fed7aa (Orange 200) + #7c2d12 (Orange 900 text)
Moveframe: #fecaca (Red 200) + #7f1d1d (Red 900 text)
Selected Row: #f59e0b (Amber 500) + #ffffff (White text)
Buttons: Warm tones (Orange/Red/Yellow)
```

#### **4. Professional Gray**
```
Day Header: #f1f5f9 (Slate 100) + #1e293b (Slate 800 text)
Moveframe: #e2e8f0 (Slate 200) + #334155 (Slate 700 text)
Selected Row: #475569 (Slate 600) + #ffffff (White text)
Buttons: Grayscale with one accent color
```

#### **5. High Contrast (Accessibility)**
```
All backgrounds: Light colors (#f8fafc or lighter)
All text: Dark colors (#1e293b or darker)
Minimum contrast ratio: 7:1 for enhanced accessibility
Selected items: Bold colors with white text
```

---

## 🔍 Accessibility Guidelines

### **WCAG 2.1 Contrast Requirements**

**Normal Text (16px+):**
- Minimum: 4.5:1 (Level AA)
- Enhanced: 7:1 (Level AAA)

**Large Text (18.5px+ or bold 14px+):**
- Minimum: 3:1 (Level AA)
- Enhanced: 4.5:1 (Level AAA)

### **How to Ensure Accessibility**

1. **Check the contrast ratio indicator**
   - Green ✓ = Pass (4.5:1 or higher)
   - Orange ⚠ = Fail (below 4.5:1)

2. **Fix low contrast combinations**
   - Make text darker
   - Make background lighter
   - Or vice versa

3. **Test with real content**
   - Use the live preview
   - Check readability
   - Ensure buttons are distinguishable

4. **Consider color blindness**
   - Don't rely only on color
   - Use text labels
   - Add icons to buttons

---

## 💾 Data Storage

### **LocalStorage**

Color schemes are saved to browser `localStorage`:
```javascript
Key: 'colorSchemes'
Format: JSON array of ColorScheme objects
```

### **Export Format**

Exported files are JSON:
```json
{
  "pageBackground": "#ffffff",
  "pageBackgroundOpacity": 100,
  "dayHeader": "#f8fafc",
  "dayHeaderText": "#1e293b",
  ...
}
```

### **Persistence**

- Settings persist across sessions
- Saved schemes available after reload
- Export for backup/sharing

---

## 🛠️ Technical Details

### **Component Structure**

```
BackgroundsColorsSettings
├─ Header (Title + Action Buttons)
├─ Save Dialog Modal
├─ Saved Schemes Grid
└─ Two-Column Layout
   ├─ Left Panel (Settings)
   │  ├─ Page Background
   │  ├─ Headers (Collapsible)
   │  ├─ Buttons (Collapsible)
   │  └─ Rows (Collapsible)
   └─ Right Panel (Preview - Sticky)
      └─ Live Workout Interface
```

### **Sub-Components**

1. **ColorPicker**
   - Color swatch (clickable)
   - Hex input field
   - Contrast ratio display
   - Accessibility warning

2. **OpacitySlider**
   - Range input (0-100)
   - Visual gradient
   - Percentage display

3. **CollapsibleSection**
   - Expand/collapse toggle
   - Icon + title header
   - Smooth animations

### **State Management**

```typescript
colors: ColorSettings           // Current color values
savedSchemes: ColorScheme[]     // Saved color schemes
schemeName: string              // Name for new scheme
showSaveDialog: boolean         // Save dialog visibility
hoveredButton: string | null    // Preview hover state
expandedSections: Record        // Section collapse state
```

---

## 🎬 Usage Examples

### **Example 1: Create Ocean Theme**

```
1. Open Backgrounds & Colors Settings
2. Set Day Header: #e0f2fe (Light blue)
3. Set Moveframe Header: #bfdbfe (Sky blue)
4. Set Selected Row: #2563eb (Blue 600)
5. Set Button Add: #06b6d4 (Cyan 500)
6. Set Button Edit: #3b82f6 (Blue 500)
7. Click "Save Scheme"
8. Name it "Ocean Theme"
9. Click Save
```

### **Example 2: Import Team Settings**

```
1. Receive JSON file from teammate
2. Go to Backgrounds & Colors Settings
3. Click "Import" button
4. Select the JSON file
5. Colors automatically applied
6. Save as new scheme if desired
```

### **Example 3: Fix Accessibility Issues**

```
1. Create custom colors
2. Look for orange ⚠ warnings
3. Click the color that has low contrast
4. Adjust to darker/lighter shade
5. Watch for green ✓ to appear
6. Verify in live preview
```

---

## 🚀 Best Practices

### **Do's**

✅ **Test in live preview** before saving
✅ **Check contrast ratios** for all text
✅ **Save schemes** for different contexts
✅ **Export backups** regularly
✅ **Use consistent color palettes**
✅ **Name schemes descriptively**

### **Don'ts**

❌ **Don't ignore** accessibility warnings
❌ **Don't use** extreme colors without testing
❌ **Don't delete** default scheme
❌ **Don't forget** to save changes
❌ **Don't use** too many different colors

---

## 🎉 Summary

The Backgrounds & Colors Settings provides:

- 🎨 **25+ customizable colors**
- 👁️ **Real-time live preview**
- ♿ **Built-in accessibility checker**
- 💾 **Save/load color schemes**
- 📤 **Export/import functionality**
- 🖱️ **Interactive hover state previews**
- 📱 **Responsive design**
- 🎯 **WCAG 2.1 compliant validation**

**Perfect for personalizing your workout interface while maintaining professional appearance and accessibility!**

---

**Next:** Try it out in Settings → Backgrounds & Colors! 🚀

