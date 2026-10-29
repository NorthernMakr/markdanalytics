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
