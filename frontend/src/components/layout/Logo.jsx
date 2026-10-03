import { Link } from 'react-router-dom';
import { NotebookText } from 'lucide-react';

// light: koyu (renkli) arka plan üzerinde kullanım için beyaz varyant.
export default function Logo({ light = false }) {
  return (
    <Link to="/" className="flex items-center gap-2 min-w-0">
      <span
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white ${
          light ? 'bg-white/15' : 'bg-navy-600'
        }`}
      >
        <NotebookText size={20} />
      </span>
      <span className={`text-lg font-bold truncate ${light ? 'text-white' : 'text-gray-900'}`}>
        Note<span className={light ? 'text-navy-200' : 'text-navy-600'}>Hub</span>
      </span>
    </Link>
  );
}
