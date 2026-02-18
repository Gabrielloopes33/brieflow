# UI/UX Motion Design & Fluid Interfaces - Skill Guide

## Overview
This skill covers the principles, techniques, and implementation patterns for creating fluid, responsive interfaces with smooth animations, haptic feedback, and delightful micro-interactions. Use this guide to build app experiences that feel polished, natural, and engaging.

---

## 1. Foundation: Visual Design Principles

### Layout & Hierarchy
- **Grid systems**: Use consistent spacing (8px/4px grid), align elements to create visual order
- **Hierarchy**: Size, weight, color, and spacing to guide user attention
- **White space**: Breathing room makes interfaces feel premium and focused
- **Consistency**: Reuse patterns, spacing, and components across the interface

### Typography
- Limit to 2-3 font families maximum
- Create a type scale (e.g., 12, 14, 16, 20, 24, 32, 48px)
- Ensure readability: line height 1.4-1.6, adequate contrast (WCAG AA minimum)
- Consider platform conventions (San Francisco on iOS, Roboto on Android)

### Color & Visual Style
- Color theory: complementary, analogous, triadic schemes
- Contrast ratios for accessibility (4.5:1 text, 3:1 UI elements)
- Design tokens: define primary, secondary, accent, surface, error, success
- State colors: default, hover, active, disabled, focus
- Consider dark mode from the start

### Design Systems
- Study Material Design (Google) and Human Interface Guidelines (Apple)
- Understand component anatomy: buttons, cards, inputs, navigation, dialogs
- Learn platform patterns: tab bars, navigation drawers, modal sheets
- Tools: Figma, Sketch, or Adobe XD for prototyping

---

## 2. Motion Design Principles

### Why Animate
- **Guide attention**: Direct user focus to important changes
- **Provide feedback**: Confirm actions were received and processed
- **Create continuity**: Connect states and maintain spatial relationships
- **Express personality**: Differentiate your product's feel
- **Never animate just for decoration**

### Core Motion Principles (Fluid Interfaces)
Based on Apple's WWDC 2018 "Designing Fluid Interfaces":

1. **Responsive**: Interface responds instantly to touch, not after gesture ends
2. **Interruptible**: Animations can be interrupted and redirected mid-flight
3. **Redirectable**: Can seamlessly change targets without stopping
4. **Continuous**: Gestures drive animations continuously, not discretely
5. **Contextual**: Maintain spatial relationships and context through transitions
6. **Playful with boundaries**: Soft limits with bounce/resistance, not hard stops

### Timing & Easing
- **Duration**: 100-300ms for most UI animations (200ms is often ideal)
- **Easing curves**:
  - `ease-out`: Fast start, slow end (most common for entrances)
  - `ease-in`: Slow start, fast end (exits)
  - `ease-in-out`: Smooth both ends (moves between states)
  - `spring`: Overshoot with natural physics (premium feel)
- **Choreography**: Stagger related elements by 20-80ms for flow

### Common Micro-interactions
- **Button press**: Scale down (0.95-0.97), increase shadow, add haptic
- **Card hover**: Subtle lift (elevation/shadow increase), slight scale (1.02)
- **Toggle/switch**: Slide + color transition + haptic confirmation
- **Loading states**: Skeleton screens, progress indicators, shimmer effects
- **Success/error**: Icon animation + color change + haptic + (optional) confetti/shake
- **Pull to refresh**: Follow finger, show indicator, spring back
- **Swipe actions**: Reveal options progressively, haptic at thresholds

### Performance Rules
- **60fps minimum**: Budget 16.67ms per frame
- **Animate only transform and opacity** when possible (GPU accelerated)
- **Avoid**: animating width, height, top, left (triggers layout)
- Use `will-change` (CSS) or layer hints sparingly
- Test on mid-range devices, not just flagship

---

## 3. Haptic Feedback

### When to Use Haptics
- ✅ Confirm important actions (send message, complete task)
- ✅ Reach boundaries or limits (scroll end, max value)
- ✅ Success/error feedback (amplify visual cues)
- ✅ Selection in pickers or toggles
- ❌ Don't overuse: not every tap needs haptics
- ❌ Don't use for purely informational changes

### Types of Haptic Feedback
- **Light impact**: Subtle selections, minor interactions
- **Medium impact**: Confirmations, toggles
- **Heavy impact**: Significant actions, errors
- **Success/warning/error**: Semantic feedback (iOS UINotificationFeedbackGenerator)
- **Custom patterns**: Vibration patterns for unique moments

### Platform Implementation

**iOS (UIKit/SwiftUI)**
```swift
// Impact feedback
let impact = UIImpactFeedbackGenerator(style: .medium)
impact.impactOccurred()

// Notification feedback
let notification = UINotificationFeedbackGenerator()
notification.notificationOccurred(.success)

// Selection feedback
let selection = UISelectionFeedbackGenerator()
selection.selectionChanged()
```

**Android (Kotlin)**
```kotlin
view.performHapticFeedback(HapticFeedbackConstants.CONTEXT_CLICK)
// Or custom pattern with VibrationEffect
```

**Flutter**
```dart
import 'package:flutter/services.dart';
HapticFeedback.lightImpact();
HapticFeedback.mediumImpact();
HapticFeedback.heavyImpact();
HapticFeedback.selectionClick();
```

**React Native**
```javascript
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
ReactNativeHapticFeedback.trigger("impactLight");
```

**Web (limited support)**
```javascript
// Vibration API (mobile browsers only)
navigator.vibrate(200); // 200ms
navigator.vibrate([100, 50, 100]); // pattern
```

---

## 4. Technical Implementation by Platform

### Web (React + Modern Stack)

**Core Libraries**
- **Framer Motion**: Declarative animations, variants, gestures (most popular for React)
- **GSAP**: Powerful timeline-based animations, scroll triggers
- **React Spring**: Physics-based animations
- **Motion One**: Lightweight, performant, framework-agnostic
- **Lottie**: Vector animations from After Effects

**Framer Motion Example Pattern**
```jsx
import { motion } from 'framer-motion';

const variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' }
  }
};

<motion.div
  variants={variants}
  initial="hidden"
  animate="visible"
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
>
  Content
</motion.div>
```

**CSS Best Practices**
```css
/* GPU acceleration hint */
.animated-element {
  will-change: transform, opacity;
  transform: translateZ(0); /* Force GPU layer */
}

/* Smooth transitions */
.button {
  transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
}

.button:active {
  transform: scale(0.96);
}
```

**Page Transitions (Next.js + Framer Motion)**
```jsx
// _app.js or layout component
<AnimatePresence mode="wait">
  <motion.div
    key={router.pathname}
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
</AnimatePresence>
```

### iOS (SwiftUI)

**Built-in Animations**
```swift
// Implicit animation
Button("Tap") { toggled.toggle() }
  .scaleEffect(toggled ? 1.2 : 1.0)
  .animation(.spring(response: 0.3, dampingFraction: 0.7), value: toggled)

// Explicit animation
withAnimation(.easeOut(duration: 0.3)) {
  showDetail = true
}

// Hero transition
.matchedGeometryEffect(id: "hero", in: namespace)
```

**Gestures**
```swift
.gesture(
  DragGesture()
    .onChanged { value in
      offset = value.translation
    }
    .onEnded { value in
      withAnimation(.spring()) {
        offset = .zero
      }
    }
)
```

### Android (Jetpack Compose)

**Animations**
```kotlin
// Animated state
val scale by animateFloatAsState(
  targetValue = if (pressed) 0.96f else 1f,
  animationSpec = spring(dampingRatio = Spring.DampingRatioMediumBouncy)
)

// Animated visibility
AnimatedVisibility(
  visible = visible,
  enter = fadeIn() + slideInVertically(),
  exit = fadeOut() + slideOutVertically()
) { Content() }
```

### Flutter

**Animation Controllers**
```dart
// Implicit animation
AnimatedContainer(
  duration: Duration(milliseconds: 300),
  curve: Curves.easeOut,
  transform: Matrix4.identity()..scale(isPressed ? 0.96 : 1.0),
  child: child,
)

// Hero animation
Hero(
  tag: 'hero-tag',
  child: Image.network(url),
)

// Custom animation
class _MyState extends State with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: Duration(milliseconds: 300),
      vsync: this,
    );
  }
}
```

### React Native

**Core Libraries**
- **React Native Reanimated 2/3**: Performant animations running on UI thread
- **React Native Gesture Handler**: Native gesture recognition
- **Moti**: Framer Motion-like API for RN
- **Lottie React Native**: Vector animations

**Reanimated Example**
```javascript
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

const scale = useSharedValue(1);

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }]
}));

<Animated.View style={animatedStyle}>
  <Pressable onPressIn={() => scale.value = withSpring(0.96)}>
    Content
  </Pressable>
</Animated.View>
```

---

## 5. Advanced Patterns & Techniques

### Gesture-Driven Animations
- Track touch position continuously during drag
- Apply physics: velocity, momentum, spring-back
- Support interruption: user can grab mid-animation
- Example: Instagram story swipe-down to dismiss

### Parallax & Depth
- Move layers at different speeds based on scroll or device motion
- Subtle (10-20px difference) for premium feel
- Hero elements move slower than background

### Morphing & Shared Element Transitions
- Animate one element transforming into another
- Maintain visual continuity between screens
- Use Hero widgets (Flutter), shared element transitions (Android), matchedGeometryEffect (SwiftUI)

### Loading & Skeleton States
- Show content structure immediately (skeleton screens)
- Shimmer effect for loading placeholder
- Progressive loading: text → images → interactions
- Optimistic UI: show success immediately, revert if fails

### Scroll-Linked Animations
- Header shrink/expand on scroll
- Parallax backgrounds
- Sticky elements with transition
- Trigger animations when elements enter viewport

### Physics & Springs
- More natural than linear/easing curves
- Parameters: stiffness (speed), damping (bounciness), mass
- Use for elastic effects, overshoot, momentum

---

## 6. Practical Learning Path

### Phase 1: Foundation (1-2 weeks)
1. Read Material Design Motion section + HIG Animation guidelines
2. Analyze 3 apps you love: screenshot flows, note timing, identify patterns
3. Recreate 2-3 screens in Figma with components and basic states
4. Study color theory + typography basics

### Phase 2: Motion Fundamentals (2-3 weeks)
1. Watch "Designing Fluid Interfaces" (WWDC 2018)
2. Clone "fluid-interfaces" repo (GitHub: nathangitter/fluid-interfaces)
3. Implement 5 micro-interactions:
   - Button press (scale + shadow)
   - Card hover/tap
   - Toggle switch
   - Pull to refresh
   - Modal slide up/down with drag dismiss
4. Practice timing: test 100ms, 200ms, 300ms, 500ms durations to feel differences

### Phase 3: Platform Implementation (3-4 weeks)

**For Web (React)**
1. Install Framer Motion + create basic layout
2. Implement page transitions
3. Add gesture-driven drawer/sheet
4. Create staggered list animations
5. Build: animated form with validation states

**For Mobile (Flutter/RN/Native)**
1. Set up haptics in 3 contexts (button, toggle, error)
2. Implement swipeable card deck
3. Hero transition between screens
4. Custom spring animations (bouncy button, elastic scroll)
5. Build: onboarding flow with smooth transitions + haptics

### Phase 4: Polish & Performance (Ongoing)
1. Profile animations on mid-range device
2. Reduce animation count if dropping frames
3. Test with reduce motion accessibility setting
4. Get feedback: ask others if animations feel natural or distracting
5. Study new apps monthly: note interesting patterns

---

## 7. Resources & References

### Design Systems
- [Material Design - Motion](https://m3.material.io/styles/motion/overview)
- [Apple HIG - Motion](https://developer.apple.com/design/human-interface-guidelines/motion)
- [Fluent Design - Motion](https://www.microsoft.com/design/fluent/)

### Learning
- **WWDC 2018: Designing Fluid Interfaces** (Apple Developer)
- **UX in Motion** manifesto and courses
- **Refactoring UI** (book/course on visual design fundamentals)
- **Laws of UX** (Jon Yablonski) - psychological principles

### Inspiration
- Dribbble, Mobbin (mobile UI patterns)
- Awwwards (web animations)
- UI Movement (micro-interactions)
- CodePen (web animation experiments)

### Tools
- Figma: prototyping, design systems
- Principle, ProtoPie: high-fidelity interactive prototypes
- Lottie: After Effects → code animations
- Rive: interactive vector animations

---

## 8. Quick Reference: Common Patterns

### Button States
```
Default → Hover (scale 1.02, shadow ↑) → 
Press (scale 0.96, shadow ↓, haptic medium) → 
Release (spring back to default or navigate)
```

### Modal/Sheet
```
Trigger → Slide up (300ms ease-out) + backdrop fade in →
User drags down → Follow finger continuously →
Threshold (50% drag) → haptic light →
Release → Spring dismiss if > threshold, else spring back
```

### List Item Delete
```
Swipe left → Reveal red background gradually →
Delete icon appears at 50% swipe → haptic light →
Full swipe (100%) → haptic heavy + remove with fade + collapse height
```

### Toggle Switch
```
Off → Tap → Thumb slides to right (200ms spring) + 
background color transition + haptic selection → On
```

### Form Validation
```
Submit → Loading (button disabled, spinner) →
Success: ✓ icon + green flash + haptic success + navigate (400ms total) OR
Error: ✗ icon + red shake + haptic error + show message
```

---

## 9. Dos and Don'ts

### ✅ Do
- Keep animations subtle and purposeful
- Respect user preferences (reduce motion setting)
- Test on various devices and connection speeds
- Use animation to guide, not distract
- Combine visual + haptic + (optional) sound for important moments
- Make interfaces responsive to touch immediately
- Allow gesture interruption and redirection

### ❌ Don't
- Animate everything—choose what matters
- Use long durations (> 500ms) for UI transitions
- Animate layout properties when transform/opacity work
- Add haptics to every tap
- Assume fast devices—test on mid-range
- Block user interaction during animations
- Ignore accessibility considerations
- Sacrifice usability for "cool" effects

---

## 10. AI Prompting Tips for Implementation

When working with AI assistants on fluid UI:

**Good prompts:**
- "Create a React button with Framer Motion that scales to 0.96 on press with a 200ms spring animation"
- "Implement a swipeable card in Flutter with continuous drag tracking and spring-back physics"
- "Add haptic feedback to this iOS SwiftUI toggle with medium impact on state change"

**Include:**
- Target platform/framework
- Specific animation library if you have preference
- Timing and easing requirements
- Whether gesture should be continuous or discrete
- Haptic feedback moments

**Avoid:**
- "Make it feel smooth" (too vague)
- Asking for animations without specifying performance constraints

---

## Usage Instructions

Use this skill as a reference when:
1. **Designing**: Review principles before creating prototypes
2. **Implementing**: Reference platform patterns and code examples
3. **Debugging**: Check if timing, easing, or haptics follow best practices
4. **Learning**: Follow the learning path for structured skill building
5. **Code review**: Verify animations meet performance and UX standards

Update this skill as you discover new patterns, libraries, or techniques in your projects.
