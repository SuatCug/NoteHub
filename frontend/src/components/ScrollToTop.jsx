import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Sayfa değişince en üste kaydırır; adreste #bölüm varsa (örn. /contact#community) o bölüme gider.
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // Hedef bölüm yeni sayfa render edildikten sonra DOM'da olur.
      requestAnimationFrame(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }));
      return;
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}
