import { useState, useEffect } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { Plus, MapPin, Banknote, AlertCircle, Lock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input, Field } from '../components/ui/input';
import { Price } from '../components/ui/price';
import { PageHeader } from '../components/ui/page-header';
import { Breadcrumbs } from '../components/ui/breadcrumbs';
import { useCart } from '../context/CartContext';
import { ordersAPI, profileAPI, getErrorMessage } from '../utils/api';
import usePageTitle from '../hooks/usePageTitle';

const EMPTY_FORM = { name: '', phone: '', street: '', city: '', state: '', pincode: '' };

const Checkout = () => {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [addresses, setAddresses] = useState([]);
  const [addressesLoaded, setAddressesLoaded] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [placed, setPlaced] = useState(false);

  const { cart, getTotalPrice, clearCart, refreshCart } = useCart();
  const navigate = useNavigate();
  usePageTitle('Checkout');

  useEffect(() => {
    refreshCart();
    profileAPI.getAddresses()
      .then((response) => {
        setAddresses(response.data);
        const defaultAddress = response.data.find((addr) => addr.isDefault);
        if (defaultAddress) setSelectedAddress(defaultAddress);
      })
      .catch((err) => console.error('Error fetching addresses:', err))
      .finally(() => setAddressesLoaded(true));
  }, [refreshCart]);

  const usingForm = addresses.length === 0 || showNewAddress;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!usingForm && !selectedAddress) {
      setError('Choose a delivery address to continue.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const shippingAddress = usingForm
        ? formData
        : {
            name: selectedAddress.fullName,
            phone: selectedAddress.phone,
            street: `${selectedAddress.addressLine1}${selectedAddress.addressLine2 ? ', ' + selectedAddress.addressLine2 : ''}`,
            city: selectedAddress.city,
            state: selectedAddress.state,
            pincode: selectedAddress.pincode,
          };

      const response = await ordersAPI.create({
        items: cart.map((item) => ({ productId: item.id, size: item.size || undefined, quantity: item.quantity })),
        shippingAddress,
        totalAmount: getTotalPrice(),
      });
      setPlaced(true);
      clearCart();
      navigate('/order-success', { state: { orderId: response.data.order._id }, replace: true });
    } catch (err) {
      const code = err.response?.data?.code;
      if (['PRICE_CHANGED', 'INSUFFICIENT_STOCK', 'ITEM_UNAVAILABLE', 'SIZE_REQUIRED'].includes(code)) {
        await refreshCart();
      }
      setError(getErrorMessage(err, 'Failed to place order'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0 && !placed) {
    return <Navigate to="/cart" replace />;
  }

  const total = getTotalPrice();

  return (
    <div className="page-container py-8 sm:py-12">
      <Breadcrumbs items={[{ label: 'Cart', to: '/cart' }, { label: 'Checkout' }]} className="mb-6" />
      <PageHeader title="Checkout" />

      <form onSubmit={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_24rem] lg:items-start" noValidate={false}>
        <div className="space-y-6">
          {error && (
            <div role="alert" className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive-soft p-4 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <p>{error}</p>
            </div>
          )}

          <section className="rounded-xl border border-border bg-card p-5 shadow-soft sm:p-6" aria-labelledby="delivery-heading">
            <h2 id="delivery-heading" className="font-sans text-lg font-semibold tracking-normal">Delivery address</h2>

            {!addressesLoaded ? (
              <div className="mt-5 h-24 skeleton" aria-hidden="true" />
            ) : (
              <>
                {addresses.length > 0 && (
                  <div className="mt-5 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-labelledby="delivery-heading">
                    {addresses.map((address) => {
                      const selected = !showNewAddress && selectedAddress?._id === address._id;
                      return (
                        <button
                          key={address._id}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => { setSelectedAddress(address); setShowNewAddress(false); setError(''); }}
                          className={`relative rounded-xl border p-4 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card ${
                            selected ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-primary/40 hover:bg-muted/60'
                          }`}
                        >
                          <span className="mb-2 flex items-center gap-2 font-semibold capitalize">
                            <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
                            {address.type || 'Address'}
                            {address.isDefault && <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium normal-case text-muted-foreground">Default</span>}
                          </span>
                          <span className="block font-medium">{address.fullName}</span>
                          <span className="num block text-muted-foreground">{address.phone}</span>
                          <span className="mt-1 block text-muted-foreground">
                            {address.addressLine1}{address.addressLine2 && `, ${address.addressLine2}`}
                          </span>
                          <span className="block text-muted-foreground">{address.city}, {address.state} {address.pincode}</span>
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => { setShowNewAddress(true); setSelectedAddress(null); }}
                      aria-pressed={showNewAddress}
                      className={`flex min-h-[7rem] flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        showNewAddress ? 'border-primary bg-primary/5 text-primary' : 'border-input text-muted-foreground hover:border-primary/40 hover:text-foreground'
                      }`}
                    >
                      <Plus className="h-5 w-5" aria-hidden="true" />
                      Use a new address
                    </button>
                  </div>
                )}

                {usingForm && (
                  <div className={`grid gap-4 sm:grid-cols-6 ${addresses.length > 0 ? 'mt-6 border-t border-border pt-6' : 'mt-5'}`}>
                    <Field label="Full name" htmlFor="name" required className="sm:col-span-3">
                      <Input id="name" name="name" autoComplete="name" required value={formData.name} onChange={handleChange} />
                    </Field>
                    <Field label="Phone number" htmlFor="phone" required className="sm:col-span-3">
                      <Input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" required value={formData.phone} onChange={handleChange} />
                    </Field>
                    <Field label="Street address" htmlFor="street" required className="sm:col-span-6">
                      <Input id="street" name="street" autoComplete="street-address" required value={formData.street} onChange={handleChange} />
                    </Field>
                    <Field label="City" htmlFor="city" required className="sm:col-span-2">
                      <Input id="city" name="city" autoComplete="address-level2" required value={formData.city} onChange={handleChange} />
                    </Field>
                    <Field label="State" htmlFor="state" required className="sm:col-span-2">
                      <Input id="state" name="state" autoComplete="address-level1" required value={formData.state} onChange={handleChange} />
                    </Field>
                    <Field label="Pincode" htmlFor="pincode" required className="sm:col-span-2">
                      <Input id="pincode" name="pincode" inputMode="numeric" autoComplete="postal-code" required value={formData.pincode} onChange={handleChange} className="num" />
                    </Field>
                  </div>
                )}
              </>
            )}
          </section>

          <section className="rounded-xl border border-border bg-card p-5 shadow-soft sm:p-6" aria-labelledby="payment-heading">
            <h2 id="payment-heading" className="font-sans text-lg font-semibold tracking-normal">Payment</h2>
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-primary bg-primary/5 p-4 ring-1 ring-primary">
              <Banknote className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <div className="text-sm">
                <p className="font-semibold">Cash on delivery</p>
                <p className="mt-0.5 text-muted-foreground">Pay when your order arrives. No advance payment needed.</p>
              </div>
            </div>
          </section>
        </div>

        <aside className="rounded-xl border border-border bg-card p-5 shadow-soft sm:p-6 lg:sticky lg:top-24" aria-label="Order summary">
          <h2 className="font-sans text-lg font-semibold tracking-normal">Order summary</h2>
          <ul className="mt-5 divide-y divide-border">
            {cart.map((item) => (
              <li key={item.key} className="flex gap-3 py-3 first:pt-0">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                  <span className="num absolute right-0.5 top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1 text-[0.6875rem] font-bold text-background">{item.quantity}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-medium leading-snug">{item.title}</p>
                  {item.size && <p className="text-xs text-muted-foreground">Size {item.size}</p>}
                </div>
                <Price value={item.price * item.quantity} className="text-sm" />
              </li>
            ))}
          </ul>

          <dl className="mt-2 space-y-3 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd><Price value={total} className="font-medium" /></dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd className="font-medium text-success">Free</dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-border pt-4">
              <dt className="text-base font-semibold">Total</dt>
              <dd><Price value={total} className="text-2xl" /></dd>
            </div>
          </dl>

          <Button type="submit" size="lg" className="mt-6 w-full" loading={loading}>
            {loading ? 'Placing order…' : 'Place order'}
          </Button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="h-3 w-3 shrink-0" aria-hidden="true" />
            <span>By placing your order you agree to our <Link to="/terms" className="underline underline-offset-2 hover:text-foreground">terms</Link>.</span>
          </p>
        </aside>
      </form>
    </div>
  );
};

export default Checkout;
