import { useSelector } from 'react-redux';
import Navbar from './Navbar';
import GuestNavbar from './GuestNavbar';
import VerifyBanner from './VerifyBanner';
import Footer from './Footer';
import MobileTabBar from './MobileTabBar';

// Auth ekranları dışındaki tüm sayfaların ortak iskeleti. Ziyaretçi, karşılama sayfasındaki sade üst çubuğu görür.
// Giriş yapılmışsa telefonda alt sekme çubuğu çıkar; içerik onun altında kalmasın diye alttan boşluk bırakılır.
export default function PageLayout({ children, narrow = false }) {
  const token = useSelector((state) => state.auth.token);

  return (
    <div className={`min-h-screen flex flex-col ${token ? 'pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0' : ''}`}>
      {token ? <Navbar /> : <GuestNavbar />}
      <VerifyBanner />
      <main className={`flex-1 w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 ${narrow ? 'max-w-3xl' : 'max-w-6xl'}`}>
        {children}
      </main>
      <Footer />
      {token && <MobileTabBar />}
    </div>
  );
}
