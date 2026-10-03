import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CheckCircle2, Loader2, MailCheck, XCircle } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout';
import Alert from '@/components/common/Alert';
import { useResendVerificationMutation, useVerifyEmailMutation } from '@/services/authApi';
import { setUser } from '@/app/authSlice';
import { getErrorMessage } from '@/lib/getErrorMessage';

// İki durum: ?token=... ile gelindiyse doğrulama yapılır; token yoksa "e-postanı kontrol et" ekranı gösterilir.
export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [verifyEmail] = useVerifyEmailMutation();
  const [resend, { isLoading: resending }] = useResendVerificationMutation();

  const [status, setStatus] = useState(token ? 'loading' : 'pending');
  const [message, setMessage] = useState('');
  const started = useRef(false);

  useEffect(() => {
    // StrictMode'da effect iki kez çalışır; tek kullanımlık token'ı iki kez göndermemek için.
    if (!token || started.current) return;
    started.current = true;
    verifyEmail(token)
      .unwrap()
      .then((res) => {
        // Doğrulama başka bir cihazda/oturumda yapılmış olabilir; sadece aynı kullanıcıysa state güncellenir.
        if (user && res.data.user.id === user.id) dispatch(setUser(res.data.user));
        setStatus('success');
      })
      .catch((err) => {
        setMessage(getErrorMessage(err));
        setStatus('error');
      });
  }, [token, verifyEmail, dispatch, user]);

  const handleResend = async () => {
    try {
      const res = await resend().unwrap();
      setMessage(res.message);
    } catch (err) {
      setMessage(getErrorMessage(err));
    }
  };

  return (
    <AuthLayout>
      <div className="text-center">
        {status === 'loading' && (
          <>
            <Loader2 size={40} className="mx-auto text-navy-500 animate-spin" />
            <h1 className="mt-4 text-2xl font-bold text-gray-900">Verifying your email...</h1>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 size={48} className="mx-auto text-emerald-500" />
            <h1 className="mt-4 text-2xl font-bold text-gray-900">Your account is verified!</h1>
            <p className="mt-2 text-sm text-gray-500">You can now upload, download and interact with notes.</p>
            <Link to={user ? '/' : '/login'} className="btn-primary mt-6">
              {user ? 'Browse notes' : 'Log in'}
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle size={48} className="mx-auto text-rose-500" />
            <h1 className="mt-4 text-2xl font-bold text-gray-900">Verification failed</h1>
            <p className="mt-2 text-sm text-gray-500">{message}</p>
            {user && !user.isVerified && (
              <button type="button" onClick={handleResend} disabled={resending} className="btn-primary mt-6">
                Send a new link
              </button>
            )}
          </>
        )}

        {status === 'pending' && (
          <>
            <MailCheck size={48} className="mx-auto text-navy-500" />
            <h1 className="mt-4 text-2xl font-bold text-gray-900">Check your email</h1>
            <p className="mt-2 text-sm text-gray-500">
              We sent a verification link to{' '}
              {user?.email ? <strong className="text-gray-700">{user.email}</strong> : 'your email address'}. The link is
              valid for 24 hours.
            </p>
            {user && !user.isVerified && (
              <button type="button" onClick={handleResend} disabled={resending} className="btn-secondary mt-6">
                {resending ? 'Sending...' : 'Resend link'}
              </button>
            )}
            <p className="mt-6 text-sm">
              <Link to="/" className="text-navy-600 hover:text-navy-700 font-semibold">
                Browse notes for now →
              </Link>
            </p>
          </>
        )}

        {message && status !== 'error' && (
          <Alert variant="info" className="mt-4">
            {message}
          </Alert>
        )}
      </div>
    </AuthLayout>
  );
}
