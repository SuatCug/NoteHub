import Navbar from './Navbar';
import VerifyBanner from './VerifyBanner';
import Footer from './Footer';

// Auth ekranları dışındaki tüm sayfaların ortak iskeleti.
export default function PageLayout({ children, narrow = false }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <VerifyBanner />
      <main className={`flex-1 w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 ${narrow ? 'max-w-3xl' : 'max-w-6xl'}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
