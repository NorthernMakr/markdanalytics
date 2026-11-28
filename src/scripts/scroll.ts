// Pushes scroll-depth milestones once each, measured against the article body
// rather than the whole page (footers would otherwise inflate the numbers).
//   dataLayer:      { event: 'scroll_depth', percent_scrolled: 50 }
//   adobeDataLayer: { event: 'content scrolled', content: { scrollDepth: 50 } }
import { ga4, adobe } from './lab';

export function trackScrollDepth(el: Element | null, marks = [25, 50, 75, 100]) {
  if (!el) return;
  const fired = new Set<number>();
  let ticking = false;

  const check = () => {
    ticking = false;
    const rect = el.getBoundingClientRect();
    const total = rect.height;
    if (total <= 0) return;
    const seen = Math.min(total, Math.max(0, window.innerHeight - rect.top));
    const pct = (seen / total) * 100;
    for (const m of marks) {
      if (pct >= m && !fired.has(m)) {
        fired.add(m);
        ga4({ event: 'scroll_depth', percent_scrolled: m });
        adobe({ event: 'content scrolled', content: { scrollDepth: m } });
      }
    }
  };

  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(check); }
  }, { passive: true });
  check();
}

// Page scroll reach, on every page (loaded from Base.astro). Measures how far
// the visitor has scrolled through the scrollable length of the WHOLE page:
// 0% at the top, 100% at the bottom. Each milestone fires once per page view,
// only after the visitor scrolls, so nothing is sent on load and a page that
// fits on screen sends nothing.
//   dataLayer:      { event: 'page_scroll', percent_scrolled: 50 }
//   adobeDataLayer: { event: 'page scrolled', scroll: { depth: 50 } }
// Adobe: 25/50/75/100 → event11/event12/event13/event14 (public/lab/websdk-bridge.js)
export const PAGE_SCROLL_MARKS = [25, 50, 75, 100] as const;

export function trackPageScroll() {
  const fired = new Set<number>();
  let ticking = false;
  const check = () => {
    ticking = false;
    const doc = document.documentElement;
    const range = doc.scrollHeight - window.innerHeight;
    if (range <= 0) return;
    // +2px: the last pixel of a fractional scroll position can't always be reached
    const pct = Math.min(100, ((window.scrollY + 2) / range) * 100);
    for (const m of PAGE_SCROLL_MARKS) {
      if (pct >= m && !fired.has(m)) {
        fired.add(m);
        ga4({ event: 'page_scroll', percent_scrolled: m });
        adobe({ event: 'page scrolled', scroll: { depth: m } });
      }
    }
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(check); }
  }, { passive: true });
}
