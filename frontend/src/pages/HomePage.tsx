import { useSelector } from 'react-redux';
import SocialHome from '@/components/feed/SocialHome';
import LandingPage from '@/pages/LandingPage';

// Ana sayfa: giriş yapmış kullanıcıya sosyal akış (arama / Explore dahil), ziyaretçiye her durumda tanıtım sayfası.
// Ziyaretçi not listesini ve aramayı göremez; paylaşılan tek bir not ya da profil bağlantısı ise açılabilir.
export default function HomePage() {
  const token = useSelector((state) => state.auth.token);
  return token ? <SocialHome /> : <LandingPage />;
}
