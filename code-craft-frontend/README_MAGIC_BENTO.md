# Magic Bento Animation System

A comprehensive animation system implementing Magic Bento-style animations across all components in the Code-Craft project.

## 🎨 Features Implemented

### ✅ Core Animation Components
- **MagicBentoCard**: Enhanced cards with smooth fade-in, scale transforms, and glow effects
- **MagicBentoGrid**: Responsive grid layouts with staggered animations
- **MagicBentoButton**: Interactive buttons with spring-based hover effects
- **MagicBentoContainer**: Wrapper for fade-in and slide animations

### ✅ Animation Characteristics
- **Smooth fade-in animations** with staggered delays for grid items
- **Gentle scale transforms** on hover (1.02-1.05x scale)
- **Box shadow elevation effects** during interactions
- **Spring-based easing** for natural movement
- **Consistent animation duration** (200-300ms for micro-interactions)
- **Grid layout** with responsive breakpoints
- **Card-based component structure** with rounded corners and subtle borders

### ✅ Enhanced Components

#### Cards (`src/components/ui/card.tsx`)
- Added `magic`, `glow`, and `delay` props
- Framer Motion integration for smooth animations
- Spring physics for natural movement
- Accessibility support with reduced motion detection

#### Buttons (`src/components/ui/button.tsx`)
- Enhanced with `magic` and `glow` props
- Hover and tap animations with spring physics
- Loading state animations
- Accessibility compliance

#### Pages Enhanced
- **Home Page** (`src/app/page.tsx`): Magic Bento grids and animated CTAs
- **Snippets Page** (`src/app/snippets/page.tsx`): Staggered grid animations
- **Snippet Cards** (`src/components/snippet/SnippetCard.tsx`): Enhanced hover effects

## 🎯 Animation Configuration

```typescript
const MAGIC_BENTO_CONFIG = {
  duration: {
    micro: 200,    // Quick interactions
    short: 300,    // Standard animations
    medium: 500,   // Complex transitions
    long: 800,     // Dramatic effects
  },
  scale: {
    hover: 1.02,   // Subtle hover lift
    active: 0.98,  // Press feedback
    focus: 1.05,   // Focus indication
  },
  spring: {
    gentle: { stiffness: 300, damping: 30 },
    bouncy: { stiffness: 400, damping: 25 },
    smooth: { stiffness: 200, damping: 40 },
  },
  stagger: {
    fast: 0.05,    // Quick succession
    normal: 0.1,   // Standard timing
    slow: 0.15,    // Dramatic reveal
  },
};
```

## 🎨 CSS Enhancements

### New CSS Classes Added
```css
.magic-card              /* Enhanced card with animations */
.magic-card-glow         /* Cards with glow effects */
.magic-button            /* Interactive button animations */
.magic-glow-animation    /* Pulsing glow effect */
.magic-float-animation   /* Floating motion */
.magic-pulse-animation   /* Scaling pulse effect */
.stagger-container       /* Container for staggered children */
```

### Responsive Grid Layouts
```css
.magic-bento-grid-auto   /* Auto-fit grid layout */
.magic-bento-masonry     /* Masonry-style layout */
```

## 🚀 Usage Examples

### Basic Magic Card
```tsx
<Card magic hover glow delay={0.1}>
  <CardHeader>
    <CardTitle>Animated Card</CardTitle>
    <CardDescription>With smooth animations</CardDescription>
  </CardHeader>
</Card>
```

### Magic Button
```tsx
<Button magic glow size="lg">
  <Star className="h-4 w-4 mr-2" />
  Animated Button
</Button>
```

### Staggered Grid
```tsx
<MagicBentoGrid 
  columns={{ mobile: 1, tablet: 2, desktop: 3 }} 
  stagger="normal"
>
  {items.map((item, index) => (
    <Card key={item.id} magic hover glow delay={index * 0.1}>
      {/* Card content */}
    </Card>
  ))}
</MagicBentoGrid>
```

### Container Animations
```tsx
<MagicBentoContainer fadeIn slideDirection="up">
  <h1>Animated Content</h1>
  <p>Slides up with fade-in effect</p>
</MagicBentoContainer>
```

## ♿ Accessibility Features

### Reduced Motion Support
- Automatically detects `prefers-reduced-motion` setting
- Disables animations for users who prefer reduced motion
- Maintains functionality while removing motion effects

### Implementation
```typescript
const prefersReducedMotion = useReducedMotion();

// Animations are automatically disabled when user prefers reduced motion
const animationProps = prefersReducedMotion 
  ? { duration: 0.01 } 
  : { duration: 0.3, type: "spring" };
```

## 📱 Responsive Design

### Breakpoint System
- **Mobile**: 320px+ (1 column grids)
- **Tablet**: 768px+ (2 column grids)
- **Desktop**: 1280px+ (3+ column grids)

### Grid Configurations
```typescript
columns={{ 
  mobile: 1,    // Single column on mobile
  tablet: 2,    // Two columns on tablet
  desktop: 3    // Three columns on desktop
}}
```

## 🎭 Demo Page

A comprehensive demo page has been created at `/magic-bento-demo` showcasing:
- All animation types and configurations
- Interactive examples
- Performance demonstrations
- Accessibility features
- Configuration options

## 🔧 Technical Implementation

### Dependencies Added
- Enhanced Framer Motion integration
- Custom CSS animations
- Spring physics calculations
- Intersection Observer for scroll-triggered animations

### Performance Optimizations
- Lazy loading of animation components
- Efficient re-renders with React.memo
- GPU-accelerated transforms
- Minimal layout thrashing

## 🎨 Design Principles

1. **Subtle and Purposeful**: Animations enhance UX without being distracting
2. **Consistent Timing**: Standardized durations across all components
3. **Natural Movement**: Spring physics for organic feel
4. **Responsive**: Adapts to all screen sizes and devices
5. **Accessible**: Respects user preferences and accessibility needs

## 🚀 Next Steps

The Magic Bento animation system is now fully integrated across:
- ✅ Card components with hover effects and glow
- ✅ Button interactions with spring physics
- ✅ Grid layouts with staggered animations
- ✅ Page transitions and containers
- ✅ Responsive design across all breakpoints
- ✅ Accessibility compliance with reduced motion support

All components now feature smooth, delightful animations that enhance the user experience while maintaining excellent performance and accessibility standards.