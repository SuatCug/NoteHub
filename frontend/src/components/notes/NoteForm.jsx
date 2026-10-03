import { useRef, useState } from 'react';
import { UploadCloud, X } from 'lucide-react';
import Alert from '@/components/common/Alert';
import { ACCEPTED_EXTENSIONS, MAX_FILE_SIZE_MB } from '@/lib/constants';
import { formatFileSize } from '@/lib/format';

const FIELDS = [
  { name: 'title', label: 'Title', required: true, placeholder: 'e.g. Midterm summary notes', span: 2 },
  { name: 'courseName', label: 'Course name', required: true, placeholder: 'e.g. Computer Programming I' },
  { name: 'courseCode', label: 'Course code', placeholder: 'e.g. CENG101' },
  { name: 'instructorName', label: 'Instructor', placeholder: 'e.g. Prof. Dr. Ahmet Yılmaz' },
  { name: 'semester', label: 'Semester', placeholder: 'e.g. 2024-2025 Fall' },
  { name: 'university', label: 'University', required: true },
  { name: 'department', label: 'Department', required: true },
];

const getExtension = (name) => name.slice(name.lastIndexOf('.')).toLowerCase();

// Not yükleme ve düzenleme formu. withFile=false ise (düzenleme) dosya alanı gösterilmez.
// groups verilirse (kullanıcının üyesi olduğu gruplar) not bir gruba da paylaşılabilir.
export default function NoteForm({ initialValues, withFile = true, groups, onSubmit, isLoading, submitLabel, error }) {
  const [values, setValues] = useState(() => ({
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
  }));
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleChange = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }));

  const pickFile = (picked) => {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (withFile && !file) {
      setFileError('Please choose a file to upload.');
      return;
    }
    const trimmed = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v.trim()]));
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

      {groups?.length > 0 && (
        <div>
          <label htmlFor="group" className="form-label">
            Where to share
          </label>
          <select id="group" name="group" value={values.group} onChange={handleChange} className="form-input">
            <option value="">Everyone (public)</option>
            {groups.map((g) => (
              <option key={g._id} value={g._id}>
                Group: {g.name}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-gray-500">
            {values.group
              ? "Only members of this group will see the note. It won't appear on the home page or your profile."
              : 'Everyone can see and download the note from the home page and your profile.'}
          </p>
        </div>
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
