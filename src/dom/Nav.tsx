import { useEffect, useRef, useState } from 'react';
import { LogoMark } from './LogoMark';
import { SectionLink } from './SectionLink';
import { brand, nav } from '../content/site';
import { useAppStore } from '../store/useAppStore';
import { generalOrderLink } from '../lib/whatsapp';

export function Nav() {
  const activeAct = useAppStore((s) => s.activeAct);
  const globalProgress = useAppStore((s) => s.globalProgress);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Derived, not subscribed per-frame: the nav only cares whether we have left
  // the hero, so it re-renders on a boolean flip rather than on every scroll tick.
  const scrolled = globalProgress > 0.02;

  // Escape closes the menu and returns focus to the control that opened it.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="nav" data-scrolled={scrolled ? 'true' : 'false'} data-open={open}>
      <SectionLink target="hero" className="nav__brand">
        <LogoMark />
        <span>{brand.name}</span>
      </SectionLink>

      <nav aria-label="Primary" className="nav__nav">
        <button
          ref={toggleRef}
          type="button"
          className="nav__toggle"
          aria-expanded={open}
          aria-controls="primary-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="visually-hidden">{open ? 'Close menu' : 'Open menu'}</span>
          <span className="nav__bars" aria-hidden="true" />
        </button>

        <ul id="primary-menu" className="nav__links" data-open={open}>
          {nav.map((link) => (
            <li key={link.target}>
              <SectionLink
                target={link.target}
                current={activeAct === link.target}
                onNavigate={() => setOpen(false)}
              >
                {link.label}
              </SectionLink>
            </li>
          ))}
        </ul>
      </nav>

      <a
        className="btn btn--primary nav__cta"
        href={generalOrderLink()}
        target="_blank"
        rel="noopener noreferrer"
      >
        order on whatsapp
      </a>
    </header>
  );
}
