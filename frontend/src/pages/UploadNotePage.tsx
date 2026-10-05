import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { MailWarning } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import NoteForm from '@/components/notes/NoteForm';
import EmptyState from '@/components/common/EmptyState';
import Spinner from '@/components/common/Spinner';
import { useCreateNoteMutation } from '@/services/notesApi';
import { useGetMyGroupsQuery } from '@/services/groupsApi';
import { getErrorMessage } from '@/lib/getErrorMessage';

export default function UploadNotePage() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [createNote, { isLoading }] = useCreateNoteMutation();
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  // Grup sayfasındaki "Share a Note" butonundan gelindiyse o grup önceden seçili olur.
  const { data: myGroups, isLoading: groupsLoading } = useGetMyGroupsQuery({ limit: 50 }, { skip: !user?.isVerified });
  const groups = myGroups?.data?.items ?? [];
  const preselectedGroup = groups.some((g) => g._id === searchParams.get('group')) ? searchParams.get('group') : '';

  if (!user?.isVerified) {
    return (
      <PageLayout narrow>
        <EmptyState
          icon={MailWarning}
          title="Verify your email first"
          text="To upload notes, click the link we sent to your email address."
        />
      </PageLayout>
    );
  }

  const handleSubmit = async (values, file) => {
    setError('');
    const formData = new FormData();
    Object.entries(values).forEach(([k, v]) => v && formData.append(k, v));
    formData.append('file', file);
    try {
      const res = await createNote(formData).unwrap();
      navigate(`/notes/${res.data.note._id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  // Form ilk değerlerini bir kez aldığı için gruplar yüklenmeden gösterilmez.
  if (groupsLoading) return <PageLayout narrow><Spinner /></PageLayout>;

  return (
    <PageLayout narrow>
      <h1 className="text-2xl font-bold text-gray-900">Upload Note</h1>
      <p className="text-sm text-gray-500 mt-1">
        Share your class notes, slides or past exams. Other students can download them for free.
      </p>
      <div className="card p-5 sm:p-7 mt-6">
        <NoteForm
          // Üniversite ve bölüm profilden önceden doldurulur, istenirse değiştirilebilir.
          initialValues={{ university: user.university, department: user.department, group: preselectedGroup }}
          groups={groups}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          submitLabel="Share Note"
          error={error}
        />
      </div>
    </PageLayout>
  );
}
