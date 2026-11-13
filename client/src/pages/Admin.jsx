import { useState, useEffect, useCallback, Fragment } from 'react';
import { Plus, Pencil, Trash2, Search, ChevronDown, ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/button';
import { Input, Textarea, Select, Field } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Price } from '../components/ui/price';
import { StatusBadge } from '../components/ui/status-badge';
import { PageHeader } from '../components/ui/page-header';
import { EmptyState } from '../components/ui/empty-state';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { ConfirmDialog } from '../components/ui/confirm-dialog';
import { productsAPI, adminAPI, getErrorMessage } from '../utils/api';
import usePageTitle from '../hooks/usePageTitle';

const SUBCATEGORIES = {
  clothing: ['sarees', 'kurtas', 'lehengas', 'fabrics'],
  home: ['spices', 'tea', 'grains', 'pickles', 'sweets', 'dryfruits', 'honey', 'oils', 'pottery', 'textiles', 'kitchenware', 'furniture', 'decor', 'lighting', 'storage', 'carpets'],
  accessories: ['jewelry', 'bags', 'footwear'],
};

const CATEGORY_LABELS = { clothing: 'Clothing', home: 'Home & Food', accessories: 'Accessories' };

const NEXT_STATUSES = {
  Placed: ['Processing', 'Cancelled'],
  Processing: ['Shipped', 'Cancelled'],
  Shipped: ['Delivered'],
  Delivered: [],
  Cancelled: [],
};

const ORDER_FILTERS = ['', 'Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const PAGE_SIZE = 20;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const LOW_STOCK = 5;

const emptyProduct = () => ({
  title: '', price: '', category: 'clothing', subcategory: '', description: '', stock: '', gender: '',
  sizes: [{ size: '', stock: '' }], images: [],
});

const titleCase = (value) => value.charAt(0).toUpperCase() + value.slice(1);
const formatDateTime = (value) =>
  new Date(value).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

const Pager = ({ page, total, onChange }) => {
  const pages = Math.max(Math.ceil(total / PAGE_SIZE), 1);
  if (pages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-muted-foreground">
      <span className="num">Page {page} of {pages}</span>
      <div className="flex gap-2">
        <Button variant="outline" size="icon-sm" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></Button>
        <Button variant="outline" size="icon-sm" disabled={page >= pages} onClick={() => onChange(page + 1)} aria-label="Next page"><ChevronRight className="h-4 w-4" /></Button>
      </div>
    </nav>
  );
};

const TableSkeleton = ({ rows = 6 }) => (
  <div className="divide-y divide-border" role="status" aria-label="Loading">
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4">
        <Skeleton className="h-12 w-12 shrink-0" />
        <div className="flex-1 space-y-2"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-3 w-1/4" /></div>
      </div>
    ))}
  </div>
);

const ProductForm = ({ mode, initial, onClose, onSaved }) => {
  const [data, setData] = useState(initial);
  const [saving, setSaving] = useState(false);
  const isEdit = mode === 'edit';
  const isClothing = data.category === 'clothing';

  const subcategoryOptions = [...SUBCATEGORIES[data.category]];
  if (data.subcategory && !subcategoryOptions.includes(data.subcategory)) subcategoryOptions.push(data.subcategory);

  const set = (patch) => setData((prev) => ({ ...prev, ...patch }));
  const updateSize = (index, field, value) =>
    set({ sizes: data.sizes.map((entry, i) => (i === index ? { ...entry, [field]: value } : entry)) });

  const onFiles = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 4) { toast.error('You can upload at most 4 images'); e.target.value = ''; return; }
    if (files.some((file) => file.size > MAX_IMAGE_BYTES)) { toast.error('Each image must be 5MB or smaller'); e.target.value = ''; return; }
    set({ images: files });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!isEdit && data.images.length === 0) { toast.error('At least 1 image is required'); return; }

    const form = new FormData();
    form.append('title', data.title);
    form.append('price', data.price);
    form.append('subcategory', data.subcategory);
    form.append('description', data.description);
    if (!isEdit) form.append('category', data.category);
    if (isClothing) {
      form.append('gender', data.gender);
      form.append('sizes', JSON.stringify(data.sizes));
    } else {
      form.append('stock', data.stock);
    }
    data.images.forEach((file) => form.append('images', file));

    setSaving(true);
    try {
      if (isEdit) await adminAPI.updateProduct(initial._id, form);
      else await adminAPI.createProduct(form);
      toast.success(isEdit ? 'Product updated' : 'Product added');
      onSaved();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to save product'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && !saving && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
        <DialogTitle className="text-xl">{isEdit ? 'Edit product' : 'Add product'}</DialogTitle>
        <DialogDescription>{isEdit ? 'Changes go live on the storefront immediately.' : 'New products appear on the storefront as soon as they are saved.'}</DialogDescription>
        <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Title" htmlFor="f-title" required className="sm:col-span-2">
            <Input id="f-title" value={data.title} onChange={(e) => set({ title: e.target.value })} required maxLength={200} />
          </Field>
          <Field label="Price (₹)" htmlFor="f-price" required>
            <Input id="f-price" type="number" min="0" step="0.01" value={data.price} onChange={(e) => set({ price: e.target.value })} required className="num" />
          </Field>
          <Field label="Category" htmlFor="f-cat" hint={isEdit ? 'Category cannot be changed after creation.' : undefined}>
            <Select
              id="f-cat"
              value={data.category}
              disabled={isEdit}
              onChange={(e) => set({ category: e.target.value, subcategory: '', gender: '', sizes: [{ size: '', stock: '' }], stock: '' })}
            >
              {Object.keys(SUBCATEGORIES).map((key) => <option key={key} value={key}>{CATEGORY_LABELS[key]}</option>)}
            </Select>
          </Field>
          <Field label="Subcategory" htmlFor="f-sub" required>
            <Select id="f-sub" value={data.subcategory} onChange={(e) => set({ subcategory: e.target.value })} required>
              <option value="">Select…</option>
              {subcategoryOptions.map((sub) => <option key={sub} value={sub}>{titleCase(sub)}</option>)}
            </Select>
          </Field>
          {isClothing ? (
            <Field label="Gender" htmlFor="f-gender" required>
              <Select id="f-gender" value={data.gender} onChange={(e) => set({ gender: e.target.value })} required>
                <option value="">Select…</option>
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="kids">Kids</option>
                <option value="unisex">Unisex</option>
              </Select>
            </Field>
          ) : (
            <Field label="Stock" htmlFor="f-stock" required>
              <Input id="f-stock" type="number" min="0" step="1" value={data.stock} onChange={(e) => set({ stock: e.target.value })} required className="num" />
            </Field>
          )}

          {isClothing && (
            <fieldset className="sm:col-span-2">
              <legend className="mb-1.5 text-sm font-medium">Sizes and stock</legend>
              <div className="space-y-2">
                {data.sizes.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input aria-label={`Size ${index + 1}`} placeholder="Size (S, M, L, Free)" value={entry.size} onChange={(e) => updateSize(index, 'size', e.target.value)} required />
                    <Input aria-label={`Stock for size ${index + 1}`} type="number" min="0" step="1" placeholder="Stock" value={entry.stock} onChange={(e) => updateSize(index, 'stock', e.target.value)} required className="num w-28 shrink-0" />
                    <Button type="button" variant="ghost" size="icon" disabled={data.sizes.length === 1} onClick={() => set({ sizes: data.sizes.filter((_, i) => i !== index) })} aria-label={`Remove size ${index + 1}`}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => set({ sizes: [...data.sizes, { size: '', stock: '' }] })}>
                <Plus className="h-4 w-4" /> Add size
              </Button>
            </fieldset>
          )}

          <Field label="Description" htmlFor="f-desc" required className="sm:col-span-2">
            <Textarea id="f-desc" value={data.description} onChange={(e) => set({ description: e.target.value })} required rows={4} />
          </Field>
          <Field
            label="Images"
            htmlFor="f-img"
            className="sm:col-span-2"
            hint={`1 to 4 images, up to 5MB each${isEdit ? '. Leave empty to keep the current images.' : '.'}`}
          >
            <input
              id="f-img"
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={onFiles}
              className="block w-full cursor-pointer rounded-lg border border-input bg-surface text-sm text-muted-foreground file:mr-4 file:cursor-pointer file:border-0 file:bg-secondary file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-secondary-foreground hover:file:bg-secondary/70"
            />
          </Field>

          <div className="flex justify-end gap-2 border-t border-border pt-5 sm:col-span-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button type="submit" loading={saving}>{isEdit ? 'Save changes' : 'Add product'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const ProductsTab = () => {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await productsAPI.getAll({ page, limit: PAGE_SIZE, search: query || undefined });
      setProducts(response.data);
      setTotal(Number(response.headers['x-total-count']) || response.data.length);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to fetch products'));
    } finally {
      setLoading(false);
    }
  }, [page, query]);

  useEffect(() => { load(); }, [load]);

  const openEdit = (product) => setForm({
    mode: 'edit',
    initial: {
      _id: product._id, title: product.title, price: product.price, category: product.category, subcategory: product.subcategory,
      description: product.description, stock: product.stock ?? '', gender: product.gender || '',
      sizes: product.sizes?.length ? product.sizes.map(({ size, stock }) => ({ size, stock })) : [{ size: '', stock: '' }],
      images: [],
    },
  });

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await adminAPI.deleteProduct(deleteTarget._id);
      toast.success('Product deleted');
      setDeleteTarget(null);
      load();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to delete product'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={(e) => { e.preventDefault(); setPage(1); setQuery(search.trim()); }} role="search" className="relative w-full sm:max-w-sm">
          <label htmlFor="admin-search" className="sr-only">Search products</label>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input id="admin-search" type="search" placeholder="Search products" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </form>
        <Button onClick={() => setForm({ mode: 'add', initial: emptyProduct() })}><Plus className="h-4 w-4" /> Add product</Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-soft">
        {loading ? (
          <TableSkeleton />
        ) : products.length === 0 ? (
          <EmptyState title={query ? 'No products match your search' : 'No products yet'} description={query ? 'Try a different keyword.' : 'Add your first product to start selling.'} className="py-12" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] text-sm">
              <caption className="sr-only">Products</caption>
              <thead className="border-b border-border bg-muted/50 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3">Product</th>
                  <th scope="col" className="hidden px-4 py-3 md:table-cell">Category</th>
                  <th scope="col" className="px-4 py-3 text-right">Price</th>
                  <th scope="col" className="px-4 py-3 text-right">Stock</th>
                  <th scope="col" className="w-28 px-4 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((product) => {
                  const image = product.imageUrl || product.images?.[0]?.url;
                  const stock = product.totalStock;
                  return (
                    <tr key={product._id} className="transition-colors hover:bg-muted/40">
                      <td className="px-4 py-3">
                        <div className="flex min-w-0 items-center gap-3">
                          {image ? (
                            <img src={image} alt="" className="h-12 w-12 shrink-0 rounded-lg bg-muted object-cover" />
                          ) : (
                            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"><ImageOff className="h-4 w-4" /></span>
                          )}
                          <span className="line-clamp-2 font-medium">{product.title}</span>
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                        {CATEGORY_LABELS[product.category]} <span aria-hidden="true">/</span> <span className="capitalize">{product.subcategory}</span>
                      </td>
                      <td className="px-4 py-3 text-right"><Price value={product.price} className="font-medium" /></td>
                      <td className="px-4 py-3 text-right">
                        {stock === 0 ? <Badge variant="destructive">Out of stock</Badge>
                          : stock <= LOW_STOCK ? <Badge variant="warning" className="num">{stock} left</Badge>
                          : <span className="num">{stock}</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon-sm" aria-label={`Edit ${product.title}`} onClick={() => openEdit(product)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon-sm" aria-label={`Delete ${product.title}`} onClick={() => setDeleteTarget(product)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <Pager page={page} total={total} onChange={setPage} />
      </div>

      {form && <ProductForm mode={form.mode} initial={form.initial} onClose={() => setForm(null)} onSaved={() => { setForm(null); load(); }} />}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this product?"
        description={deleteTarget ? `"${deleteTarget.title}" will be removed from the storefront. This can't be undone.` : ''}
        confirmLabel="Delete product"
        cancelLabel="Keep product"
        destructive
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </>
  );
};

const OrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getOrders({ page, limit: PAGE_SIZE, status: status || undefined });
      setOrders(response.data);
      setTotal(Number(response.headers['x-total-count']) || response.data.length);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to fetch orders'));
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => { load(); }, [load]);

  const changeStatus = async (order, next) => {
    setBusy(true);
    try {
      const response = await adminAPI.updateOrderStatus(order._id, next);
      setOrders((prev) => prev.map((o) => (o._id === order._id ? response.data : o)));
      toast.success(`Order marked ${next}`);
      setCancelTarget(null);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update order'));
      load();
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="num text-sm text-muted-foreground">{total} {total === 1 ? 'order' : 'orders'}</p>
        <div className="flex items-center gap-2">
          <label htmlFor="order-status" className="sr-only sm:not-sr-only text-sm text-muted-foreground">Status</label>
          <Select id="order-status" value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }} className="h-9 w-auto min-w-[10rem] text-[0.8125rem]">
            {ORDER_FILTERS.map((s) => <option key={s} value={s}>{s || 'All statuses'}</option>)}
          </Select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-soft">
        {loading ? (
          <TableSkeleton rows={5} />
        ) : orders.length === 0 ? (
          <EmptyState title="No orders found" description={status ? `There are no ${status.toLowerCase()} orders.` : 'Orders will appear here as customers place them.'} className="py-12" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[46rem] text-sm">
              <caption className="sr-only">Orders</caption>
              <thead className="border-b border-border bg-muted/50 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th scope="col" className="w-10 px-2 py-3"><span className="sr-only">Details</span></th>
                  <th scope="col" className="px-2 py-3">Order</th>
                  <th scope="col" className="px-4 py-3">Customer</th>
                  <th scope="col" className="px-4 py-3 text-right">Total</th>
                  <th scope="col" className="px-4 py-3">Status</th>
                  <th scope="col" className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const open = expanded === order._id;
                  const address = order.shippingAddress;
                  return (
                    <Fragment key={order._id}>
                      <tr className="border-b border-border transition-colors hover:bg-muted/40">
                        <td className="px-2 py-3">
                          <Button variant="ghost" size="icon-sm" onClick={() => setExpanded(open ? null : order._id)} aria-expanded={open} aria-label={`${open ? 'Hide' : 'Show'} details for order ${order._id.slice(-8)}`}>
                            <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
                          </Button>
                        </td>
                        <td className="px-2 py-3">
                          <p className="num font-semibold">#{order._id.slice(-8).toUpperCase()}</p>
                          <p className="num text-xs text-muted-foreground">{formatDateTime(order.createdAt)}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium">{order.userId?.name || 'Deleted user'}</p>
                          <p className="text-xs text-muted-foreground">{order.userId?.email || 'n/a'}</p>
                        </td>
                        <td className="px-4 py-3 text-right"><Price value={order.totalAmount} /></td>
                        <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap justify-end gap-2">
                            {NEXT_STATUSES[order.status].map((next) => (
                              <Button
                                key={next}
                                size="sm"
                                variant={next === 'Cancelled' ? 'ghost' : 'outline'}
                                className={next === 'Cancelled' ? 'text-destructive hover:bg-destructive-soft' : ''}
                                onClick={() => (next === 'Cancelled' ? setCancelTarget(order) : changeStatus(order, next))}
                                disabled={busy}
                              >
                                {next === 'Cancelled' ? 'Cancel' : `Mark ${next.toLowerCase()}`}
                              </Button>
                            ))}
                          </div>
                        </td>
                      </tr>
                      {open && (
                        <tr className="border-b border-border bg-muted/30">
                          <td />
                          <td colSpan={5} className="px-2 py-4">
                            <div className="grid gap-6 text-sm md:grid-cols-2">
                              <div>
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Items</p>
                                <ul className="space-y-1.5">
                                  {order.items.map((item, i) => (
                                    <li key={i} className="num flex justify-between gap-4">
                                      <span>{item.quantity} × {item.title}{item.size ? ` (${item.size})` : ''}</span>
                                      <Price value={item.price * item.quantity} className="font-normal" />
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ship to · {order.paymentMethod}</p>
                                <address className="not-italic text-muted-foreground">
                                  <p className="font-medium text-foreground">{address.name}</p>
                                  <p className="num">{address.phone}</p>
                                  <p>{address.street}</p>
                                  <p>{address.city}, {address.state} {address.pincode}</p>
                                </address>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <Pager page={page} total={total} onChange={setPage} />
      </div>

      <ConfirmDialog
        open={!!cancelTarget}
        onOpenChange={(open) => !open && setCancelTarget(null)}
        title="Cancel this order?"
        description="Stock will be returned to inventory and the customer's order will be marked cancelled."
        confirmLabel="Cancel order"
        cancelLabel="Keep order"
        destructive
        loading={busy}
        onConfirm={() => changeStatus(cancelTarget, 'Cancelled')}
      />
    </>
  );
};

const Admin = () => {
  usePageTitle('Admin');
  return (
    <div className="page-container py-8 sm:py-12">
      <PageHeader title="Admin dashboard" description="Manage products, inventory and orders." />
      <Tabs defaultValue="products" className="mt-8">
        <TabsList aria-label="Admin sections">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>
        <TabsContent value="products"><ProductsTab /></TabsContent>
        <TabsContent value="orders"><OrdersTab /></TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
