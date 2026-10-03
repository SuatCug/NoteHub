import { Link } from 'react-router-dom';
import { Download, Heart, MessageCircle } from 'lucide-react';
import FileTypeBadge from './FileTypeBadge';
import UserAvatar from '@/components/users/UserAvatar';
import { formatCount, timeAgo } from '@/lib/format';

export default function NoteCard({ note, index = 0 }) {
  return (
    <article
      className="card card-enter relative flex flex-col p-5 hover:shadow-md hover:border-navy-100 transition-all"
      style={{ animationDelay: `${Math.min(index, 12) * 60}ms` }}
    >
      <div className="flex items-center justify-between gap-2">
        <FileTypeBadge type={note.fileType} />
        {note.courseCode && (
          <span className="text-xs font-bold tracking-wide text-navy-600 bg-navy-50 rounded-md px-2 py-0.5">
            {note.courseCode}
          </span>
        )}
      </div>

      <h3 className="mt-3 text-base font-semibold text-gray-900 leading-snug line-clamp-2">
        {/* Kartın tamamını tıklanabilir yapan bağlantı */}
        <Link to={`/notes/${note._id}`} className="after:absolute after:inset-0 after:rounded-xl">
          {note.title}
        </Link>
      </h3>
      <p className="mt-1 text-sm text-gray-500 line-clamp-1">{note.courseName}</p>

      <dl className="mt-3 space-y-1 text-xs text-gray-500">
        <div className="truncate">
          <dt className="sr-only">University</dt>
          <dd className="truncate">
            {note.university} · {note.department}
          </dd>
        </div>
        {(note.instructorName || note.semester) && (
          <div className="truncate">
            <dt className="sr-only">Instructor and semester</dt>
            <dd className="truncate">{[note.instructorName, note.semester].filter(Boolean).join(' · ')}</dd>
          </div>
        )}
      </dl>

      <div className="flex-1 min-h-4" />

      <div className="pt-4 flex items-center justify-between gap-2 border-t border-gray-100">
        <Link
          to={`/users/${note.author?._id}`}
          className="relative z-10 flex items-center gap-2 min-w-0 hover:text-navy-600 text-gray-600"
        >
          <UserAvatar user={note.author} size="xs" />
          <span className="text-xs font-medium truncate">{note.author?.fullName}</span>
          <span className="text-xs text-gray-400 shrink-0">· {timeAgo(note.createdAt)}</span>
        </Link>

        <div className="flex items-center gap-3 text-xs text-gray-400 shrink-0">
          <span className={`flex items-center gap-1 ${note.isLiked ? 'text-rose-500' : ''}`} title="Likes">
            <Heart size={14} className={note.isLiked ? 'fill-rose-500' : ''} />
            {formatCount(note.likesCount)}
          </span>
          <span className="flex items-center gap-1" title="Comments">
            <MessageCircle size={14} />
            {formatCount(note.commentsCount)}
          </span>
          <span className="flex items-center gap-1" title="Downloads">
            <Download size={14} />
            {formatCount(note.downloadsCount)}
          </span>
        </div>
      </div>
    </article>
  );
}
