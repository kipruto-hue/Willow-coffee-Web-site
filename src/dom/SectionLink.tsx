import type { MouseEvent, ReactNode } from 'react';
import { scrollToSection } from '../scroll/SmoothScroll';

/**
 * A real `<a href="#section">`, so it is crawlable, keyboard-reachable, and
 * middle-clickable — but routed through Lenis on plain left-click so the scroll
 * stays smooth instead of teleporting (§2: content is real DOM; §5.1: one clock).
 */
export function SectionLink({
  target,
  className,
  children,
  onNavigate,
  current,
}: {
  target: string;
  className?: string;
  children: ReactNode;
  onNavigate?: () => void;
  /** True when this link points at the section currently in view. */
  current?: boolean;
}) {
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    // Let modified clicks (new tab, download, etc.) behave natively.
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
      return;
    }
    e.preventDefault();
    scrollToSection(target);
    onNavigate?.();
  };

  return (
    <a
      href={`#${target}`}
      className={className}
      onClick={handle}
      aria-current={current ? 'true' : undefined}
    >
      {children}
    </a>
  );
}
