import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Package, ClipboardList } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useTheme } from '../context/ThemeContext';
import { productsAPI, adminAPI, getErrorMessage } from '../utils/api';
import usePageTitle from '../hooks/usePageTitle';

const SUBCATEGORIES = {
  clothing: ['sarees', 'kurtas', 'lehengas', 'fabrics'],
  home: ['spices', 'tea', 'grains', 'pickles', 'sweets', 'dryfruits', 'honey', 'oils', 'pottery', 'textiles', 'kitchenware', 'furniture', 'decor', 'lighting', 'storage', 'carpets'],
  accessories: ['jewelry', 'bags', 'footwear']
};

const CATEGORY_LABELS = { clothing: 'Clothing', home: 'Home & Food', accessories: 'Accessories' };

const NEXT_STATUSES = {
  Placed: ['Processing', 'Cancelled'],
  Processing: ['Shipped', 'Cancelled'],
  Shipped: ['Delivered'],
  Delivered: [],
  Cancelled: []
};

const ORDER_FILTERS = ['', 'Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const PAGE_SIZE = 20;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const emptyProduct = () => ({
  title: '',
  price: '',
  category: 'clothing',
  subcategory: '',
  description: '',
  stock: '',
  gender: '',
  sizes: [{ size: '', stock: '' }],
  images: []
});

const titleCase = (value) => value.charAt(0).toUpperCase() + value.slice(1);

const Pager = ({ page, total, onChange, isDark }) => {
  const pages = Math.max(Math.ceil(total / PAGE_SIZE), 1);
  if (pages <= 1) return null;
  return (
    <div className={`flex items-center justify-center gap-3 mt-6 text-sm ${isDark ? 'text-white/70' : 'text-earth-brown/70'}`}>
      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>Previous</Button>
      <span>Page {page} of {pages}</span>
      <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => onChange(page + 1)}>Next</Button>
    </div>
  );
};

const ProductForm = ({ mode, initial, onClose, onSaved, isDark }) => {
  const [data, setData] = useState(initial);
  const [saving, setSaving] = useState(false);
  const isEdit = mode === 'edit';
  const labelClass = `block text-sm font-medium mb-1 ${isDark ? 'text-white/80' : 'text-earth-brown/80'}`;
  const fieldClass = `w-full p-2 border rounded ${isDark ? 'bg-black border-white/20 text-white' : 'bg-white border-earth-brown/20 text-earth-brown'}`;
  const isClothing = data.category === 'clothing';

  const subcategoryOptions = [...SUBCATEGORIES[data.category]];
  if (data.subcategory && !subcategoryOptions.includes(data.subcategory)) subcategoryOptions.push(data.subcategory);

  const set = (patch) => setData((prev) => ({ ...prev, ...patch }));
  const updateSize = (index, field, value) =>
    set({ sizes: data.sizes.map((entry, i) => (i === index ? { ...entry, [field]: value } : entry)) });

  const onFiles = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 4) {
      toast.error('You can upload at most 4 images');
      e.target.value = '';
      return;
    }
    if (files.some((file) => file.size > MAX_IMAGE_BYTES)) {
      toast.error('Each image must be 5MB or smaller');
      e.target.value = '';
      return;
    }
    set({ images: files });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!isEdit && data.images.length === 0) {
      toast.error('At least 1 image is required');
      return;
    }

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog" aria-modal="true">
      <div className={`${isDark ? 'bg-black border-white/10' : 'bg-white border-earth-beige'} border rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-earth-brown'}`}>
          {isEdit ? 'Edit Product' : 'Add New Product'}
        </h3>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className={labelClass}>Title</label>
            <Input value={data.title} onChange={(e) => set({ title: e.target.value })} required maxLength={200} />
          </div>
          <div>
            <label className={labelClass}>Price (₹)</label>
            <Input type="number" min="0" step="0.01" value={data.price} onChange={(e) => set({ price: e.target.value })} required />
          </div>
          <div>
            <label className={labelClass}>Category</label>
            <select
              value={data.category}
              disabled={isEdit}
              onChange={(e) => set({ category: e.target.value, subcategory: '', gender: '', sizes: [{ size: '', stock: '' }], stock: '' })}
              className={fieldClass}
            >
              {Object.keys(SUBCATEGORIES).map((key) => (
                <option key={key} value={key}>{CATEGORY_LABELS[key]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Subcategory</label>
            <select value={data.subcategory} onChange={(e) => set({ subcategory: e.target.value })} className={fieldClass} required>
              <option value="">Select Subcategory</option>
              {subcategoryOptions.map((sub) => (
                <option key={sub} value={sub}>{titleCase(sub)}</option>
              ))}
            </select>
          </div>
          {isClothing && (
            <div>
              <label className={labelClass}>Gender</label>
              <select value={data.gender} onChange={(e) => set({ gender: e.target.value })} className={fieldClass} required>
                <option value="">Select Gender</option>
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="kids">Kids</option>
                <option value="unisex">Unisex</option>
              </select>
            </div>
          )}
          {isClothing ? (
            <div>
              <label className={labelClass}>Sizes & Stock</label>
              {data.sizes.map((entry, index) => (
                <div key={index} className="flex space-x-2 mb-2">
                  <Input placeholder="Size (S, M, L, Free Size)" value={entry.size} onChange={(e) => updateSize(index, 'size', e.target.value)} required />
                  <Input type="number" min="0" step="1" placeholder="Stock" value={entry.stock} onChange={(e) => updateSize(index, 'stock', e.target.value)} required />
                  {data.sizes.length > 1 && (
                    <Button type="button" variant="outline" size="sm" onClick={() => set({ sizes: data.sizes.filter((_, i) => i !== index) })}>
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => set({ sizes: [...data.sizes, { size: '', stock: '' }] })}>
                Add Size
              </Button>
            </div>
          ) : (
            <div>
              <label className={labelClass}>Stock</label>
              <Input type="number" min="0" step="1" value={data.stock} onChange={(e) => set({ stock: e.target.value })} required />
            </div>
          )}
          <div>
            <label className={labelClass}>Description</label>
            <textarea
              value={data.description}
              onChange={(e) => set({ description: e.target.value })}
              className={`${fieldClass} h-20`}
              required
            />
          </div>
          <div>
            <label className={labelClass}>
              Images (1-4, up to 5MB each){isEdit ? ' - leave empty to keep current images' : ''}
            </label>
            <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" onChange={onFiles} className={fieldClass} />
          </div>
          <div className="flex space-x-2">
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Add Product'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ProductsTab = ({ isDark }) => {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);

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
      _id: product._id,
      title: product.title,
      price: product.price,
      category: product.category,
      subcategory: product.subcategory,
      description: product.description,
      stock: product.stock ?? '',
      gender: product.gender || '',
      sizes: product.sizes?.length ? product.sizes.map(({ size, stock }) => ({ size, stock })) : [{ size: '', stock: '' }],
      images: []
    }
  });

  const remove = async (product) => {
    if (!window.confirm(`Delete "${product.title}"? This cannot be undone.`)) return;
    const loadingToast = toast.loading('Deleting product...');
    try {
      await adminAPI.deleteProduct(product._id);
      toast.success('Product deleted', { id: loadingToast });
      load();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to delete product'), { id: loadingToast });
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <form onSubmit={(e) => { e.preventDefault(); setPage(1); setQuery(search.trim()); }} className="flex gap-2">
          <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <Button type="submit" variant="outline">Search</Button>
        </form>
        <Button onClick={() => setForm({ mode: 'add', initial: emptyProduct() })}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      <Card className={isDark ? 'bg-black/50 border-white/10' : 'bg-white border-earth-beige'}>
        <CardHeader>
          <CardTitle className={`flex items-center ${isDark ? 'text-white' : 'text-earth-brown'}`}>
            <Package className="h-5 w-5 mr-2" />
            Products ({total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => <div key={i} className="animate-pulse h-20 bg-gray-200 rounded"></div>)}
            </div>
          ) : products.length === 0 ? (
            <p className={isDark ? 'text-white/70' : 'text-earth-brown/70'}>No products found.</p>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <div
                  key={product._id}
                  className={`p-4 rounded-lg border ${isDark ? 'border-white/10 bg-white/5' : 'border-earth-beige bg-earth-cream/20'} flex items-center justify-between gap-3`}
                >
                  <div className="flex items-center space-x-4 min-w-0">
                    <img src={product.imageUrl || product.images?.[0]?.url} alt="" className="w-16 h-16 object-cover rounded flex-shrink-0" />
                    <div className="min-w-0">
                      <h3 className={`font-semibold truncate ${isDark ? 'text-white' : 'text-earth-brown'}`}>{product.title}</h3>
                      <p className={`text-sm ${isDark ? 'text-white/70' : 'text-earth-brown/70'}`}>
                        ₹{product.price} • {product.category}/{product.subcategory} • Stock: {product.totalStock}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <Button variant="outline" size="sm" aria-label="Edit product" onClick={() => openEdit(product)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" aria-label="Delete product" onClick={() => remove(product)} className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Pager page={page} total={total} onChange={setPage} isDark={isDark} />
        </CardContent>
      </Card>

      {form && (
        <ProductForm
          mode={form.mode}
          initial={form.initial}
          isDark={isDark}
          onClose={() => setForm(null)}
          onSaved={() => { setForm(null); load(); }}
        />
      )}
    </>
  );
};

const OrdersTab = ({ isDark }) => {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

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
    if (next === 'Cancelled' && !window.confirm('Cancel this order? Stock will be returned to inventory.')) return;
    try {
      const response = await adminAPI.updateOrderStatus(order._id, next);
      setOrders((prev) => prev.map((o) => (o._id === order._id ? response.data : o)));
      toast.success(`Order marked ${next}`);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update order'));
      load();
    }
  };

  const textClass = isDark ? 'text-white' : 'text-earth-brown';
  const mutedClass = isDark ? 'text-white/70' : 'text-earth-brown/70';

  return (
    <Card className={isDark ? 'bg-black/50 border-white/10' : 'bg-white border-earth-beige'}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className={`flex items-center ${textClass}`}>
            <ClipboardList className="h-5 w-5 mr-2" />
            Orders ({total})
          </CardTitle>
          <select
            value={status}
            onChange={(e) => { setPage(1); setStatus(e.target.value); }}
            aria-label="Filter by status"
            className={`p-2 border rounded ${isDark ? 'bg-black border-white/20 text-white' : 'bg-white border-earth-brown/20 text-earth-brown'}`}
          >
            {ORDER_FILTERS.map((s) => <option key={s} value={s}>{s || 'All statuses'}</option>)}
          </select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => <div key={i} className="animate-pulse h-24 bg-gray-200 rounded"></div>)}
          </div>
        ) : orders.length === 0 ? (
          <p className={mutedClass}>No orders found.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className={`p-4 rounded-lg border ${isDark ? 'border-white/10 bg-white/5' : 'border-earth-beige bg-earth-cream/20'}`}>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div className="min-w-0">
                    <p className={`font-semibold ${textClass}`}>
                      #{order._id.slice(-8).toUpperCase()} • ₹{order.totalAmount.toLocaleString()} • {order.paymentMethod}
                    </p>
                    <p className={`text-sm ${mutedClass}`}>
                      {new Date(order.createdAt).toLocaleString()} • {order.userId?.name || 'Deleted user'} ({order.userId?.email || 'n/a'})
                    </p>
                    <p className={`text-sm mt-2 ${mutedClass}`}>
                      {order.items.map((item) => `${item.quantity} × ${item.title}${item.size ? ` (${item.size})` : ''}`).join(', ')}
                    </p>
                    <p className={`text-sm mt-2 ${mutedClass}`}>
                      Ship to: {order.shippingAddress.name}, {order.shippingAddress.phone}, {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
                    </p>
                  </div>
                  <div className="flex flex-col items-start md:items-end gap-2 flex-shrink-0">
                    <span className={`text-sm font-medium px-2 py-1 rounded ${isDark ? 'bg-white/10 text-white' : 'bg-earth-beige text-earth-brown'}`}>{order.status}</span>
                    <div className="flex gap-2 flex-wrap">
                      {NEXT_STATUSES[order.status].map((next) => (
                        <Button
                          key={next}
                          size="sm"
                          variant="outline"
                          className={next === 'Cancelled' ? 'text-red-600' : ''}
                          onClick={() => changeStatus(order, next)}
                        >
                          {next === 'Cancelled' ? 'Cancel' : `Mark ${next}`}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <Pager page={page} total={total} onChange={setPage} isDark={isDark} />
      </CardContent>
    </Card>
  );
};

const Admin = () => {
  const { isDark } = useTheme();
  const [tab, setTab] = useState('products');
  usePageTitle('Admin');

  const tabClass = (name) =>
    `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
      tab === name
        ? 'bg-earth-terracotta text-white'
        : isDark ? 'text-white/70 hover:bg-white/10' : 'text-earth-brown hover:bg-earth-beige'
    }`;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-background' : 'bg-earth-cream/30'}`}>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-earth-brown'} mb-2`}>Admin Dashboard</h1>
            <p className={`text-xl ${isDark ? 'text-white/70' : 'text-earth-brown/70'}`}>Manage products, inventory and orders</p>
          </div>
          <div className="flex gap-2 mb-6" role="tablist">
            <button role="tab" aria-selected={tab === 'products'} className={tabClass('products')} onClick={() => setTab('products')}>Products</button>
            <button role="tab" aria-selected={tab === 'orders'} className={tabClass('orders')} onClick={() => setTab('orders')}>Orders</button>
          </div>
          {tab === 'products' ? <ProductsTab isDark={isDark} /> : <OrdersTab isDark={isDark} />}
        </div>
      </div>
    </div>
  );
};

export default Admin;
