import { Link, useLocation } from 'react-router-dom';
import { Package, Banknote, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import usePageTitle from '../hooks/usePageTitle';

const OrderSuccess = () => {
  const location = useLocation();
  usePageTitle('Order confirmed');
  const orderId = location.state?.orderId;

  return (
    <div className="page-container flex justify-center py-12 sm:py-20">
      <div className="w-full max-w-lg animate-fade-up text-center">
        <img src="/thankyou.png" alt="" className="mx-auto h-24 w-24" />
        <h1 className="mt-6 text-3xl sm:text-4xl">Thank you, your order is placed</h1>
        <p className="mt-3 text-muted-foreground">धन्यवाद. We're getting your order ready.</p>

        {orderId && (
          <div className="mt-8 rounded-xl border border-border bg-card p-4 shadow-soft">
            <p className="text-sm text-muted-foreground">Order reference</p>
            <p className="mt-1 break-all font-mono text-sm font-medium">{orderId}</p>
          </div>
        )}

        <ul className="mt-6 space-y-4 rounded-xl border border-border bg-card p-5 text-left shadow-soft">
          <li className="flex gap-3">
            <Package className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold">Order confirmed</p>
              <p className="text-sm text-muted-foreground">It's being processed and usually arrives in 5–7 business days.</p>
            </div>
          </li>
          <li className="flex gap-3">
            <Banknote className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold">Pay on delivery</p>
              <p className="text-sm text-muted-foreground">Keep payment ready when it arrives at your door.</p>
            </div>
          </li>
        </ul>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <Link to="/orders">View my orders <ArrowRight className="h-4 w-4" /></Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/shop">Continue shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
