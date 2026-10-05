import { useState } from 'react';
import { useSelector } from 'react-redux';
import { MailWarning } from 'lucide-react';
import { useResendVerificationMutation } from '@/services/authApi';
import { getErrorMessage } from '@/lib/getErrorMessage';

// Giriş yapmış ama e-postasını doğrulamamış kullanıcıya gösterilen uyarı şeridi.
export default function VerifyBanner() {
  const user = useSelector((state) => state.auth.user);
  const [resend, { isLoading }] = useResendVerificationMutation();
  const [message, setMessage] = useState('');

  if (!user || user.isVerified) return null;

  const handleResend = async () => {
    try {
      const res = await resend().unwrap();
      setMessage(res.message);
    } catch (err) {
      setMessage(getErrorMessage(err));
    }
  };

  return (
    <div className="bg-amber-50 border-b border-amber-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-amber-800">
        <MailWarning size={16} className="shrink-0" />
        <span>
          <strong>{user.email}</strong> — until you verify this address you can't upload, download or interact with notes.
        </span>
        {message ? (
          <span className="font-medium">{message}</span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={isLoading}
            className="font-semibold underline underline-offset-2 hover:text-amber-900"
          >
            {isLoading ? 'Sending...' : 'Resend verification email'}
          </button>
        )}
      </div>
    </div>
  );
}
