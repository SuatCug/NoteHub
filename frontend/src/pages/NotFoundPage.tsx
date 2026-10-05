import { Link } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import EmptyState from '@/components/common/EmptyState';

export default function NotFoundPage() {
  return (
    <PageLayout narrow>
      <EmptyState
        title="Page not found"
        text="The page you are looking for may have moved or never existed."
        action={
          <Link to="/" className="btn-primary">
            Back to home
          </Link>
        }
      />
    </PageLayout>
  );
}
