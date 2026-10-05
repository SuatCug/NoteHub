import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Globe, Lock } from 'lucide-react';
import Alert from '@/components/common/Alert';
import type { GroupInput } from '@/types/api';

interface GroupFormProps {
  initialValues?: Partial<GroupInput>;
  onSubmit: (values: GroupInput) => void;
  isLoading: boolean;
  submitLabel: string;
  error?: string;
}

const PRIVACY_OPTIONS = [
  { value: false, icon: Globe, title: 'Public', text: 'Anyone can join. Notes and chat are visible to members only.' },
  { value: true, icon: Lock, title: 'Private', text: 'You approve join requests. Even the member list is hidden from non-members.' },
];

// Grup kurma ve düzenleme formu.
export default function GroupForm({ initialValues, onSubmit, isLoading, submitLabel, error }: GroupFormProps) {
  const [values, setValues] = useState<GroupInput>(() => ({ name: '', description: '', isPrivate: false, ...initialValues }));

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }));

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit({ name: values.name.trim(), description: values.description.trim(), isPrivate: values.isPrivate });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="name" className="form-label">
          Group name
        </label>
        <input
          id="name"
          name="name"
          required
          maxLength={80}
          value={values.name}
          onChange={handleChange}
          placeholder="e.g. CENG101 Study Group"
          className="form-input"
        />
      </div>

      <div>
        <label htmlFor="description" className="form-label">
          Description <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          maxLength={1000}
          value={values.description}
          onChange={handleChange}
          placeholder="What is this group about? Who should join?"
          className="form-input resize-y"
        />
      </div>

      <fieldset>
        <legend className="form-label">Privacy</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {PRIVACY_OPTIONS.map(({ value, icon: Icon, title, text }) => {
            const selected = values.isPrivate === value;
            return (
              <label
                key={title}
                className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition-colors ${
                  selected ? 'border-navy-500 bg-navy-50/60 ring-1 ring-navy-500' : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="isPrivate"
                  checked={selected}
                  onChange={() => setValues((v) => ({ ...v, isPrivate: value }))}
                  className="sr-only"
                />
                <Icon size={18} className={selected ? 'text-navy-600 mt-0.5' : 'text-gray-400 mt-0.5'} />
                <span>
                  <span className="block text-sm font-semibold text-gray-900">{title}</span>
                  <span className="block text-xs text-gray-500 mt-0.5">{text}</span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <Alert>{error}</Alert>

      <button type="submit" disabled={isLoading} className="btn-primary w-full sm:w-auto">
        {isLoading ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
}
