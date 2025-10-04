# 🔄 Automatic Hebrew RTL Detection

## Overview

The app is now **LTR (Left-to-Right) by default**, with **automatic RTL for Hebrew text only**. This provides a better experience for mixed-language content and international users.

---

## 🎯 How It Works

### Default Behavior
- **App Layout**: Left-to-Right (LTR)
- **UI Elements**: Left-aligned
- **Navigation**: Left-to-right flow

### Hebrew Text Detection
When Hebrew characters are detected in text content:
- Font automatically switches to **Heebo**
- Text direction becomes **RTL**
- Alignment adjusts to **start** (right in RTL)

---

## 🔤 Automatic Detection Methods

### 1. **Using `dir="auto"`** (Recommended)
Browser automatically detects text direction:

```tsx
<p dir="auto">
  This is English text. זה טקסט בעברית.
</p>
// English: LTR, Hebrew: RTL
```

### 2. **Using `lang="he"` attribute**
Explicitly mark Hebrew content:

```tsx
<h1 lang="he">ברוכים הבאים</h1>
// Forces RTL + Heebo font
```

### 3. **Using Hebrew detection utility**
Programmatically detect and apply Hebrew styling:

```tsx
import { getHebrewProps } from '@/utils/hebrewDetection';

function MyComponent({ text }: { text: string }) {
  const hebrewProps = getHebrewProps(text);
  
  return <div {...hebrewProps}>{text}</div>;
}
```

---

## 🛠️ Utility Functions

### `containsHebrew(text: string)`
Check if text contains any Hebrew characters.

```typescript
import { containsHebrew } from '@/utils/hebrewDetection';

const hasHebrew = containsHebrew('Hello עולם'); // true
```

### `isPrimaryHebrewText(text: string)`
Check if text is primarily Hebrew (>50%).

```typescript
import { isPrimaryHebrewText } from '@/utils/hebrewDetection';

isPrimaryHebrewText('שלום world'); // true (60% Hebrew)
isPrimaryHebrewText('Hello עולם'); // false (30% Hebrew)
```

### `getTextDirection(text: string)`
Get appropriate direction for text.

```typescript
import { getTextDirection } from '@/utils/hebrewDetection';

getTextDirection('Hello');           // 'ltr'
getTextDirection('שלום');            // 'rtl'
getTextDirection('Hello שלום');      // 'auto'
```

### `getHebrewProps(text: string)`
Get complete props object for automatic styling.

```typescript
import { getHebrewProps } from '@/utils/hebrewDetection';

const props = getHebrewProps('שלום עולם');
// Returns: { dir: 'rtl', lang: 'he', className: 'hebrew-text' }

<div {...props}>שלום עולם</div>
```

### `useHebrewDetection(text: string)`
React hook for Hebrew detection.

```typescript
import { useHebrewDetection } from '@/utils/hebrewDetection';

function MyComponent({ text }: { text: string }) {
  const { isHebrew, isPrimaryHebrew, dir, props } = useHebrewDetection(text);
  
  return (
    <div {...props}>
      {text}
      {isHebrew && <span className="text-xs">(עברית)</span>}
    </div>
  );
}
```

---

## 💡 Usage Examples

### Mixed Language Button
```tsx
function ActionButton() {
  return (
    <button className="px-4 py-2">
      {/* English stays LTR */}
      <span>Click here</span>
      {/* Hebrew auto-detects RTL */}
      <span lang="he" className="mr-2">לחץ כאן</span>
    </button>
  );
}
```

### Dynamic Content Card
```tsx
function ContentCard({ title, description }: { title: string; description: string }) {
  const titleProps = getHebrewProps(title);
  const descProps = getHebrewProps(description);
  
  return (
    <div className="p-4 border rounded">
      <h3 {...titleProps}>{title}</h3>
      <p {...descProps} className="text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
```

### Form Input with Auto-Detection
```tsx
function SearchInput() {
  return (
    <input
      type="text"
      dir="auto"
      placeholder="Search... / חיפוש..."
      className="w-full px-3 py-2 border rounded"
    />
  );
}
```

### Chat Message (Auto-Direction)
```tsx
function ChatMessage({ message, sender }: { message: string; sender: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{sender}</span>
      <div
        dir="auto"
        className="p-3 rounded-lg bg-muted"
      >
        {message}
      </div>
    </div>
  );
}
```

---

## 🎨 CSS Classes

### `.hebrew-text`
Automatically applies Hebrew styling:
```css
.hebrew-text {
  font-family: 'Heebo', sans-serif;
  direction: rtl;
  text-align: start;
}
```

Usage:
```tsx
<p className="hebrew-text">זהו טקסט בעברית</p>
```

### `.text-auto`
Enables automatic text direction detection:
```css
.text-auto {
  direction: auto;
  unicode-bidi: plaintext;
}
```

Usage:
```tsx
<p className="text-auto">Mixed content: English and עברית</p>
```

---

## 📝 Input Fields

### Auto-Detecting Input
```tsx
<input
  type="text"
  dir="auto"
  placeholder="Type in any language..."
/>
```

### Hebrew-Specific Input
```tsx
<input
  type="text"
  lang="he"
  dir="rtl"
  placeholder="הקלד טקסט בעברית"
/>
```

### Textarea with Detection
```tsx
<textarea
  dir="auto"
  rows={4}
  placeholder="Write your message in any language..."
  className="w-full"
/>
```

---

## 🔄 Manual Direction Toggle (Optional)

The RTL context still provides manual control when needed:

```tsx
import { useRTL } from '@/contexts/RTLContext';

function LanguageToggle() {
  const { direction, toggleDirection } = useRTL();
  
  return (
    <button onClick={toggleDirection}>
      {direction === 'rtl' ? 'Switch to LTR' : 'Switch to RTL'}
    </button>
  );
}
```

---

## ✅ Best Practices

### DO:
```tsx
// ✅ Use dir="auto" for mixed content
<p dir="auto">{userMessage}</p>

// ✅ Use lang="he" for known Hebrew content
<h1 lang="he">כותרת ראשית</h1>

// ✅ Use getHebrewProps for dynamic content
const props = getHebrewProps(dynamicText);
<div {...props}>{dynamicText}</div>

// ✅ Let inputs auto-detect
<input dir="auto" />
```

### DON'T:
```tsx
// ❌ Don't force RTL on all content
<div dir="rtl">English content</div>

// ❌ Don't manually detect Hebrew with regex everywhere
if (text.match(/[\u0590-\u05FF]/)) { ... }
// Use: containsHebrew(text) instead

// ❌ Don't hardcode direction
<p dir="rtl">Could be English or Hebrew</p>
// Use: dir="auto" instead
```

---

## 🎯 Summary

| Feature | Implementation |
|---------|----------------|
| **Default Direction** | LTR (Left-to-Right) |
| **Hebrew Detection** | Automatic via `dir="auto"` or `lang="he"` |
| **Font Switching** | Inter (LTR) → Heebo (Hebrew) |
| **Direction Switching** | Per-element, not global |
| **Mixed Content** | Supported with `dir="auto"` |
| **Manual Control** | Available via RTL context |

---

## 🚀 Migration from Previous RTL System

If you have code from the previous RTL-by-default system:

### Before (Global RTL)
```tsx
// Old: Everything was RTL by default
<div>
  <p>English text</p>
  <p>טקסט בעברית</p>
</div>
```

### After (Auto-Detection)
```tsx
// New: Automatic per-element detection
<div>
  <p dir="auto">English text</p>
  <p dir="auto">טקסט בעברית</p>
</div>
```

Or use the utility:
```tsx
import { getHebrewProps } from '@/utils/hebrewDetection';

<div>
  <p {...getHebrewProps('English text')}>English text</p>
  <p {...getHebrewProps('טקסט בעברית')}>טקסט בעברית</p>
</div>
```

---

## 📖 Resources

- [CSS Text Module Level 3 - Direction](https://www.w3.org/TR/css-text-3/#direction)
- [HTML `dir` Attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/dir)
- [Unicode Bidirectional Algorithm](https://unicode.org/reports/tr9/)
- [Heebo Font](https://fonts.google.com/specimen/Heebo)

---

The system now intelligently handles Hebrew text with automatic detection while keeping the overall app LTR-first for better international compatibility! 🌍
