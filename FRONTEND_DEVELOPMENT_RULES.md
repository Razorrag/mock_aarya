# Frontend Development Rules - Aarya Clothing E-commerce

## 🎯 **Core Architecture Principles**

### **1. Service-First Development**
- **ALWAYS** read and understand existing services in `/services/` before creating any UI
- Services available: `admin`, `commerce`, `core`, `payment`
- Each service has: `models/`, `core/`, `database/`, `middleware/`
- UI must align with backend API structure and data models

### **2. Silk Background Integration**
- **MANDATORY**: Use `SilkBackground` component as static canvas base
- All UI elements must float over the silk background
- Import: `import SilkBackground from '../components/SilkBackground.js'`
- Position: Fixed at `z-index: 0`, all content at `z-index: 10+`

### **3. Component Reusability Rules**
- **FIRST**: Search existing components in `/components/landing/` and `/components/common/`
- Reusable components available: `HeroSection`, `Collections`, `NewArrivals`, `AboutSection`, `EnhancedHeader`, `ProductCard`, `Button`
- **NEVER** create duplicate functionality
- Extend existing components with props instead of creating new ones

### **4. File Management Principles**
- **MAX 500 lines per file** - split larger components
- **NO new files until absolutely necessary**
- Prefer enhancing existing files over creating new ones
- Use descriptive component names with existing patterns

---

## 🎨 **Design System Compliance**

### **5. Color Palette (Fixed)**
```javascript
// Only use these exact colors from globals.css
--gold-primary: #F2C29A
--gold-dark: #C27A4E  
--rose-gold: #B76E79
--purple-accent: #7A2F57
--bg-deep: #050203
--text-light: #EAE0D5
```

### **6. Typography System**
```javascript
// Only these font families
'Cinzel, serif' // For headings, luxury feel
'Playfair Display, serif' // For body text, elegant
```

### **7. Glass Morphism Standards**
```javascript
// Use these exact classes for cards
className="glass-card glass-card-hover"
// Or manual implementation:
bg-[#0B0608]/40 backdrop-blur-md border border-[#B76E79]/15
```

---

## ✨ **Animation & Interactions**

### **8. GSAP Animation Pattern**
- **REQUIRED**: Import and register GSAP for scroll animations
```javascript
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
```

### **9. Standard Animation Timeline**
```javascript
// Use this pattern for consistency
useEffect(() => {
  // Entrance animations
  gsap.fromTo(element,
    { y: 60, opacity: 0, scale: 0.95 },
    { y: 0, opacity: 1, scale: 1, duration: 1, ease: "power3.out" }
  );
  
  // Cleanup
  return () => {
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  };
}, []);
```

---

## 🔗 **Backend Integration Rules**

### **10. Service Understanding Checklist**
Before creating any UI:
- [ ] Read relevant service models in `/services/{service}/models/`
- [ ] Check main.py for available endpoints
- [ ] Review database schemas
- [ ] Understand data flow and relationships

### **11. API Integration Pattern**
```javascript
// Use existing API patterns from lib/api.js
import { apiCall } from '@/lib/api';
// Follow existing error handling and response structure
```

---

## 📝 **Code Quality Standards**

### **12. Component Structure**
```javascript
// Follow this exact structure
'use client';

import React, { useRef, useEffect } from 'react';
// Other imports

/**
 * ComponentName - Brief description
 * 
 * Features:
 * - Key feature 1
 * - Key feature 2
 */
const ComponentName = ({ prop1, prop2 }) => {
  // Refs first
  const sectionRef = useRef(null);
  
  // Effects second
  useEffect(() => {
    // Animation logic
  }, []);
  
  // Return JSX
  return (
    <section ref={sectionRef} className="relative py-16 sm:py-20 md:py-24">
      {/* Content */}
    </section>
  );
};

export default ComponentName;
```

### **13. Responsive Design Rules**
- **Mobile-first**: `sm:`, `md:`, `lg:` breakpoints only
- **Container**: Always use `container mx-auto px-4 sm:px-6 md:px-8`
- **Spacing**: Use `py-16 sm:py-20 md:py-24` pattern for sections

### **14. Performance Guidelines**
- **Lazy load** images with Next.js `Image` component
- **Optimize animations** with proper cleanup
- **Throttle scroll events** for performance
- **Use React.memo** for expensive components

---

## 🚫 **Before Creating Any New Component**

### **15. Mandatory Checklist**
- [ ] Have I searched all existing components?
- [ ] Can I extend an existing component instead?
- [ ] Does this align with existing services?
- [ ] Am I using the silk background correctly?
- [ ] Is this under 500 lines?
- [ ] Am I following the color palette?
- [ ] Do I need this or is it dead UI?

### **16. Dead UI Prevention**
- **NO unused components** - every component must be used
- **NO demo/experimental code** in production
- **NO commented out large blocks** - remove unused code
- **NO duplicate functionality**

---

## 📁 **File Naming & Organization**

### **17. Naming Conventions**
- Components: `PascalCase.jsx` (e.g., `HeroSection.jsx`)
- Utilities: `camelCase.js` (e.g., `apiHelpers.js`)
- Keep components in logical directories

### **18. Import Organization**
```javascript
// 1. React imports
import React, { useRef, useEffect } from 'react';

// 2. Next.js imports  
import Image from 'next/image';
import Link from 'next/link';

// 3. Third-party libraries
import { gsap } from 'gsap';
import { ArrowRight } from 'lucide-react';

// 4. Local components
import { Button } from '../ui/button';
import ProductCard from '../common/ProductCard';
```

---

## 🧪 **Testing & Validation**

### **19. Before Finalizing**
- [ ] Component works on mobile, tablet, desktop
- [ ] Animations are smooth and performant
- [ ] No console errors
- [ ] Accessibility basics (alt tags, semantic HTML)
- [ ] Silk background renders correctly

### **20. Code Review Checklist**
- [ ] Under 500 lines
- [ ] Uses existing theme colors
- [ ] Follows component structure
- [ ] Proper cleanup in useEffect
- [ ] No unused imports or variables

---

## 🎯 **Quick Reference Examples**

### **Button Component Usage**
```javascript
<Button variant="luxury" size="sm" href="/collections">
  Shop Now
</Button>
```

### **Glass Card Pattern**
```javascript
<div className="glass-card glass-card-hover rounded-2xl p-6">
  {/* Content */}
</div>
```

### **Section Pattern**
```javascript
<section className="relative py-16 sm:py-20 md:py-24 overflow-hidden">
  {/* Background decorative elements */}
  <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#7A2F57]/5 rounded-full blur-[100px] pointer-events-none" />
  
  <div className="container mx-auto px-4 sm:px-6 md:px-8 relative z-10">
    {/* Content */}
  </div>
</section>
```

### **Typography Pattern**
```javascript
<h2 className="text-3xl sm:text-4xl md:text-5xl text-[#EAE0D5]" style={{ fontFamily: 'Cinzel, serif' }}>
  Heading
</h2>
<p className="text-[#EAE0D5]/70" style={{ fontFamily: 'Playfair Display, serif' }}>
  Body text
</p>
```

---

## ⚡ **Performance Tips**

### **Animation Best Practices**
- Use `ScrollTrigger.refresh()` after dynamic content
- Clean up animations in useEffect return
- Use `will-change` sparingly
- Prefer `transform` over `position` changes

### **Image Optimization**
```javascript
<Image
  src={imageSrc}
  alt={altText}
  fill
  className="object-cover"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

---

**Remember**: The goal is consistency, performance, and maintainability. When in doubt, look at existing components like `Collections.jsx` or `HeroSection.jsx` for patterns.

## 📋 **Pre-Development Workflow**

1. **Read Services First**: Check `/services/` for backend structure
2. **Search Components**: Look for existing reusable components
3. **Plan Architecture**: Decide if new file is really needed
4. **Follow Patterns**: Use existing code structure and styling
5. **Test Thoroughly**: Ensure responsive and performant

---

*This document ensures all frontend development follows consistent patterns and maintains code quality across the Aarya Clothing e-commerce platform.*
