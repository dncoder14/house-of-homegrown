import ProductCard from './ProductCard';
import { Skeleton } from './ui/skeleton';
import { cn } from '../lib/utils';

const gridClass = {
  3: 'grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3',
  4: 'grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4',
};

export const ProductGrid = ({ products, columns = 4, className }) => (
  <div className={cn(gridClass[columns], className)}>
    {products.map((product) => (
      <ProductCard key={product.id} product={product} />
    ))}
  </div>
);

export const ProductGridSkeleton = ({ count = 8, columns = 4, className }) => (
  <div className={cn(gridClass[columns], className)} role="status" aria-label="Loading products">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="overflow-hidden rounded-xl border border-border bg-card">
        <Skeleton className="aspect-[4/5] rounded-none" />
        <div className="space-y-2.5 p-4">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-5 w-1/4" />
        </div>
      </div>
    ))}
  </div>
);
