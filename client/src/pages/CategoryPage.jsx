import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { PackageSearch, CloudOff } from 'lucide-react';
import { ProductGrid, ProductGridSkeleton } from '../components/ProductGrid';
import { Button } from '../components/ui/button';
import { Breadcrumbs } from '../components/ui/breadcrumbs';
import { PageHeader } from '../components/ui/page-header';
import { EmptyState } from '../components/ui/empty-state';
import { productsAPI } from '../utils/api';
import usePageTitle from '../hooks/usePageTitle';

const SUBCATEGORIES = {
  clothing: [
    { name: 'Sarees', value: 'sarees' },
    { name: 'Kurtas', value: 'kurtas' },
    { name: 'Lehengas', value: 'lehengas' },
    { name: 'Fabrics', value: 'fabrics' },
  ],
  'indian-taste': [
    { name: 'Spices', value: 'spices' },
    { name: 'Tea', value: 'tea' },
    { name: 'Grains', value: 'grains' },
    { name: 'Pickles', value: 'pickles' },
    { name: 'Sweets', value: 'sweets' },
  ],
};

const CATEGORY_TITLES = {
  clothing: 'Clothing & Fashion',
  'indian-taste': 'Indian Taste',
  sarees: 'Sarees',
  kurtas: 'Kurtas',
  lehengas: 'Lehengas',
  jewelry: 'Jewelry',
  spices: 'Spices',
  tea: 'Tea',
  pottery: 'Pottery',
  textiles: 'Textiles',
};

const CategoryPage = () => {
  const { category } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const selectedSubcategory = searchParams.get('subcategory') || '';
  const subcategories = SUBCATEGORIES[category] || [];
  const categoryTitle = CATEGORY_TITLES[category] || category.charAt(0).toUpperCase() + category.slice(1);
  const activeSub = subcategories.find((s) => s.value === selectedSubcategory);
  const pageTitle = activeSub?.name || categoryTitle;
  usePageTitle(pageTitle);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    let params;
    if (selectedSubcategory) params = { subcategory: selectedSubcategory };
    else if (category === 'clothing') params = { category: 'clothing' };
    else if (category === 'indian-taste') params = { category: 'home' };
    else params = { subcategory: category };

    productsAPI.getAll(params)
      .then((response) => { if (!cancelled) setProducts(response.data); })
      .catch(() => { if (!cancelled) setError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [category, selectedSubcategory, reloadKey]);

  const toggleSubcategory = (value) => {
    setSearchParams(selectedSubcategory === value ? {} : { subcategory: value });
  };

  const crumbs = [{ label: 'Home', to: '/' }, { label: 'Categories', to: '/categories' }];
  if (activeSub) {
    crumbs.push({ label: categoryTitle, to: `/category/${category}` }, { label: activeSub.name });
  } else {
    crumbs.push({ label: categoryTitle });
  }

  return (
    <div className="page-container py-8 sm:py-12">
      <Breadcrumbs items={crumbs} className="mb-6" />
      <PageHeader
        title={pageTitle}
        description={loading ? 'Discover authentic Indian products' : `${products.length} ${products.length === 1 ? 'product' : 'products'} to explore`}
      />

      {subcategories.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Filter by type">
          {subcategories.map((sub) => {
            const active = selectedSubcategory === sub.value;
            return (
              <button
                key={sub.value}
                type="button"
                onClick={() => toggleSubcategory(sub.value)}
                aria-pressed={active}
                className={`h-10 rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                  active
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-surface text-foreground hover:border-primary/40 hover:bg-muted'
                }`}
              >
                {sub.name}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-8">
        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : error ? (
          <EmptyState
            icon={CloudOff}
            title="We couldn't load these products"
            description="Check your connection and try again."
            action={<Button onClick={() => setReloadKey((k) => k + 1)}>Try again</Button>}
          />
        ) : products.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title="Nothing here yet"
            description="We're adding new pieces all the time. Browse the full collection in the meantime."
            action={<Button asChild><Link to="/shop">Browse all products</Link></Button>}
          />
        ) : (
          <ProductGrid products={products} />
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
