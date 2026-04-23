# 🎨 GLASSMORPHISM DESIGN SYSTEM
## Sekolah Literasi Indonesia - Brand Guidelines

---

## 🎨 COLOR PALETTE

### Brand Colors (From Logo)

```css
/* Primary Colors */
--brand-navy:  #2a3e63;  /* Dark navy blue - Headers, dark elements */
--brand-blue:  #2e66a3;  /* Medium blue - Secondary elements */
--brand-cyan:  #39a0c9;  /* Medium cyan - Primary CTA, links */
--brand-light: #7dcbe1;  /* Light cyan - Accents, highlights */

/* Usage in Tailwind */
bg-brand-navy
bg-brand-blue  
bg-brand-cyan
bg-brand-light
```

### Glassmorphism Colors

```css
/* Glass Backgrounds */
--glass-light:  rgba(255, 255, 255, 0.10);  /* Light glass */
--glass-medium: rgba(255, 255, 255, 0.15);  /* Medium glass */
--glass-strong: rgba(255, 255, 255, 0.20);  /* Strong glass */
--glass-dark:   rgba(0, 0, 0, 0.20);        /* Dark glass */

/* Borders */
--glass-border:       rgba(255, 255, 255, 0.20);
--glass-border-hover: rgba(255, 255, 255, 0.30);
--glass-border-active: rgba(255, 255, 255, 0.50);
```

---

## 🌟 GLASSMORPHISM COMPONENTS

### Basic Glass Card

```jsx
<div className="backdrop-blur-2xl bg-white/10 rounded-2xl border border-white/20 p-6 shadow-xl">
  <!-- Content -->
</div>
```

**Properties:**
- `backdrop-blur-2xl`: 24px blur for frosted glass effect
- `bg-white/10`: 10% white background
- `border-white/20`: 20% white border
- `shadow-xl`: Soft shadow for depth

---

### Glass Card with Hover

```jsx
<div className="group backdrop-blur-2xl bg-white/10 rounded-2xl border border-white/20 p-6 shadow-xl hover:bg-white/15 hover:border-white/30 hover:shadow-2xl transition-all duration-300">
  <!-- Content -->
</div>
```

**Hover Effects:**
- Background opacity increases (10% → 15%)
- Border opacity increases (20% → 30%)
- Shadow intensifies
- Smooth 300ms transition

---

### Glass Card with Glow

```jsx
<div className="relative group">
  {/* Glow Effect */}
  <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-cyan to-brand-light rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
  
  {/* Card */}
  <div className="relative backdrop-blur-2xl bg-white/10 rounded-2xl border border-white/20 p-6">
    <!-- Content -->
  </div>
</div>
```

**Glow Properties:**
- Gradient glow using brand colors
- Blur effect for soft edges
- Opacity increases on hover
- Positioned behind card with z-index

---

## 🎯 BUTTON STYLES

### Primary Button (Glassmorphism)

```jsx
<button className="backdrop-blur-xl bg-gradient-to-r from-brand-cyan to-brand-light text-white font-bold py-4 px-8 rounded-2xl border-2 border-white/30 shadow-lg hover:shadow-2xl hover:shadow-cyan-500/50 hover:scale-[1.02] transition-all duration-300">
  Submit
</button>
```

---

### Secondary Button

```jsx
<button className="backdrop-blur-xl bg-white/10 text-white font-bold py-4 px-8 rounded-2xl border-2 border-white/30 hover:bg-white/20 hover:border-white/50 hover:scale-[1.02] transition-all duration-300">
  Cancel
</button>
```

---

### Disabled Button

```jsx
<button className="backdrop-blur-xl bg-white/5 text-white/30 font-bold py-4 px-8 rounded-2xl border-2 border-white/10 cursor-not-allowed">
  Disabled
</button>
```

---

## 📊 BACKGROUNDS

### Animated Gradient Background

```jsx
<div className="min-h-screen relative overflow-hidden">
  {/* Base Gradient */}
  <div className="absolute inset-0 bg-gradient-to-br from-brand-navy via-brand-blue to-brand-cyan">
    
    {/* Animated Orbs */}
    <div className="absolute top-20 left-20 w-96 h-96 bg-brand-light rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
    <div className="absolute top-40 right-20 w-96 h-96 bg-brand-cyan rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
    <div className="absolute -bottom-20 left-40 w-96 h-96 bg-brand-blue rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
  </div>
  
  {/* Content with relative z-index */}
  <div className="relative z-10">
    <!-- Your content -->
  </div>
</div>
```

**Animation CSS:**
```css
@keyframes blob {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(20px, -50px) scale(1.1); }
  50% { transform: translate(-20px, 20px) scale(0.9); }
  75% { transform: translate(50px, 50px) scale(1.05); }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}
```

---

## 📝 FORM ELEMENTS

### Glass Input Field

```jsx
<input
  type="text"
  className="w-full backdrop-blur-xl bg-white/10 border-2 border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:bg-white/15 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 transition-all duration-300"
  placeholder="Enter text..."
/>
```

---

### Glass Radio Button

```jsx
<label className="backdrop-blur-xl bg-white/5 border-2 border-white/20 rounded-2xl p-5 cursor-pointer hover:bg-white/10 hover:border-white/30 transition-all duration-300">
  <div className="flex items-center">
    {/* Radio Circle */}
    <div className="w-7 h-7 rounded-full border-2 border-white/40 bg-white/20 flex items-center justify-center">
      <!-- Checked state: inner dot -->
    </div>
    
    {/* Label */}
    <span className="ml-4 text-white">Option Label</span>
  </div>
</label>
```

---

## 📊 DASHBOARD ELEMENTS

### Stat Card

```jsx
<div className="group relative">
  {/* Glow */}
  <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-cyan to-brand-light rounded-2xl blur opacity-30 group-hover:opacity-50 transition"></div>
  
  {/* Card */}
  <div className="relative backdrop-blur-2xl bg-white/10 rounded-2xl border border-white/20 p-6">
    <p className="text-sm text-white/70 mb-2 uppercase tracking-wide">Title</p>
    <h3 className="text-4xl font-bold text-white">Value</h3>
    <p className="text-sm text-white/60 mt-2">Subtitle</p>
  </div>
</div>
```

---

### Progress Bar

```jsx
<div className="backdrop-blur-xl bg-white/10 rounded-2xl p-4 border border-white/20">
  <div className="flex justify-between mb-2">
    <span className="text-white/90 text-sm">Progress</span>
    <span className="text-brand-light font-bold">75%</span>
  </div>
  
  <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
    <div 
      className="h-3 bg-gradient-to-r from-brand-cyan to-brand-light rounded-full shadow-lg transition-all duration-500"
      style={{ width: '75%' }}
    />
  </div>
</div>
```

---

## 🎭 TYPOGRAPHY

### Heading with Gradient

```jsx
<h1 className="text-5xl font-bold bg-gradient-to-r from-white via-brand-light to-brand-cyan bg-clip-text text-transparent">
  Dashboard Ekosistem Literasi
</h1>
```

### Body Text

```jsx
<p className="text-white/90 text-lg leading-relaxed">
  Regular paragraph text with 90% white opacity
</p>

<p className="text-white/70 text-base">
  Secondary text with 70% white opacity
</p>

<p className="text-white/50 text-sm">
  Tertiary text with 50% white opacity
</p>
```

---

## 🌈 GRADIENTS

### Brand Gradients (Tailwind Config)

```javascript
// In tailwind.config.js
backgroundImage: {
  'gradient-brand': 'linear-gradient(135deg, #2a3e63 0%, #2e66a3 50%, #39a0c9 100%)',
  'gradient-cyan': 'linear-gradient(135deg, #39a0c9 0%, #7dcbe1 100%)',
  'gradient-blue': 'linear-gradient(135deg, #2e66a3 0%, #39a0c9 100%)',
}
```

### Usage

```jsx
<div className="bg-gradient-brand">
<div className="bg-gradient-cyan">
<div className="bg-gradient-blue">
```

---

## ✨ SHADOWS & GLOWS

### Shadow Utilities

```css
.shadow-glass     /* Soft glass shadow */
.shadow-glass-lg  /* Large glass shadow */
.shadow-glow-cyan /* Cyan glow effect */
.shadow-glow-blue /* Blue glow effect */
```

### Usage

```jsx
<div className="shadow-glass hover:shadow-glass-lg">
<button className="shadow-lg hover:shadow-glow-cyan">
```

---

## 📱 RESPONSIVE BREAKPOINTS

Follow Tailwind default breakpoints:

```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large desktop */
```

### Mobile-First Approach

```jsx
<div className="
  grid 
  grid-cols-1      /* Mobile: 1 column */
  md:grid-cols-2   /* Tablet: 2 columns */
  lg:grid-cols-4   /* Desktop: 4 columns */
  gap-4
">
```

---

## 🎯 ACCESSIBILITY

### Focus States

Always include focus states for keyboard navigation:

```jsx
<button className="
  focus:outline-none 
  focus:ring-2 
  focus:ring-brand-cyan 
  focus:ring-offset-2 
  focus:ring-offset-brand-navy
">
```

### Text Contrast

Ensure sufficient contrast against glassmorphism backgrounds:
- Primary text: `text-white` (white)
- Secondary text: `text-white/90` (90% white)
- Tertiary text: `text-white/70` (70% white)
- Disabled text: `text-white/30` (30% white)

---

## 💡 BEST PRACTICES

### DO ✅

- Use consistent blur values (backdrop-blur-xl or backdrop-blur-2xl)
- Layer glassmorphism elements with proper z-index
- Add smooth transitions (duration-300)
- Use brand colors for gradients and glows
- Maintain 10-20% white opacity for backgrounds
- Add hover states for interactive elements

### DON'T ❌

- Don't stack too many glass layers (max 2-3)
- Don't use too strong blur (max blur-2xl)
- Don't forget borders (glass needs borders to define edges)
- Don't use pure white backgrounds on glass
- Don't forget mobile responsiveness
- Don't overuse glow effects (use sparingly)

---

## 🚀 QUICK REFERENCE

### Glass Card Template

```jsx
<div className="backdrop-blur-2xl bg-white/10 rounded-2xl border border-white/20 p-6 shadow-xl hover:bg-white/15 transition-all duration-300">
```

### Glass Button Template

```jsx
<button className="backdrop-blur-xl bg-gradient-to-r from-brand-cyan to-brand-light text-white font-bold py-4 px-8 rounded-2xl border-2 border-white/30 shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
```

### Glass Input Template

```jsx
<input className="backdrop-blur-xl bg-white/10 border-2 border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:bg-white/15 focus:border-white/40 focus:outline-none transition-all duration-300" />
```

---

## 🎨 BRAND CONSISTENCY

### Logo Usage

- Primary logo: Use on light/glassmorphism backgrounds
- Color: Maintain original gradient (navy → cyan → light)
- Clear space: Minimum 20px around logo
- Minimum size: 120px width for web

### Typography

- Headings: Bold, 700 weight
- Body: Regular, 400 weight
- UI elements: Medium, 500-600 weight

---

**Design System Version:** 1.0  
**Last Updated:** 2024  
**Brand:** Sekolah Literasi Indonesia
