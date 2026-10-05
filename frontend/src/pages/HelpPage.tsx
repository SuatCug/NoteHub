import { Link } from 'react-router-dom';
import { ChevronDown, LifeBuoy } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import PageHeader from '@/components/layout/PageHeader';
import { MAX_FILE_SIZE_MB } from '@/lib/constants';

const FAQ = [
  {
    category: 'Getting started',
    items: [
      ['Is SearchNote really free?', 'Yes. Browsing, previewing, downloading and sharing notes is completely free. There are no credits, subscriptions or download limits.'],
      ['Do I need an account?', 'You can browse and search notes without an account. To preview, download, like, comment, follow students or join groups, you need to log in.'],
      ['How do I change my profile?', 'Open the account menu in the top right corner and choose "Account Settings". There you can update your name, university, department, bio, profile photo and password.'],
    ],
  },
  {
    category: 'Sharing notes',
    items: [
      ['Which file types can I upload?', `PDF, Word (DOCX), JPG, PNG, ZIP and RAR files up to ${MAX_FILE_SIZE_MB} MB each.`],
      ['Who can see the notes I share?', 'Notes you share publicly appear on the home page, in search results and on your profile, and everyone can see them. Notes you share in a group are visible only to that group’s members.'],
      ['Can I edit or delete a note?', 'Yes. Open the note and use the Edit or Delete buttons. The file itself cannot be replaced — upload a new note to share a different file.'],
      ['What should I not upload?', 'Copyrighted textbooks, paid course materials, other people’s personal data or anything your instructor asked to keep private. See the Community Guidelines for details.'],
    ],
  },
  {
    category: 'Study groups',
    items: [
      ['What is the difference between public and private groups?', 'Anyone can join a public group instantly. Private groups require the founder’s approval, and their member list is hidden from non-members. In both, notes and chat are visible to members only.'],
      ['What can a group founder do?', 'The founder can edit or delete the group, approve join requests, remove members and hand the founder role over to another member.'],
      ['Can the founder leave the group?', 'Not directly. The founder first needs to transfer the founder role to another member or delete the group.'],
    ],
  },
  {
    category: 'Account & safety',
    items: [
      ['How do I report a note or comment?', 'Use the contact form and choose the topic that fits (for example "Copyright"). Include the link to the note so we can review it quickly.'],
      ['I forgot my password. What can I do?', 'Contact us from the email address you registered with and we’ll help you regain access to your account.'],
    ],
  },
];

export default function HelpPage() {
  return (
    <PageLayout>
      <PageHeader
        eyebrow="Help Center"
        title="How can we help?"
        text="Answers to the most common questions about using SearchNote. Can't find what you're looking for? Our team is happy to help."
      />

      <div className="mt-10 grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)] items-start">
        <nav className="hidden lg:block sticky top-24" aria-label="Help topics">
          <ul className="space-y-1">
            {FAQ.map(({ category }) => (
              <li key={category}>
                <a
                  href={`#${slugify(category)}`}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-white hover:text-navy-700"
                >
                  {category}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-10">
          {FAQ.map(({ category, items }) => (
            <section key={category} id={slugify(category)} className="scroll-mt-24">
              <h2 className="text-lg font-bold text-gray-900">{category}</h2>
              <div className="mt-3 card divide-y divide-gray-100">
                {items.map(([question, answer]) => (
                  <details key={question} className="group px-5 py-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-semibold text-gray-900 [&::-webkit-details-marker]:hidden">
                      {question}
                      <ChevronDown size={18} className="shrink-0 text-gray-400 transition-transform group-open:rotate-180" />
                    </summary>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">{answer}</p>
                  </details>
                ))}
              </div>
            </section>
          ))}

          <section className="card p-6 flex flex-col sm:flex-row sm:items-center gap-4">
            <span className="w-11 h-11 rounded-xl bg-navy-50 text-navy-600 flex items-center justify-center shrink-0">
              <LifeBuoy size={20} />
            </span>
            <div className="flex-1">
              <h2 className="text-base font-semibold text-gray-900">Still need help?</h2>
              <p className="text-sm text-gray-600">Send us a message and we&apos;ll get back to you as soon as possible.</p>
            </div>
            <Link to="/contact" className="btn-primary shrink-0">
              Contact support
            </Link>
          </section>
        </div>
      </div>
    </PageLayout>
  );
}

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
