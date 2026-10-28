/**
 * Scrolls smoothly to a section on the current page, or jumps instantly
 * when the visitor has asked their system for reduced motion.
 */
export const scrollToSection = (sectionId: string): void => {
  const element = document.getElementById(sectionId);
  if (!element) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  element.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
};
