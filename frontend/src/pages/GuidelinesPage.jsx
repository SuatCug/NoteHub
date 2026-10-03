import { Link } from 'react-router-dom';
import { CheckCircle2, XCircle } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import PageHeader from '@/components/layout/PageHeader';

const DO = [
  'Share notes, summaries and solutions you prepared yourself.',
  'Fill in the course code, instructor and semester so others can find your note.',
  'Give constructive feedback in comments and thank people for their work.',
  'Keep group chats focused, friendly and on topic.',
  'Report content that breaks the rules instead of arguing about it.',
];

const DONT = [
  'Upload copyrighted textbooks, paid course packs or publisher slides.',
  'Share exam questions your instructor explicitly asked to keep private.',
  'Post other people’s personal information, photos or contact details.',
  'Spam, advertise, harass others or use hate speech.',
  'Upload files that contain malware or are not what their title says.',
];

const ENFORCEMENT = [
  ['Content removal', 'Notes, comments or messages that break these guidelines are removed.'],
  ['Warnings', 'For a first or minor violation we may contact you with a warning.'],
  ['Account suspension', 'Repeated or serious violations may lead to a temporary or permanent suspension.'],
];

export default function GuidelinesPage() {
  return (
    <PageLayout>
      <PageHeader
        eyebrow="Community Guidelines"
        title="A helpful, respectful place to learn."
        text="SearchNote works because students trust each other's work. These guidelines keep the community useful and safe for everyone."
      />

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <GuidelineList title="Do" items={DO} icon={CheckCircle2} tone="text-emerald-600" />
        <GuidelineList title="Don't" items={DONT} icon={XCircle} tone="text-rose-500" />
      </div>

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 text-center">How we enforce the rules</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {ENFORCEMENT.map(([title, text], i) => (
            <div key={title} className="card p-5">
              <span className="text-xs font-bold text-navy-600">STEP {i + 1}</span>
              <h3 className="mt-1 text-base font-semibold text-gray-900">{title}</h3>
              <p className="mt-1 text-sm text-gray-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="mt-10 text-sm text-gray-500 text-center">
        See something that breaks the rules?{' '}
        <Link to="/contact" className="font-semibold text-navy-600 hover:underline">
          Let us know
        </Link>
        . Read our{' '}
        <Link to="/legal/terms" className="font-semibold text-navy-600 hover:underline">
          Terms of Use
        </Link>{' '}
        for the full rules.
      </p>
    </PageLayout>
  );
}

function GuidelineList({ title, items, icon: Icon, tone }) {
  return (
    <section className="card p-6">
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-relaxed text-gray-700">
            <Icon size={18} className={`shrink-0 mt-0.5 ${tone}`} />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
