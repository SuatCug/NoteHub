import { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ScrollToTop from '@/components/ScrollToTop';
import { useGetMeQuery } from '@/services/authApi';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import VerifyEmailPage from '@/pages/VerifyEmailPage';
import HomePage from '@/pages/HomePage';
import NoteDetailPage from '@/pages/NoteDetailPage';
import UploadNotePage from '@/pages/UploadNotePage';
import EditNotePage from '@/pages/EditNotePage';
import ProfilePage from '@/pages/ProfilePage';
import UserNotesPage from '@/pages/UserNotesPage';
import UserConnectionsPage from '@/pages/UserConnectionsPage';
import EditProfilePage from '@/pages/EditProfilePage';
import NotFoundPage from '@/pages/NotFoundPage';
import LegalPage from '@/pages/LegalPage';
import GroupsPage from '@/pages/GroupsPage';
import GroupDetailPage from '@/pages/GroupDetailPage';
import CreateGroupPage from '@/pages/CreateGroupPage';
import EditGroupPage from '@/pages/EditGroupPage';
import AboutPage from '@/pages/AboutPage';
import HowItWorksPage from '@/pages/HowItWorksPage';
import HelpPage from '@/pages/HelpPage';
import GuidelinesPage from '@/pages/GuidelinesPage';
import ContactPage from '@/pages/ContactPage';
import MessagesPage from '@/pages/MessagesPage';

// Giriş gerektiren sayfalar: giriş sonrası geri dönülebilmesi için gelinen adres saklanır.
function RequireAuth({ children }) {
  const token = useSelector((state) => state.auth.token);
  const location = useLocation();
  return token ? children : <Navigate to="/login" replace state={{ from: location.pathname }} />;
}

// Zaten giriş yapmış kullanıcı login/register ekranlarını görmez. Sadece sayfa açıldığı andaki
// token'a bakılır: form gönderilip token set edildiğinde yönlendirmeyi sayfanın kendisi yapar
// (aksi halde Redux güncellemesi router geçişinden önce işlenip kullanıcıyı yanlış sayfaya atıyor).
function GuestOnly({ children }) {
  const token = useSelector((state) => state.auth.token);
  const [hadTokenOnMount] = useState(Boolean(token));
  return hadTokenOnMount ? <Navigate to="/" replace /> : children;
}

export default function App() {
  const token = useSelector((state) => state.auth.token);
  // Uygulama açılışında kullanıcı bilgisini tazeler (örn. başka sekmede e-posta doğrulandıysa).
  useGetMeQuery(undefined, { skip: !token });

  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Anonim ziyaretçilere açık */}
        <Route path="/" element={<HomePage />} />
        <Route path="/notes/:id" element={<NoteDetailPage />} />
        <Route path="/users/:id" element={<ProfilePage />} />
        <Route path="/users/:id/notes" element={<UserNotesPage />} />
        <Route path="/users/:id/followers" element={<UserConnectionsPage key="followers" type="followers" />} />
        <Route path="/users/:id/following" element={<UserConnectionsPage key="following" type="following" />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/legal/:slug" element={<LegalPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/guidelines" element={<GuidelinesPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/groups" element={<GroupsPage />} />
        <Route path="/groups/:id" element={<GroupDetailPage />} />

        <Route path="/login" element={<GuestOnly><LoginPage /></GuestOnly>} />
        <Route path="/register" element={<GuestOnly><RegisterPage /></GuestOnly>} />

        {/* Giriş gerekli */}
        <Route path="/upload" element={<RequireAuth><UploadNotePage /></RequireAuth>} />
        <Route path="/notes/:id/edit" element={<RequireAuth><EditNotePage /></RequireAuth>} />
        <Route path="/profile/edit" element={<RequireAuth><EditProfilePage /></RequireAuth>} />
        <Route path="/groups/new" element={<RequireAuth><CreateGroupPage /></RequireAuth>} />
        <Route path="/groups/:id/edit" element={<RequireAuth><EditGroupPage /></RequireAuth>} />
        <Route path="/messages" element={<RequireAuth><MessagesPage /></RequireAuth>} />
        <Route path="/messages/:id" element={<RequireAuth><MessagesPage /></RequireAuth>} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
