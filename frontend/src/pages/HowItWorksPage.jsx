import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Download, MessagesSquare, Search, Upload, UserPlus, Users } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import PageHeader from '@/components/layout/PageHeader';
import { MAX_FILE_SIZE_MB } from '@/lib/constants';

const STEPS = [
  {
    icon: UserPlus,
    title: 'Create your free account',
    text: 'Sign up with your email, university and department. It takes less than a minute and you never pay anything.',
  },
  {
    icon: Search,
    title: 'Find the notes you need',
    text: 'Search by course code, course name, instructor or keyword, then narrow down by university, department, semester and file type.',
  },
  {
    icon: Download,
    title: 'Preview and download',
    text: 'Preview PDFs and images right in your browser. Download any note for free — there are no credits or limits.',
  },
  {
    icon: Upload,
    title: 'Share your own notes',
    text: `Upload PDF, Word, image or archive files up to ${MAX_FILE_SIZE_MB} MB. Add the course details so others can find your work.`,
  },
  {
    icon: Users,
    title: 'Study together in groups',
    text: 'Create or join study groups. Notes shared in a group are visible only to its members, so you can share freely with classmates.',
  },
  {
    icon: MessagesSquare,
    title: 'Connect with classmates',
    text: 'Follow students whose notes you like, leave comments and chat with your group before exams.',
  },
];

export default function HowItWorksPage() {
  const token = useSelector((state) => state.auth.token);

  return (
    <PageLayout>
      <PageHeader
        eyebrow="How it works"
        title="Everything you need to study smarter."
        text="Finding, sharing and discussing study materials on NoteHub is simple. Here's how to get the most out of it."
      >
        <Link to={token ? '/upload' : '/register'} className="btn-primary bg-white text-navy-700 hover:bg-navy-50">
          {token ? 'Upload a note' : 'Get started — it’s free'}
        </Link>
      </PageHeader>

      <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STEPS.map(({ icon: Icon, title, text }, i) => (
          <li key={title} className="card p-6 relative">
            <span className="absolute right-5 top-4 text-4xl font-extrabold text-gray-100 select-none" aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="w-10 h-10 rounded-xl bg-navy-50 text-navy-600 flex items-center justify-center">
              <Icon size={20} />
            </span>
            <h2 className="mt-4 text-base font-semibold text-gray-900">{title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-gray-600">{text}</p>
          </li>
        ))}
      </ol>

      <p className="mt-10 text-center text-sm text-gray-500">
        Still have questions?{' '}
        <Link to="/help" className="font-semibold text-navy-600 hover:underline">
          Visit the Help Center
        </Link>
      </p>
    </PageLayout>
  );
}
