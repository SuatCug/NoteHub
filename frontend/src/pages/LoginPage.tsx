import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import AuthLayout from '@/components/auth/AuthLayout';
import PasswordField from '@/components/auth/PasswordField';
import Alert from '@/components/common/Alert';
import { useLoginMutation } from '@/services/authApi';
import { baseApi, SESSION_TAGS } from '@/services/baseApi';
import { setCredentials } from '@/app/authSlice';
import { getErrorMessage } from '@/lib/getErrorMessage';
import { EMAIL_PLACEHOLDER } from '@/lib/constants';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await login({ email, password }).unwrap();
      dispatch(setCredentials(data.data));
      // Anonimken önbelleğe alınan veriler (isLiked, isFollowing) yeni oturumla tekrar çekilsin.
      dispatch(baseApi.util.invalidateTags(SESSION_TAGS));
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <AuthLayout>
      <h1 className="text-3xl font-bold text-gray-900 text-center">Log In</h1>
      <p className="text-sm text-gray-500 mt-2 text-center">Log in with your email and password.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={EMAIL_PLACEHOLDER}
            className="form-input"
          />
        </div>

        <PasswordField
          id="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
          autoComplete="current-password"
        />

        <Alert>{error}</Alert>

        <button type="submit" disabled={isLoading} className="btn-primary w-full py-2.5 text-[15px]">
          {isLoading ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Don't have an account?{' '}
        <Link to="/register" className="text-navy-600 hover:text-navy-700 font-semibold">
          Sign Up
        </Link>
      </p>
      <p className="text-center text-sm mt-3">
        <Link to="/" className="text-gray-400 hover:text-gray-600">
          Browse notes without logging in →
        </Link>
      </p>
    </AuthLayout>
  );
}
