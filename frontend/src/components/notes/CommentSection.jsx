import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Trash2 } from 'lucide-react';
import Alert from '@/components/common/Alert';
import { useAddCommentMutation, useDeleteCommentMutation } from '@/services/notesApi';
import { getErrorMessage } from '@/lib/getErrorMessage';
import { timeAgo } from '@/lib/format';

export default function CommentSection({ note }) {
  const user = useSelector((state) => state.auth.user);
  const [addComment, { isLoading: adding }] = useAddCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await addComment({ id: note._id, text: text.trim() }).unwrap();
      setText('');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await deleteComment({ id: note._id, commentId }).unwrap();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  // Yorumu, yorumun sahibi veya notun sahibi silebilir (backend ile aynı kural).
  const canDelete = (comment) => user && (comment.user?._id === user.id || note.isOwner);

  return (
    <section className="card p-5" aria-labelledby="comments-title">
      <h2 id="comments-title" className="text-lg font-semibold text-gray-900">
        Comments <span className="text-gray-400 font-normal text-base">({note.comments.length})</span>
      </h2>

      <ul className="mt-3 divide-y divide-gray-100">
        {note.comments.length === 0 && <li className="py-2 text-sm text-gray-400">No comments yet. Be the first to comment.</li>}
        {note.comments.map((comment) => (
          <li key={comment._id} className="group py-2.5 flex items-start gap-2">
            <p className="flex-1 min-w-0 text-sm text-gray-700 break-words whitespace-pre-line">
              <Link to={`/users/${comment.user?._id}`} className="font-semibold text-gray-900 hover:text-navy-600">
                {comment.user?.fullName ?? 'Deleted user'}
              </Link>
              : {comment.text}
              <span className="block text-xs text-gray-400 mt-0.5">{timeAgo(comment.createdAt)}</span>
            </p>
            {canDelete(comment) && (
              <button
                type="button"
                onClick={() => handleDelete(comment._id)}
                className="p-1 rounded text-gray-300 hover:text-rose-500 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 transition-opacity"
                aria-label="Delete comment"
              >
                <Trash2 size={14} />
              </button>
            )}
          </li>
        ))}
      </ul>

      {!user ? (
        <p className="mt-3 text-sm text-gray-500">
          <Link to="/login" state={{ from: `/notes/${note._id}` }} className="font-semibold text-navy-600 hover:text-navy-700">
            Log in
          </Link>{' '}
          to leave a comment.
        </p>
      ) : !user.isVerified ? (
        <p className="mt-3 text-sm text-gray-500">Verify your email address to leave a comment.</p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            maxLength={1000}
            placeholder="Write a comment..."
            className="form-input resize-y text-sm"
            aria-label="Comment"
          />
          <div className="mt-2 flex justify-end">
            <button type="submit" disabled={adding || !text.trim()} className="btn-primary py-2">
              {adding ? 'Sending...' : 'Comment'}
            </button>
          </div>
        </form>
      )}

      <Alert className="mt-3">{error}</Alert>
    </section>
  );
}
