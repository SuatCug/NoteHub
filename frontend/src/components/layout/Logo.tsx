import { Link } from 'react-router-dom';
import { FileSearch } from 'lucide-react';

// light: koyu (renkli) arka plan üzerinde kullanım için beyaz varyant.
export default function Logo({ light = false }) {
  return (
    <Link to="/" className="flex items-center gap-2 min-w-0" aria-label="SearchNote home">
      <span
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
          light ? 'bg-white text-navy-800' : 'bg-navy-600 text-white'
        }`}
      >
        <FileSearch size={20} strokeWidth={2.25} />
      </span>
      <span className={`text-lg font-extrabold tracking-tight truncate ${light ? 'text-white' : 'text-gray-900'}`}>
        Search<span className={light ? 'text-sky-300' : 'text-navy-600'}>Note</span>
      </span>
    </Link>
  );
}
