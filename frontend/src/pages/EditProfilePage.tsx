import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Camera } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import PasswordField from '@/components/auth/PasswordField';
import Alert from '@/components/common/Alert';
import UserAvatar from '@/components/users/UserAvatar';
import { useChangePasswordMutation, useUpdateAvatarMutation, useUpdateProfileMutation } from '@/services/usersApi';
import { getErrorMessage } from '@/lib/getErrorMessage';

export default function EditProfilePage() {
  const user = useSelector((state) => state.auth.user);

  return (
    <PageLayout narrow>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <Link to={`/users/${user.id}`} className="text-sm font-semibold text-navy-600 hover:text-navy-700">
          View my profile →
        </Link>
      </div>

      <div className="mt-6 space-y-6">
        <AvatarSection user={user} />
        <ProfileSection user={user} />
        <PasswordSection />
      </div>
    </PageLayout>
  );
}

function Section({ title, description, children }) {
  return (
    <section className="card p-5 sm:p-7">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function AvatarSection({ user }) {
  const [updateAvatar, { isLoading }] = useUpdateAvatarMutation();
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setFeedback({ type: 'error', text: 'Profile photo can be at most 2 MB.' });
      return;
    }
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      await updateAvatar(formData).unwrap();
      setFeedback({ type: 'success', text: 'Profile photo updated.' });
    } catch (err) {
      setFeedback({ type: 'error', text: getErrorMessage(err) });
    }
  };

  return (
    <Section title="Profile Photo">
      <div className="flex items-center gap-5">
        <UserAvatar user={user} size="lg" />
        <div>
          <button type="button" onClick={() => inputRef.current?.click()} disabled={isLoading} className="btn-secondary">
            <Camera size={16} /> {isLoading ? 'Uploading...' : 'Change Photo'}
          </button>
          <p className="text-xs text-gray-400 mt-1.5">JPG or PNG, up to 2 MB.</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png"
          className="hidden"
          onChange={(e) => {
            handleFile(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </div>
      <Alert variant={feedback.type || 'error'} className="mt-4">
        {feedback.text}
      </Alert>
    </Section>
  );
}

function ProfileSection({ user }) {
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const [form, setForm] = useState({
    fullName: user.fullName,
    university: user.university,
    department: user.department,
    bio: user.bio ?? '',
  });
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(form).unwrap();
      setFeedback({ type: 'success', text: 'Your profile has been updated.' });
    } catch (err) {
      setFeedback({ type: 'error', text: getErrorMessage(err) });
    }
  };

  return (
    <Section title="Profile Information" description={`Email: ${user.email}`}>
      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="fullName" className="form-label">Full Name</label>
          <input id="fullName" name="fullName" required value={form.fullName} onChange={handleChange} className="form-input" />
        </div>
        <div>
          <label htmlFor="university" className="form-label">University</label>
          <input id="university" name="university" required value={form.university} onChange={handleChange} className="form-input" />
        </div>
        <div>
          <label htmlFor="department" className="form-label">Department</label>
          <input id="department" name="department" required value={form.department} onChange={handleChange} className="form-input" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="bio" className="form-label">About Me</label>
          <textarea
            id="bio"
            name="bio"
            rows={3}
            maxLength={500}
            value={form.bio}
            onChange={handleChange}
            placeholder="e.g. 3rd-year CENG student, sharing algorithm notes."
            className="form-input resize-y"
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{form.bio.length}/500</p>
        </div>
        <div className="sm:col-span-2 space-y-3">
          <Alert variant={feedback.type || 'error'}>{feedback.text}</Alert>
          <button type="submit" disabled={isLoading} className="btn-primary">
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </Section>
  );
}

function PasswordSection() {
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await changePassword({ currentPassword, newPassword }).unwrap();
      setCurrentPassword('');
      setNewPassword('');
      setFeedback({ type: 'success', text: 'Your password has been updated.' });
    } catch (err) {
      setFeedback({ type: 'error', text: getErrorMessage(err) });
    }
  };

  return (
    <Section title="Change Password">
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <PasswordField
          id="currentPassword"
          label="Current password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          autoComplete="current-password"
        />
        <PasswordField
          id="newPassword"
          label="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
          minLength={8}
          hint="At least 8 characters"
        />
        <Alert variant={feedback.type || 'error'}>{feedback.text}</Alert>
        <button type="submit" disabled={isLoading} className="btn-primary">
          {isLoading ? 'Saving...' : 'Update Password'}
        </button>
      </form>
    </Section>
  );
}
