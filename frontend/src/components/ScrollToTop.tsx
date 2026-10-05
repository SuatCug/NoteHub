import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// Hedef bölümün DOM'a gelmesi için en fazla bu kadar beklenir (veri yüklenirken sayfa spinner gösterir).
const FIND_TIMEOUT_MS = 5000;
// Bölüm bulunduktan sonra üstteki içerik (PDF önizleme, görseller) yüklenip yerini kaydırırsa bu süre boyunca hizalanır.
const SETTLE_MS = 2500;

// Sayfa değişince en üste kaydırır; adreste #bölüm varsa (örn. /notes/:id#comments) o bölüme gider.
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const prevPathname = useRef<string | null>(null);

  useEffect(() => {
    const samePage = prevPathname.current === pathname;
    prevPathname.current = pathname;
    const id = decodeURIComponent(hash.slice(1));

    // Aynı sayfada sadece #bölüm değiştiyse (karşılama sayfası menüsü) bölüm zaten ekranda: yumuşak kaydır.
    const existing = id ? document.getElementById(id) : null;
    if (samePage && existing) {
      existing.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    // Önceki sayfanın kaydırma konumu kalmasın: hedef henüz yoksa sayfa başından beklenir.
    window.scrollTo(0, 0);
    if (!id) return;

    const started = performance.now();
    let foundAt = 0;
    let frame = 0;
    let stopped = false;

    const stop = () => {
      stopped = true;
      cancelAnimationFrame(frame);
      window.removeEventListener('wheel', stop);
      window.removeEventListener('touchstart', stop);
      window.removeEventListener('keydown', stop);
    };
    // Kullanıcı kendisi kaydırmaya başlarsa araya girmeyiz.
    window.addEventListener('wheel', stop, { passive: true });
    window.addEventListener('touchstart', stop, { passive: true });
    window.addEventListener('keydown', stop);

    let lastTop: number | null = null;
    const tick = () => {
      if (stopped) return;
      const now = performance.now();
      const el = document.getElementById(id);

      if (!el) {
        if (now - started > FIND_TIMEOUT_MS) return stop();
      } else {
        if (!foundAt) foundAt = now;
        // Düzen kaydıkça hedefe yeniden hizala (anlık kaydırma: smooth animasyon kayan hedefi kaçırıyor).
        const top = el.getBoundingClientRect().top + window.scrollY;
        if (top !== lastTop) {
          el.scrollIntoView({ block: 'start' });
          lastTop = top;
        }
        if (now - foundAt > SETTLE_MS) return stop();
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return stop;
  }, [pathname, hash]);

  return null;
}
