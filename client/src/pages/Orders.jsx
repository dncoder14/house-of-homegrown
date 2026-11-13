import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, CloudOff, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { Price } from '../components/ui/price';
import { StatusBadge } from '../components/ui/status-badge';
import { PageHeader } from '../components/ui/page-header';
import { EmptyState } from '../components/ui/empty-state';
import { ordersAPI } from '../utils/api';
import usePageTitle from '../hooks/usePageTitle';

const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  usePageTitle('My orders');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    ordersAPI.getAll()
      .then((response) => { if (!cancelled) setOrders(response.data); })
      .catch(() => { if (!cancelled) setError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [reloadKey]);

  return (
    <div className="page-container py-8 sm:py-12">
      <PageHeader title="My orders" description={!loading && !error && orders.length > 0 ? `${orders.length} ${orders.length === 1 ? 'order' : 'orders'}` : undefined} />

      <div className="mt-8">
        {loading ? (
          <div className="space-y-4" role="status" aria-label="Loading orders">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-36 w-full rounded-xl" />)}
          </div>
        ) : error ? (
          <EmptyState
            icon={CloudOff}
            title="We couldn't load your orders"
            description="Check your connection and try again."
            action={<Button onClick={() => setReloadKey((k) => k + 1)}>Try again</Button>}
          />
        ) : orders.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No orders yet"
            description="When you place an order it will show up here so you can track it."
            action={<Button asChild size="lg"><Link to="/shop">Start shopping</Link></Button>}
          />
        ) : (
          <ul className="space-y-4">
            {orders.map((order) => {
              const shown = order.items.slice(0, 4);
              const extra = order.items.length - shown.length;
              return (
                <li key={order._id}>
                  <Link
                    to={`/order/${order._id}`}
                    className="group block rounded-xl border border-border bg-card p-4 shadow-soft transition-[box-shadow,border-color] duration-200 hover:border-primary/30 hover:shadow-lift sm:p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
                      <div>
                        <p className="num font-semibold">Order #{order._id.slice(-8).toUpperCase()}</p>
                        <p className="num text-sm text-muted-foreground">Placed {formatDate(order.createdAt)} · {order.paymentMethod}</p>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-4 border-t border-border pt-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex -space-x-2">
                          {shown.map((item, index) => (
                            <img
                              key={index}
                              src={item.imageUrl}
                              alt=""
                              className="h-12 w-12 rounded-lg border-2 border-card bg-muted object-cover"
                            />
                          ))}
                          {extra > 0 && (
                            <span className="num flex h-12 w-12 items-center justify-center rounded-lg border-2 border-card bg-muted text-xs font-semibold text-muted-foreground">+{extra}</span>
                          )}
                        </div>
                        <p className="hidden min-w-0 truncate text-sm text-muted-foreground sm:block">
                          {order.items[0].title}{order.items.length > 1 ? ` and ${order.items.length - 1} more` : ''}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <Price value={order.totalAmount} className="text-lg" />
                        <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Orders;
