import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Home, MessageCircle, Plus, UserRound, Users } from 'lucide-react';
import { useGetUnreadCountQuery } from '@/services/messagesApi';
import { UNREAD_POLL_INTERVAL_MS } from '@/lib/constants';

const itemClass = ({ isActive }) =>
  `relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-semibold transition-colors ${
    isActive ? 'text-navy-700' : 'text-gray-500 active:text-navy-700'
  }`;

// Telefonda (md altı) giriş yapmış kullanıcıya gösterilen alt sekme çubuğu.
// Masaüstünde bu bağlantılar üst bardadır.
export default function MobileTabBar() {
  const user = useSelector((state) => state.auth.user);
  const { data } = useGetUnreadCountQuery(undefined, {
    pollingInterval: UNREAD_POLL_INTERVAL_MS,
    skipPollingIfUnfocused: true,
  });
  const unread = data?.data?.count ?? 0;

  return (
    <nav
      aria-label="Main"
      className="md:hidden fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur pb-safe"
    >
      <div className="flex items-stretch h-16">
        <NavLink to="/" end className={itemClass}>
          <Home size={21} />
          Home
        </NavLink>
        <NavLink to="/groups" className={itemClass}>
          <Users size={21} />
          Groups
        </NavLink>
        <NavLink to="/upload" className="flex flex-1 items-center justify-center" aria-label="Upload Note">
          <span className="w-12 h-12 -mt-5 rounded-2xl bg-navy-700 text-white shadow-lg shadow-navy-900/30 ring-4 ring-white flex items-center justify-center">
            <Plus size={24} strokeWidth={2.5} />
          </span>
        </NavLink>
        <NavLink to="/messages" className={itemClass} aria-label={unread ? `Messages, ${unread} unread` : 'Messages'}>
          <MessageCircle size={21} />
          Messages
          {unread > 0 && (
            <span className="absolute top-1 left-1/2 ml-1.5 min-w-[18px] rounded-full bg-rose-500 px-1 text-center text-[10px] font-bold leading-[18px] text-white ring-2 ring-white">
              {unread > 99 ? '99+' : unread}
            </span>
          )}
        </NavLink>
        <NavLink to={`/users/${user?.id}`} className={itemClass}>
          <UserRound size={21} />
          Profile
        </NavLink>
      </div>
    </nav>
  );
}
