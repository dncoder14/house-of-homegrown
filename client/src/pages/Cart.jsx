import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Trash2, Truck, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Price } from '../components/ui/price';
import { PageHeader } from '../components/ui/page-header';
import { EmptyState } from '../components/ui/empty-state';
import { QuantityStepper } from '../components/ui/quantity-stepper';
import { MAX_LINE_QUANTITY, useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import usePageTitle from '../hooks/usePageTitle';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, refreshCart, getTotalPrice, getTotalItems } = useCart();
  const { isAuthenticated } = useAuth();
  usePageTitle('Your cart');

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  if (cart.length === 0) {
    return (
      <div className="page-container py-12 sm:py-20">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Find something handmade and it will wait for you here."
          action={<Button asChild size="lg"><Link to="/shop">Start shopping</Link></Button>}
        />
      </div>
    );
  }

  const itemCount = getTotalItems();
  const total = getTotalPrice();

  return (
    <div className="page-container py-8 sm:py-12">
      <PageHeader title="Your cart" description={`${itemCount} ${itemCount === 1 ? 'item' : 'items'}`} />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start xl:grid-cols-[1fr_24rem]">
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-soft">
          {cart.map((item) => {
            const max = Math.min(item.stock || MAX_LINE_QUANTITY, MAX_LINE_QUANTITY);
            return (
              <li key={item.key} className="flex gap-4 p-4 sm:gap-5 sm:p-5">
                <Link to={`/product/${item.id}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted sm:h-28 sm:w-28" tabIndex={-1} aria-hidden="true">
                  <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                </Link>

                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="font-sans text-[0.9375rem] font-semibold leading-snug tracking-normal">
                        <Link to={`/product/${item.id}`} className="hover:text-primary">{item.title}</Link>
                      </h2>
                      <p className="mt-0.5 text-sm capitalize text-muted-foreground">
                        {item.category}{item.size ? ` · Size ${item.size}` : ''}
                      </p>
                    </div>
                    <Price value={item.price * item.quantity} className="shrink-0 text-base" />
                  </div>

                  <div className="mt-auto flex items-end justify-between gap-3 pt-3">
                    <QuantityStepper
                      size="sm"
                      value={item.quantity}
                      max={max}
                      min={0}
                      onChange={(next) => updateQuantity(item.key, next)}
                      label={`Quantity for ${item.title}`}
                    />
                    <div className="flex items-center gap-3">
                      {item.quantity > 1 && (
                        <span className="num hidden text-[0.8125rem] text-muted-foreground sm:inline">
                          <Price value={item.price} className="font-normal" /> each
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.key)}
                        className="-mr-2 text-muted-foreground hover:text-destructive"
                        aria-label={`Remove ${item.title} from cart`}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Remove</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <aside className="rounded-xl border border-border bg-card p-5 shadow-soft sm:p-6 lg:sticky lg:top-24" aria-label="Order summary">
          <h2 className="font-sans text-lg font-semibold tracking-normal">Order summary</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</dt>
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

          <Button asChild size="lg" className="mt-6 w-full">
            {isAuthenticated ? (
              <Link to="/checkout">Proceed to checkout <ArrowRight className="h-4 w-4" /></Link>
            ) : (
              <Link to="/login" state={{ from: { pathname: '/checkout' } }}>Log in to checkout <ArrowRight className="h-4 w-4" /></Link>
            )}
          </Button>
          <Button asChild variant="ghost" className="mt-2 w-full">
            <Link to="/shop">Continue shopping</Link>
          </Button>

          <ul className="mt-5 space-y-2.5 border-t border-border pt-5 text-[0.8125rem] text-muted-foreground">
            <li className="flex items-center gap-2.5"><Truck className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />Delivered in 5–7 business days</li>
            <li className="flex items-center gap-2.5"><ShieldCheck className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />Pay on delivery, 14-day returns</li>
          </ul>
        </aside>
      </div>
    </div>
  );
};

export default Cart;
