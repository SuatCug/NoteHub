import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { CheckCircle2, Loader2, LogOut, MailCheck, XCircle } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout';
import Alert from '@/components/common/Alert';
import { useGetMeQuery, useResendVerificationMutation, useVerifyEmailMutation } from '@/services/authApi';
import { baseApi, SESSION_TAGS } from '@/services/baseApi';
import { logout, setUser } from '@/app/authSlice';
import { getErrorMessage } from '@/lib/getErrorMessage';

// İki durum: ?token=... ile gelindiyse doğrulama yapılır; token yoksa "e-postanı kontrol et" ekranı gösterilir.
// Doğrulanmamış kullanıcı sitede başka bir sayfaya gidemez (bkz. App); bu ekranda bekler, mail bağlantısına
// başka bir cihazdan/sekmeden tıklarsa durum periyodik kontrolle algılanıp ana sayfaya geçilir.
const VERIFY_CHECK_INTERVAL_MS = 5000;

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const authToken = useAppSelector((state) => state.auth.token);
  const user = useAppSelector((state) => state.auth.user);
  const waitingForVerification = Boolean(!token && authToken && user && !user.isVerified);
  // Bağlantı başka yerde tıklanırsa yakalamak için oturumdaki kullanıcı birkaç saniyede bir yenilenir.
  useGetMeQuery(undefined, { skip: !waitingForVerification, pollingInterval: VERIFY_CHECK_INTERVAL_MS });
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

  const handleLogout = () => {
    dispatch(logout());
    dispatch(baseApi.util.invalidateTags(SESSION_TAGS));
    navigate('/', { replace: true });
  };

  // Bekleme ekranındayken doğrulandıysa (başka sekme/cihaz) doğrudan siteye geçilir.
  if (status === 'pending' && authToken && user?.isVerified) return <Navigate to="/" replace />;

  const handleResend = async () => {
    try {
      const res = await resend().unwrap();
      setMessage(res.message ?? '');
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
            {user && !user.isVerified && (
              <>
                <p className="mt-4 text-xs text-gray-400">
                  You need to verify your email to use SearchNote. This page continues automatically once you click the
                  link. Can't find it? Check your spam or junk folder.
                </p>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-800"
                >
                  <LogOut size={15} /> Log out
                </button>
              </>
            )}
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
