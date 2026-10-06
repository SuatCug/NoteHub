import { UserX } from 'lucide-react';
import UserAvatar from '@/components/users/UserAvatar';
import type { UserCard } from '@/types/api';

interface ChatAvatarProps {
  user: Pick<UserCard, 'fullName' | 'avatarUrl'> | null;
  online?: boolean;
  // md: sohbet başlığı (40px), lg: konuşma listesi (52px).
  size?: 'md' | 'lg';
}

// Mesajlaşma ekranlarındaki avatar: çevrimiçiyse sağ altta mavi nokta; hesap silinmişse kişi-çarpı simgesi.
export default function ChatAvatar({ user, online = false, size = 'lg' }: ChatAvatarProps) {
  const lg = size === 'lg';
  return (
    <span className="relative shrink-0">
      {user ? (
        <UserAvatar user={user} size={lg ? 'chat' : 'md'} />
      ) : (
        <span
          className={`${lg ? 'w-[52px] h-[52px]' : 'w-10 h-10'} rounded-full bg-navy-50 text-navy-400 flex items-center justify-center`}
        >
          <UserX size={lg ? 22 : 18} />
        </span>
      )}
      {online && (
        <span
          className={`absolute bottom-0 right-0 rounded-full bg-sky-500 ring-2 ring-white ${lg ? 'w-3.5 h-3.5' : 'w-3 h-3'}`}
          aria-label="Online"
        />
      )}
    </span>
  );
}
