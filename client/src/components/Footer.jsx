import { Link } from 'react-router-dom';
import { Truck, RotateCcw, Banknote, Hand } from 'lucide-react';

const TRUST = [
  { icon: Truck, title: 'Free shipping', text: 'Across India, no minimum' },
  { icon: Banknote, title: 'Cash on delivery', text: 'Pay when it arrives' },
  { icon: RotateCcw, title: '14-day returns', text: 'On unused items' },
  { icon: Hand, title: 'Made by artisans', text: 'Small-batch, traditional' },
];

const COLUMNS = [
  {
    title: 'Shop',
    links: [
      { to: '/shop', label: 'All products' },
      { to: '/categories', label: 'Categories' },
      { to: '/category/clothing', label: 'Clothing' },
      { to: '/category/indian-taste', label: 'Indian Taste' },
    ],
  },
  {
    title: 'Help',
    links: [
      { to: '/orders', label: 'Track an order' },
      { to: '/faq', label: 'FAQ' },
      { to: '/contact', label: 'Contact us' },
      { to: '/shipping', label: 'Shipping & returns' },
    ],
  },
  {
    title: 'Company',
    links: [
      { to: '/about', label: 'Our story' },
      { to: '/privacy', label: 'Privacy policy' },
      { to: '/terms', label: 'Terms & conditions' },
    ],
  },
];

const linkClass = 'rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground';

const Footer = () => (
  <footer className="mt-24 border-t border-border bg-surface">
    <div className="page-container">
      <ul className="grid grid-cols-2 gap-x-6 gap-y-8 border-b border-border py-10 lg:grid-cols-4">
        {TRUST.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <Icon className="h-[1.125rem] w-[1.125rem]" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold">{title}</p>
              <p className="text-[0.8125rem] text-muted-foreground">{text}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="grid gap-10 py-12 lg:grid-cols-[1.4fr_2fr]">
        <div>
          <Link to="/" className="inline-flex items-center gap-2.5" aria-label="House of Homegrown home">
            <img src="/logo.png" alt="" className="h-9 w-9 rounded-md" />
            <span className="font-display text-xl">House of Homegrown</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Celebrating India's heritage through sustainable, premium products crafted by local artisans.
            Every purchase supports traditional craftsmanship.
          </p>
          <div className="mt-6 flex items-center gap-3" aria-hidden="true">
            <img src="/pattern1.png" alt="" className="h-8 w-8 opacity-80" />
            <img src="/pattern2.png" alt="" className="h-8 w-8 opacity-80" />
            <img src="/pattern3.png" alt="" className="h-8 w-8 opacity-80" />
          </div>
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h2 className="mb-4 font-sans text-sm font-semibold tracking-normal">{column.title}</h2>
              <ul className="space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className={linkClass}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="flex flex-col gap-2 border-t border-border py-6 text-[0.8125rem] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} House of Homegrown. All rights reserved.</p>
        <p>Made for sustainable living.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
