import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { Button } from '../components/ui/button';
import { EmptyState } from '../components/ui/empty-state';
import usePageTitle from '../hooks/usePageTitle';

const NotFound = () => {
  usePageTitle('Page not found');
  return (
    <div className="page-container py-16 sm:py-24">
      <EmptyState
        icon={Compass}
        title="We couldn't find that page"
        description="The link may be out of date, or the page may have moved."
        action={
          <>
            <Button asChild size="lg"><Link to="/shop">Browse the shop</Link></Button>
            <Button asChild size="lg" variant="outline"><Link to="/">Go home</Link></Button>
          </>
        }
      />
    </div>
  );
};

export default NotFound;
