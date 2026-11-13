import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Check, RotateCcw, XCircle, CloudOff } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { Price } from '../components/ui/price';
import { StatusBadge } from '../components/ui/status-badge';
import { Breadcrumbs } from '../components/ui/breadcrumbs';
import { EmptyState } from '../components/ui/empty-state';
import { ConfirmDialog } from '../components/ui/confirm-dialog';
import { ordersAPI, getErrorMessage } from '../utils/api';
import usePageTitle from '../hooks/usePageTitle';
import toast from 'react-hot-toast';

const STEPS = ['Placed', 'Processing', 'Shipped', 'Delivered'];
const RETURN_WINDOW_DAYS = 14;

const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

const isReturnEligible = (orderDate, status) => {
  if (status !== 'Delivered') return false;
  const days = Math.ceil(Math.abs(Date.now() - new Date(orderDate)) / (1000 * 60 * 60 * 24));
  return days <= RETURN_WINDOW_DAYS;
};

const Tracker = ({ status }) => {
  const current = STEPS.indexOf(status);
  return (
    <ol className="flex" aria-label="Order progress">
      {STEPS.map((label, index) => {
        const done = index <= current;
        const active = index === current;
        return (
          <li key={label} className="relative flex flex-1 flex-col items-center text-center" aria-current={active ? 'step' : undefined}>
            {index > 0 && (
              <span
                aria-hidden="true"
                className={`absolute right-1/2 top-4 h-0.5 w-full -translate-y-1/2 ${index <= current ? 'bg-success' : 'bg-border'}`}
              />
            )}
            <span
              className={`num relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ring-4 ring-card ${
                done ? 'bg-success text-background' : 'bg-muted text-muted-foreground'
              }`}
            >
              {done ? <Check className="h-4 w-4" aria-hidden="true" /> : index + 1}
            </span>
            <span className={`mt-2 text-xs sm:text-sm ${done ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>{label}</span>
          </li>
        );
      })}
    </ol>
  );
};

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  usePageTitle('Order details');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    ordersAPI.getById(id)
      .then((response) => { if (!cancelled) setOrder(response.data); })
      .catch((err) => {
        console.error('Error fetching order:', err);
        if (cancelled) return;
        if (err.response?.status === 404) navigate('/orders', { replace: true });
        else setError(true);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id, navigate]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const response = await ordersAPI.cancel(order._id);
      setOrder(response.data);
      setConfirmOpen(false);
      toast.success('Order cancelled');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not cancel order'));
    } finally {
      setCancelling(false);
    }
  };

  const handleReturn = () => {
    toast(`To start a return, email hello@houseofhomegrown.com with order ID ${order._id.slice(-8)}.`, { duration: 8000 });
  };

  if (loading) {
    return (
      <div className="page-container py-8 sm:py-12" role="status" aria-label="Loading order">
        <Skeleton className="mb-6 h-4 w-48" />
        <Skeleton className="h-10 w-72" />
        <Skeleton className="mt-8 h-32 w-full rounded-xl" />
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <EmptyState
        className="py-24"
        icon={CloudOff}
        title="We couldn't load this order"
        description="Check your connection and try again."
        action={<Button onClick={() => navigate(0)}>Reload</Button>}
      />
    );
  }

  const canCancel = ['Placed', 'Processing'].includes(order.status);
  const returnable = isReturnEligible(order.createdAt, order.status);
  const cancelled = order.status === 'Cancelled';
  const address = order.shippingAddress;

  return (
    <div className="page-container py-8 sm:py-12">
      <Breadcrumbs
        className="mb-6"
        items={[{ label: 'Orders', to: '/orders' }, { label: `Order #${order._id.slice(-8).toUpperCase()}` }]}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="num text-3xl sm:text-4xl">Order #{order._id.slice(-8).toUpperCase()}</h1>
            <StatusBadge status={order.status} />
          </div>
          <p className="mt-2 text-muted-foreground">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canCancel && (
            <Button variant="outline" onClick={() => setConfirmOpen(true)} className="text-destructive hover:bg-destructive-soft">
              <XCircle className="h-4 w-4" /> Cancel order
            </Button>
          )}
          {returnable && (
            <Button variant="outline" onClick={handleReturn}>
              <RotateCcw className="h-4 w-4" /> Start a return
            </Button>
          )}
        </div>
      </div>

      <section className="mt-8 rounded-xl border border-border bg-card p-5 shadow-soft sm:p-6" aria-label="Order tracking">
        {cancelled ? (
          <div className="flex items-start gap-3">
            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden="true" />
            <div>
              <p className="font-semibold">This order was cancelled</p>
              <p className="text-sm text-muted-foreground">Items have been returned to stock. No payment was collected.</p>
            </div>
          </div>
        ) : (
          <>
            <Tracker status={order.status} />
            {returnable && (
              <p className="mt-6 rounded-lg bg-success-soft px-4 py-3 text-sm text-success">
                This order is eligible for return within {RETURN_WINDOW_DAYS} days of delivery.
              </p>
            )}
          </>
        )}
      </section>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-xl border border-border bg-card shadow-soft" aria-labelledby="items-heading">
          <h2 id="items-heading" className="px-5 pt-5 font-sans text-lg font-semibold tracking-normal sm:px-6 sm:pt-6">
            Items ({order.items.length})
          </h2>
          <ul className="mt-2 divide-y divide-border px-5 pb-2 sm:px-6">
            {order.items.map((item, index) => (
              <li key={index} className="flex items-center gap-4 py-4">
                <img src={item.imageUrl} alt="" className="h-16 w-16 shrink-0 rounded-lg bg-muted object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium leading-snug">{item.title}</p>
                  <p className="num text-sm text-muted-foreground">
                    {item.size ? `Size ${item.size} · ` : ''}Qty {item.quantity} × <Price value={item.price} className="font-normal" />
                  </p>
                </div>
                <Price value={item.price * item.quantity} />
              </li>
            ))}
          </ul>
        </section>

        <div className="space-y-6">
          <section className="rounded-xl border border-border bg-card p-5 shadow-soft sm:p-6" aria-labelledby="ship-heading">
            <h2 id="ship-heading" className="flex items-center gap-2 font-sans text-lg font-semibold tracking-normal">
              <MapPin className="h-4 w-4 text-primary" aria-hidden="true" /> Delivery address
            </h2>
            <address className="mt-3 space-y-0.5 text-sm not-italic text-muted-foreground">
              <p className="font-medium text-foreground">{address.name}</p>
              <p className="num">{address.phone}</p>
              <p>{address.street}</p>
              <p>{address.city}, {address.state} {address.pincode}</p>
            </address>
          </section>

          <section className="rounded-xl border border-border bg-card p-5 shadow-soft sm:p-6" aria-labelledby="pay-heading">
            <h2 id="pay-heading" className="font-sans text-lg font-semibold tracking-normal">Payment</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Method</dt><dd className="font-medium">{order.paymentMethod === 'COD' ? 'Cash on delivery' : order.paymentMethod}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd><Price value={order.totalAmount} className="font-medium" /></dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd className="font-medium text-success">Free</dd></div>
              <div className="flex items-baseline justify-between border-t border-border pt-4">
                <dt className="text-base font-semibold">Total</dt>
                <dd><Price value={order.totalAmount} className="text-2xl" /></dd>
              </div>
            </dl>
            {!cancelled && order.status !== 'Delivered' && (
              <p className="mt-4 text-sm text-muted-foreground">Payment will be collected when your order is delivered.</p>
            )}
          </section>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Cancel this order?"
        description="This can't be undone. Items go back into stock and nothing will be charged."
        confirmLabel="Cancel order"
        cancelLabel="Keep order"
        destructive
        loading={cancelling}
        onConfirm={handleCancel}
      />
    </div>
  );
};

export default OrderDetail;
