import { Link, NavLink, useParams } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import NotFoundPage from './NotFoundPage';
import { formatDate } from '@/lib/format';

// Footer'daki yasal sayfalar. Metinler taslaktır; yayına almadan önce bir hukukçuya kontrol ettirilmelidir.
const LAST_UPDATED = '2026-09-30';

const LEGAL_DOCUMENTS = {
  terms: {
    title: 'Terms of Use',
    sections: [
      ['Using NoteHub', 'NoteHub lets university students share and download study materials for free. By creating an account you agree to use the platform for educational purposes only.'],
      ['Your content', 'You are responsible for everything you upload. Only share materials you created yourself or have the right to share. Do not upload exam answers that your instructor has asked to keep private, personal data of others, or harmful files.'],
      ['Study groups', 'Notes and messages shared in a group are visible only to its members. Group founders are responsible for moderating their groups and may remove members.'],
      ['Community rules', 'Be respectful in comments and group chats. Spam, harassment and hate speech are not allowed. We may remove content or suspend accounts that break our Community Guidelines.'],
      ['No warranty', 'Notes are shared by students and may contain mistakes. NoteHub does not guarantee the accuracy of any material.'],
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    sections: [
      ['What we collect', 'Your name, email address, university, department, optional bio and profile photo, the files you upload, your group memberships and messages, and your likes, comments and follows.'],
      ['How we use it', 'Only to run the platform: showing your profile and notes, letting others find your materials, and keeping your account secure. Passwords are stored as one-way hashes.'],
      ['What is public', 'Your name, university, department, bio, profile photo, publicly shared notes and comments are visible to other visitors. Group notes and chats are visible only to group members. Your email address is never shown publicly.'],
      ['Your choices', 'You can edit your profile at any time and delete the notes and comments you posted. To delete your account, contact us.'],
    ],
  },
  kvkk: {
    title: 'KVKK Notice',
    sections: [
      ['Scope', 'This notice explains how personal data is processed under the Turkish Personal Data Protection Law No. 6698 (KVKK).'],
      ['Data processed', 'Identity and contact data (name, email), education data (university, department) and user content (uploaded files, comments, group messages).'],
      ['Purpose and legal basis', 'Data is processed to provide the membership and note-sharing service, based on the performance of the service you signed up for.'],
      ['Your rights', 'Under Article 11 of KVKK you may ask whether your data is processed, request correction or deletion, and object to processing. Submit your request through the contact form using the "Privacy & KVKK request" topic.'],
    ],
  },
  copyright: {
    title: 'Copyright (DMCA)',
    sections: [
      ['Respecting copyright', 'Uploads must not infringe the rights of authors, publishers or instructors. Copyrighted textbooks and paid course materials should not be shared.'],
      ['Reporting a violation', 'If you believe a note infringes your copyright, contact us with the note link, a description of the original work and proof that you own the rights.'],
      ['What happens next', 'We review each report and remove infringing content. Accounts that repeatedly upload infringing material may be suspended.'],
    ],
  },
  cookies: {
    title: 'Cookie Policy',
    sections: [
      ['Our approach', 'NoteHub does not use advertising or third-party tracking cookies.'],
      ['What we store', 'To keep you signed in, your session token and basic profile information are stored in your browser’s local storage. This data never leaves your device except to authenticate your requests to NoteHub.'],
      ['Third parties', 'Fonts are loaded from Google Fonts, which may receive your IP address when the page loads.'],
      ['Clearing your data', 'Logging out removes the stored session. You can also clear site data at any time from your browser settings.'],
    ],
  },
};

export default function LegalPage() {
  const { slug } = useParams();
  const doc = LEGAL_DOCUMENTS[slug];
  if (!doc) return <NotFoundPage />;

  return (
    <PageLayout>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[220px_minmax(0,1fr)] items-start">
        <nav className="card p-2 min-w-0 lg:sticky lg:top-24" aria-label="Legal documents">
          <p className="px-3 pt-2 pb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">Legal</p>
          <ul className="flex lg:flex-col gap-1 overflow-x-auto">
            {Object.entries(LEGAL_DOCUMENTS).map(([key, { title }]) => (
              <li key={key} className="shrink-0">
                <NavLink
                  to={`/legal/${key}`}
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                      isActive ? 'bg-navy-50 text-navy-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  {title}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <article className="card p-6 sm:p-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{doc.title}</h1>
          <p className="mt-1 text-sm text-gray-400">Last updated: {formatDate(LAST_UPDATED)}</p>
          <div className="mt-8 space-y-6">
            {doc.sections.map(([heading, body], i) => (
              <section key={heading}>
                <h2 className="text-base font-semibold text-gray-900">
                  {i + 1}. {heading}
                </h2>
                <p className="mt-1.5 text-[15px] leading-relaxed text-gray-600">{body}</p>
              </section>
            ))}
          </div>
          <p className="mt-10 pt-6 border-t border-gray-100 text-sm text-gray-500">
            Questions about this document?{' '}
            <Link to="/contact" className="font-semibold text-navy-600 hover:underline">
              Contact us
            </Link>
            .
          </p>
        </article>
      </div>
    </PageLayout>
  );
}
