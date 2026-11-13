import { Breadcrumbs } from './ui/breadcrumbs';
import { PageHeader } from './ui/page-header';
import { cn } from '../lib/utils';

/** Shared shell for static/informational pages. */
const ContentPage = ({ title, description, crumb, width = 'max-w-4xl', children, className }) => (
  <div className="page-container py-8 sm:py-12">
    <div className={cn('mx-auto', width, className)}>
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: crumb || title }]} className="mb-6" />
      <PageHeader title={title} description={description} />
      <div className="mt-10">{children}</div>
    </div>
  </div>
);

export default ContentPage;
