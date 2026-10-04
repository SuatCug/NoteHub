import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PageLayout from '@/components/layout/PageLayout';
import BrowseNotes from '@/components/notes/BrowseNotes';
import SocialHome from '@/components/feed/SocialHome';
import LandingPage from '@/pages/LandingPage';

// Ana sayfa:
// - Giriş yapmış kullanıcı: sosyal akış (SocialHome).
// - Ziyaretçi, düz "/": tanıtım sayfası (LandingPage).
// - Ziyaretçi, arama yaptı ya da "?all=1": not listesi (BrowseNotes).
export default function HomePage() {
  const token = useSelector((state) => state.auth.token);
  const [searchParams] = useSearchParams();

  if (token) return <SocialHome />;
  if (!searchParams.toString()) return <LandingPage />;

  return (
    <PageLayout>
      <BrowseNotes />
    </PageLayout>
  );
}
