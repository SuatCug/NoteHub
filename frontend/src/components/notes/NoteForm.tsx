import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Globe, UploadCloud, UserCheck, Users, X, type LucideIcon } from 'lucide-react';
import Alert from '@/components/common/Alert';
import { ACCEPTED_EXTENSIONS, MAX_FILE_SIZE_MB } from '@/lib/constants';
import { formatFileSize } from '@/lib/format';
import type { NoteInput } from '@/types/api';

const FIELDS: { name: keyof NoteInput; label: string; required?: boolean; placeholder?: string; span?: number }[] = [
  { name: 'title', label: 'Title', required: true, placeholder: 'e.g. Midterm summary notes', span: 2 },
  { name: 'courseName', label: 'Course name', required: true, placeholder: 'e.g. Computer Programming I' },
  { name: 'courseCode', label: 'Course code', placeholder: 'e.g. CENG101' },
  { name: 'instructorName', label: 'Instructor', placeholder: 'e.g. Prof. Dr. Ahmet Yılmaz' },
  { name: 'semester', label: 'Semester', placeholder: 'e.g. 2024-2025 Fall' },
  { name: 'university', label: 'University', required: true },
  { name: 'department', label: 'Department', required: true },
];

const getExtension = (name: string) => name.slice(name.lastIndexOf('.')).toLowerCase();

// Notu kimlerin görebileceği: herkes, sadece takipçiler ya da (yüklerken) bir çalışma grubunun üyeleri.
type Audience = 'public' | 'followers' | 'group';

const VISIBILITY_OPTIONS: { value: Audience; icon: LucideIcon; title: string; text: string }[] = [
  { value: 'public', icon: Globe, title: 'Everyone', text: 'Shown in feeds, search and on your profile.' },
  { value: 'followers', icon: UserCheck, title: 'Followers only', text: 'Only people who follow you can see and download it.' },
  { value: 'group', icon: Users, title: 'A study group', text: "Only the group's members. Not shown on your profile." },
];

interface NoteFormProps {
  initialValues?: Partial<NoteInput>;
  withFile?: boolean;
  groups?: { _id: string; name: string }[];
  allowVisibility?: boolean;
  onSubmit: (values: NoteInput, file: File | null) => void;
  isLoading: boolean;
  submitLabel: string;
  error?: string;
}

// Not yükleme ve düzenleme formu. withFile=false ise (düzenleme) dosya alanı gösterilmez.
// groups verilirse (kullanıcının üyesi olduğu gruplar) not bir gruba da paylaşılabilir.
// allowVisibility=false: görünürlük seçimi gösterilmez (örn. gruba paylaşılmış notu düzenlerken).
export default function NoteForm({
  initialValues,
  withFile = true,
  groups,
  allowVisibility = true,
  onSubmit,
  isLoading,
  submitLabel,
  error,
}: NoteFormProps) {
  const [values, setValues] = useState<NoteInput>(() => ({
    title: '',
    description: '',
    courseName: '',
    courseCode: '',
    instructorName: '',
    semester: '',
    university: '',
    department: '',
    group: '',
    ...initialValues,
    // Eski notlarda alan yok: varsayılan herkese açık.
    visibility: initialValues?.visibility || 'public',
  }));
  // Seçili kitle: grup seçiliyse "group", değilse notun görünürlüğü.
  const audience: Audience = values.group ? 'group' : values.visibility || 'public';
  const setAudience = (next: Audience) =>
    setValues((v) => ({
      ...v,
      visibility: next === 'followers' ? 'followers' : 'public',
      group: next === 'group' ? v.group || groups?.[0]?._id || '' : '',
    }));
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }));

  const pickFile = (picked: File | null | undefined) => {
    setFileError('');
    if (!picked) return;
    if (!ACCEPTED_EXTENSIONS.includes(getExtension(picked.name))) {
      setFileError('Unsupported file type. You can upload PDF, DOCX, JPG, PNG, ZIP or RAR.');
      return;
    }
    if (picked.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setFileError(`The file can be at most ${MAX_FILE_SIZE_MB} MB.`);
      return;
    }
    setFile(picked);
    // Başlık boşsa dosya adından öner.
    setValues((v) => (v.title ? v : { ...v, title: picked.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ') }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (withFile && !file) {
      setFileError('Please choose a file to upload.');
      return;
    }
    const trimmed = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v.trim()])) as NoteInput;
    onSubmit(trimmed, file);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {withFile && (
        <div>
          <span className="form-label">File</span>
          {file ? (
            <div className="flex items-center gap-3 rounded-xl border border-navy-100 bg-navy-50/50 px-4 py-3">
              <UploadCloud size={20} className="text-navy-500 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="p-1.5 rounded-md text-gray-400 hover:text-rose-500 hover:bg-white"
                aria-label="Remove file"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                pickFile(e.dataTransfer.files?.[0]);
              }}
              className={`w-full rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
                dragging ? 'border-navy-400 bg-navy-50' : 'border-gray-200 hover:border-navy-300 hover:bg-gray-50'
              }`}
            >
              <UploadCloud size={28} className="mx-auto text-navy-500" />
              <p className="mt-2 text-sm font-semibold text-gray-800">Drag & drop a file or click to browse</p>
              <p className="mt-1 text-xs text-gray-500">
                PDF, DOCX, JPG, PNG, ZIP, RAR · up to {MAX_FILE_SIZE_MB} MB
              </p>
            </button>
          )}
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_EXTENSIONS.join(',')}
            className="hidden"
            onChange={(e) => {
              pickFile(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
          <Alert className="mt-2">{fileError}</Alert>
        </div>
      )}

      {allowVisibility && (
        <fieldset>
          <legend className="form-label">Who can see this note?</legend>
          <div className={`grid gap-2 ${groups?.length ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
            {VISIBILITY_OPTIONS.filter((o) => o.value !== 'group' || groups?.length).map(({ value, icon: Icon, title, text }) => {
              const active = audience === value;
              return (
                <label
                  key={value}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${
                    active ? 'border-navy-500 bg-navy-50/60 ring-1 ring-navy-500' : 'border-gray-200 hover:border-navy-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="audience"
                    value={value}
                    checked={active}
                    onChange={() => setAudience(value)}
                    className="sr-only"
                  />
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      active ? 'bg-navy-600 text-white' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    <Icon size={18} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-gray-900">{title}</span>
                    <span className="block text-xs leading-snug text-gray-500">{text}</span>
                  </span>
                </label>
              );
            })}
          </div>

          {audience === 'group' && (
            <select
              id="group"
              name="group"
              aria-label="Group"
              value={values.group}
              onChange={handleChange}
              className="form-input mt-3"
            >
              {groups?.map((g) => (
                <option key={g._id} value={g._id}>
                  {g.name}
                </option>
              ))}
            </select>
          )}
        </fieldset>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {FIELDS.map((f) => (
          <div key={f.name} className={f.span === 2 ? 'sm:col-span-2' : ''}>
            <label htmlFor={f.name} className="form-label">
              {f.label} {!f.required && <span className="text-gray-400 font-normal">(optional)</span>}
            </label>
            <input
              id={f.name}
              name={f.name}
              required={f.required}
              value={values[f.name]}
              onChange={handleChange}
              placeholder={f.placeholder}
              className="form-input"
            />
          </div>
        ))}

        <div className="sm:col-span-2">
          <label htmlFor="description" className="form-label">
            Description <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            maxLength={2000}
            value={values.description}
            onChange={handleChange}
            placeholder="Describe which topics the note covers and how it was prepared."
            className="form-input resize-y"
          />
        </div>
      </div>

      <Alert>{error}</Alert>

      <button type="submit" disabled={isLoading} className="btn-primary w-full sm:w-auto">
        {isLoading ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
}
