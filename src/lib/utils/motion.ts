// ============================================================================
// FLOW — Motion Design System
// Apple-grade spring configs. Softer damping = fluid, organic feel.
// Rule: high damping prevents bounce, moderate stiffness = responsive.
// ============================================================================

// Default — responsive but silk-smooth (higher damping kills robotic bounce)
export const SPRING = { type: "spring" as const, stiffness: 260, damping: 32, mass: 1 };

// Snappy — quick interactions (buttons, toggles) but still smooth
export const SPRING_SNAPPY = { type: "spring" as const, stiffness: 380, damping: 34, mass: 0.8 };

// Gentle — panels, modals, large surface transitions
export const SPRING_GENTLE = { type: "spring" as const, stiffness: 170, damping: 26, mass: 1.2 };

// Bouncy — playful emphasis (launch animations, celebrations)
export const SPRING_BOUNCY = { type: "spring" as const, stiffness: 300, damping: 18 };

// Smooth — ultra-fluid for scroll-linked or continuous animations
export const SPRING_SMOOTH = { type: "spring" as const, stiffness: 120, damping: 20, mass: 1.5 };

// Card hover — every card gets this
export const cardHover = {
  rest: { y: 0, scale: 1 },
  hover: { y: -4, scale: 1.01 },
  tap: { scale: 0.98 },
};

// Stagger container — every list/grid uses this
export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

// Stagger child — pairs with staggerContainer
export const staggerChild = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: SPRING,
  },
};

// Panel slide from right
export const slideRight = {
  initial: { x: "100%", opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: "100%", opacity: 0 },
  transition: SPRING_GENTLE,
};

// Panel expand width
export const expandWidth = (width: number) => ({
  initial: { width: 0, opacity: 0 },
  animate: { width, opacity: 1 },
  exit: { width: 0, opacity: 0 },
  transition: SPRING_GENTLE,
});

// Fade up — for sections entering viewport
export const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: SPRING,
};
