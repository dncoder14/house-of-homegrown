import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Search, ChevronLeft, ChevronRight, X, PackageSearch, CloudOff } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input, Select, Label } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Breadcrumbs } from '../components/ui/breadcrumbs';
import { PageHeader } from '../components/ui/page-header';
import { EmptyState } from '../components/ui/empty-state';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetClose } from '../components/ui/sheet';
import { ProductGrid, ProductGridSkeleton } from '../components/ProductGrid';
import { productsAPI } from '../utils/api';
import usePageTitle from '../hooks/usePageTitle';

const ITEMS_PER_PAGE = 12;

const SORT_OPTIONS = [
  { value: '', label: 'Featured' },
  { value: 'newest', label: 'Newest first' },
  { value: 'price_low', label: 'Price: low to high' },
  { value: 'price_high', label: 'Price: high to low' },
];

const titleCase = (value) => value.charAt(0).toUpperCase() + value.slice(1);

const EMPTY_FILTERS = { search: '', category: '', sort: '', minPrice: '', maxPrice: '' };

const FilterPanel = ({ filters, setFilters, categories, applyFilters, idPrefix }) => (
  <div className="space-y-7">
    <form
      onSubmit={(e) => { e.preventDefault(); applyFilters({ search: filters.search }); }}
      role="search"
    >
      <Label htmlFor={`${idPrefix}-search`}>Search</Label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input
          id={`${idPrefix}-search`}
          type="search"
          placeholder="Search products"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="pl-10"
        />
      </div>
    </form>

    <fieldset>
      <legend className="mb-2 text-sm font-medium">Category</legend>
      <div className="flex flex-col gap-1">
        {[{ value: '', label: 'All categories' }, ...categories.map((c) => ({ value: c, label: titleCase(c) }))].map((option) => {
          const active = filters.category === option.value;
          return (
            <label
              key={option.value || 'all'}
              className={`flex min-h-[2.5rem] cursor-pointer items-center gap-3 rounded-lg px-3 text-sm transition-colors focus-within:ring-2 focus-within:ring-ring ${
                active ? 'bg-primary/10 font-semibold text-primary' : 'hover:bg-muted'
              }`}
            >
              <input
                type="radio"
                name={`${idPrefix}-category`}
                value={option.value}
                checked={active}
                onChange={() => applyFilters({ category: option.value })}
                className="h-4 w-4 accent-[hsl(var(--primary))]"
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>

    <form
      onSubmit={(e) => { e.preventDefault(); applyFilters({ minPrice: filters.minPrice, maxPrice: filters.maxPrice }); }}
    >
      <fieldset>
        <legend className="mb-2 text-sm font-medium">Price (₹)</legend>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            inputMode="numeric"
            min="0"
            placeholder="Min"
            aria-label="Minimum price"
            value={filters.minPrice}
            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
            className="num"
          />
          <span className="text-muted-foreground" aria-hidden="true">–</span>
          <Input
            type="number"
            inputMode="numeric"
            min="0"
            placeholder="Max"
            aria-label="Maximum price"
            value={filters.maxPrice}
            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
            className="num"
          />
        </div>
        <Button type="submit" variant="outline" size="sm" className="mt-3 w-full">Apply price</Button>
      </fieldset>
    </form>
  </div>
);

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  usePageTitle('Shop');

  const readParams = () => ({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    sort: searchParams.get('sort') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
  });

  const [filters, setFilters] = useState(readParams);
  const currentPage = Math.max(parseInt(searchParams.get('page') || '1', 10) || 1, 1);
  const totalPages = Math.max(Math.ceil(total / ITEMS_PER_PAGE), 1);

  useEffect(() => {
    productsAPI.getCategories()
      .then((response) => setCategories(response.data))
      .catch((error) => console.error('Error fetching categories:', error));
  }, []);

  useEffect(() => {
    const params = readParams();
    setFilters(params);

    let cancelled = false;
    setLoading(true);
    setLoadError('');
    productsAPI.getAll({ ...params, page: currentPage, limit: ITEMS_PER_PAGE })
      .then((response) => {
        if (cancelled) return;
        setProducts(response.data);
        setTotal(Number(response.headers['x-total-count']) || response.data.length);
      })
      .catch(() => {
        if (!cancelled) setLoadError('We could not load products. Please try again.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, reloadKey]);

  const applyFilters = (changes) => {
    const next = { ...filters, ...changes };
    setFilters(next);
    const params = new URLSearchParams();
    Object.entries(next).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setSearchParams({});
  };

  const goToPage = (page) => {
    const params = new URLSearchParams(searchParams);
    if (page > 1) params.set('page', String(page));
    else params.delete('page');
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // What is actually applied (from the URL), shown as removable chips
  const applied = readParams();
  const chips = [
    applied.search && { key: 'search', label: `“${applied.search}”` },
    applied.category && { key: 'category', label: titleCase(applied.category) },
    (applied.minPrice || applied.maxPrice) && {
      key: 'price',
      label: `₹${applied.minPrice || '0'} – ${applied.maxPrice ? `₹${applied.maxPrice}` : 'any'}`,
    },
  ].filter(Boolean);
  const removeChip = (key) => applyFilters(key === 'price' ? { minPrice: '', maxPrice: '' } : { [key]: '' });

  const panelProps = { filters, setFilters, categories, applyFilters };

  return (
    <div className="page-container py-8 sm:py-12">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Shop' }]} className="mb-6" />
      <PageHeader
        title={applied.search ? `Results for “${applied.search}”` : 'Shop'}
        description={applied.search ? undefined : 'Sustainable, handcrafted products from artisans across India.'}
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-[16rem_1fr] lg:gap-10">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-xl border border-border bg-card p-5 shadow-soft">
            <h2 className="mb-5 flex items-center gap-2 font-sans text-base font-semibold tracking-normal">
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" /> Filters
            </h2>
            <FilterPanel {...panelProps} idPrefix="desktop" />
          </div>
        </aside>

        <section aria-label="Products" className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <p className="num mr-auto text-sm text-muted-foreground" aria-live="polite">
              {loading ? 'Loading…' : `${total} ${total === 1 ? 'product' : 'products'}${totalPages > 1 ? ` · page ${currentPage} of ${totalPages}` : ''}`}
            </p>

            <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden">
                  <SlidersHorizontal className="h-4 w-4" /> Filters
                  {chips.length > 0 && <Badge variant="default" className="num ml-0.5 px-1.5">{chips.length}</Badge>}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[88%] max-w-sm overflow-y-auto p-0">
                <div className="border-b border-border px-5 py-4">
                  <SheetTitle>Filters</SheetTitle>
                </div>
                <div className="px-5 pb-28">
                  <FilterPanel {...panelProps} idPrefix="mobile" />
                </div>
                <div className="absolute inset-x-0 bottom-0 flex gap-3 border-t border-border bg-background p-4">
                  <Button variant="outline" className="flex-1" onClick={() => { clearFilters(); setFilterSheetOpen(false); }}>Clear all</Button>
                  <SheetClose asChild><Button className="flex-1">Show results</Button></SheetClose>
                </div>
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="sr-only sm:not-sr-only text-sm text-muted-foreground">Sort by</label>
              <Select
                id="sort"
                value={filters.sort}
                onChange={(e) => applyFilters({ sort: e.target.value })}
                className="h-9 w-auto min-w-[10.5rem] text-[0.8125rem]"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Select>
            </div>
          </div>

          {chips.length > 0 && (
            <div className="mb-5 flex flex-wrap items-center gap-2" aria-label="Active filters">
              {chips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => removeChip(chip.key)}
                  className="group flex h-8 items-center gap-1.5 rounded-full bg-primary/10 pl-3 pr-2 text-[0.8125rem] font-medium text-primary transition-colors hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={`Remove filter ${chip.label}`}
                >
                  {chip.label}
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              ))}
              <Button variant="link" size="sm" onClick={clearFilters} className="ml-1 h-8 text-[0.8125rem]">Clear all</Button>
            </div>
          )}

          {loading ? (
            <ProductGridSkeleton count={6} columns={3} />
          ) : loadError ? (
            <EmptyState
              icon={CloudOff}
              title="We couldn't load products"
              description={loadError}
              action={<Button onClick={() => setReloadKey((k) => k + 1)}>Try again</Button>}
            />
          ) : products.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title="No products match"
              description="Try removing a filter or searching for something broader."
              action={<Button variant="outline" onClick={clearFilters}>Clear filters</Button>}
            />
          ) : (
            <>
              <ProductGrid products={products} columns={3} />

              {totalPages > 1 && (
                <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-1.5">
                  <Button variant="outline" size="icon-sm" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} aria-label="Previous page">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    const near = page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                    if (near) {
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'ghost'}
                          size="icon-sm"
                          onClick={() => goToPage(page)}
                          aria-label={`Page ${page}`}
                          aria-current={currentPage === page ? 'page' : undefined}
                          className="num"
                        >
                          {page}
                        </Button>
                      );
                    }
                    if (Math.abs(page - currentPage) === 2) {
                      return <span key={page} className="px-1 text-muted-foreground" aria-hidden="true">…</span>;
                    }
                    return null;
                  })}
                  <Button variant="outline" size="icon-sm" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} aria-label="Next page">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </nav>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default Shop;
