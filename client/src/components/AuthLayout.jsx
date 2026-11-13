import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

/** Shared shell for login/signup: brand panel on large screens, focused form everywhere. */
const AuthLayout = ({ title, subtitle, error, footer, children }) => (
  <div className="grid min-h-[calc(100vh-7.5rem)] lg:grid-cols-2">
    <div className="relative hidden overflow-hidden bg-[hsl(22_30%_10%)] lg:block">
      <img src="/hero.webp" alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-t from-[hsl(22_36%_8%)] via-[hsl(22_36%_8%/0.4)] to-transparent" />
      <div className="relative flex h-full flex-col justify-end p-12 text-[hsl(36_30%_96%)]">
        <p className="max-w-md font-display text-4xl leading-tight">Made by hand. Carried across India to your door.</p>
        <p className="mt-4 max-w-sm text-[hsl(36_24%_88%)]">
          Join House of Homegrown to track orders, save addresses and check out faster.
        </p>
      </div>
    </div>

    <div className="flex items-center justify-center px-4 py-12 sm:px-8">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-8 inline-flex items-center gap-2.5 lg:hidden" aria-label="House of Homegrown home">
          <img src="/logo.png" alt="" className="h-9 w-9 rounded-md" />
          <span className="font-display text-xl">House of Homegrown</span>
        </Link>
        <h1 className="text-3xl sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}

        {error && (
          <div role="alert" className="mt-6 flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive-soft px-4 py-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>{error}</p>
          </div>
        )}

        <div className="mt-8">{children}</div>
        {footer && <p className="mt-8 text-center text-sm text-muted-foreground">{footer}</p>}
      </div>
    </div>
  </div>
);

export default AuthLayout;
