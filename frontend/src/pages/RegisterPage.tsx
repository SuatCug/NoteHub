import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/app/hooks';
import AuthLayout from '@/components/auth/AuthLayout';
import PasswordField from '@/components/auth/PasswordField';
import Alert from '@/components/common/Alert';
import { useRegisterMutation, type RegisterPayload } from '@/services/authApi';
import { baseApi, SESSION_TAGS } from '@/services/baseApi';
import { setCredentials } from '@/app/authSlice';
import { getErrorMessage } from '@/lib/getErrorMessage';
import { EDU_EMAIL_REGEX, EMAIL_PLACEHOLDER, REQUIRE_EDU_EMAIL } from '@/lib/constants';

const SCHOOL_FIELDS: { name: 'university' | 'department'; label: string; placeholder: string; autoComplete?: string }[] = [
  { name: 'university', label: 'University', placeholder: 'e.g. Middle East Technical University', autoComplete: 'organization' },
  { name: 'department', label: 'Department', placeholder: 'e.g. Computer Engineering' },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [register, { isLoading }] = useRegisterMutation();

  const [form, setForm] = useState<RegisterPayload>({ fullName: '', email: '', password: '', university: '', department: '' });
  const [error, setError] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const emailInvalid = REQUIRE_EDU_EMAIL && form.email.includes('@') && !EDU_EMAIL_REGEX.test(form.email.trim());

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    if (REQUIRE_EDU_EMAIL && !EDU_EMAIL_REGEX.test(form.email.trim())) {
      setError('You can only sign up with a .edu.tr school email address.');
      return;
    }
    try {
      const data = await register(form).unwrap();
      dispatch(setCredentials(data.data));
      dispatch(baseApi.util.invalidateTags(SESSION_TAGS));
      // Doğrulama şartı kapalıysa backend kullanıcıyı doğrulanmış döndürür; doğrudan ana sayfaya geçilir.
      navigate(data.data.user.isVerified ? '/' : '/verify-email', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <AuthLayout>
      <h1 className="text-3xl font-bold text-gray-900 text-center">Sign Up</h1>
      <p className="text-sm text-gray-500 mt-2 text-center">{REQUIRE_EDU_EMAIL ? 'Create a free account with your school email.' : 'Create a free account.'}</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="fullName" className="form-label">
            Full Name
          </label>
          <input
            id="fullName"
            name="fullName"
            required
            value={form.fullName}
            onChange={handleChange}
            placeholder="Jane Doe"
            autoComplete="name"
            className="form-input"
          />
        </div>

        <div>
          <label htmlFor="email" className="form-label">
            {REQUIRE_EDU_EMAIL ? 'School Email' : 'Email'}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            placeholder={EMAIL_PLACEHOLDER}
            aria-invalid={emailInvalid}
            aria-describedby={REQUIRE_EDU_EMAIL ? 'email-hint' : undefined}
            className={`form-input ${emailInvalid ? 'border-rose-300 focus:ring-rose-400' : ''}`}
          />
          {REQUIRE_EDU_EMAIL && (
            <p id="email-hint" className={`mt-1 text-xs ${emailInvalid ? 'text-rose-500' : 'text-gray-400'}`}>
              Only .edu.tr addresses are accepted.
            </p>
          )}
        </div>

        {SCHOOL_FIELDS.map((f) => (
          <div key={f.name}>
            <label htmlFor={f.name} className="form-label">
              {f.label}
            </label>
            <input
              id={f.name}
              name={f.name}
              required
              value={form[f.name]}
              onChange={handleChange}
              placeholder={f.placeholder}
              autoComplete={f.autoComplete}
              className="form-input"
            />
          </div>
        ))}

        <PasswordField
          id="password"
          label="Password"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          placeholder="At least 8 characters"
          autoComplete="new-password"
          minLength={8}
        />

        <Alert>{error}</Alert>

        <button type="submit" disabled={isLoading} className="btn-primary w-full py-2.5 text-[15px]">
          {isLoading ? 'Signing up...' : 'Sign Up'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-navy-600 hover:text-navy-700 font-semibold">
          Log In
        </Link>
      </p>
    </AuthLayout>
  );
}
