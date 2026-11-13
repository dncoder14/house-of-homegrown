import { Link } from 'react-router-dom';
import { Phone, MessageCircle, Mail, MapPin, Clock, Headphones, Package, RotateCcw, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import ContentPage from '../components/ContentPage';
import usePageTitle from '../hooks/usePageTitle';

const CONTACT_METHODS = [
  { icon: Phone, title: 'Call customer care', details: '+91 98765 43210', subtitle: 'Mon-Fri, 9 AM - 6 PM IST', action: 'Call now', link: 'tel:+919876543210' },
  { icon: MessageCircle, title: 'WhatsApp support', details: '+91 98765 43210', subtitle: 'Quick responses, 24/7', action: 'Message on WhatsApp', link: 'https://wa.me/919876543210', external: true },
  { icon: Mail, title: 'Email support', details: 'hello@houseofhomegrown.com', subtitle: 'We reply within 24 hours', action: 'Send email', link: 'mailto:hello@houseofhomegrown.com' },
];

const TOPICS = [
  { icon: Headphones, title: 'Order support', description: 'Track orders, delivery updates, order modifications' },
  { icon: Package, title: 'Product inquiries', description: 'Product details, availability, recommendations' },
  { icon: RotateCcw, title: 'Returns & exchanges', description: 'Return policy, exchange requests, refund status' },
  { icon: Mail, title: 'General support', description: 'Account issues, payment queries, technical help' },
];

const Contact = () => {
  usePageTitle('Contact us');
  return (
    <ContentPage
      title="Customer care"
      crumb="Contact"
      width="max-w-5xl"
      description="Need help? Our customer care team is here to assist you with orders, products, and more."
    >
      <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr]">
        <section aria-labelledby="touch-heading">
          <h2 id="touch-heading" className="text-2xl">Get in touch</h2>
          <ul className="mt-6 space-y-4">
            {CONTACT_METHODS.map(({ icon: Icon, title, details, subtitle, action, link, external }) => (
              <li key={title} className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-soft sm:flex-row sm:items-center">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[0.9375rem]">{title}</h3>
                  <p className="num mt-0.5 break-words font-medium">{details}</p>
                  <p className="text-sm text-muted-foreground">{subtitle}</p>
                </div>
                <Button asChild size="sm" variant="outline" className="self-start sm:self-center">
                  <a href={link} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{action}</a>
                </Button>
              </li>
            ))}
          </ul>
        </section>

        <div className="space-y-10">
          <section aria-labelledby="help-heading">
            <h2 id="help-heading" className="text-2xl">How we can help</h2>
            <ul className="mt-6 divide-y divide-border rounded-xl border border-border bg-card shadow-soft">
              {TOPICS.map(({ icon: Icon, title, description }) => (
                <li key={title} className="flex gap-3.5 p-4">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-accent-foreground" aria-hidden="true" />
                  <div>
                    <h3 className="text-[0.9375rem]">{title}</h3>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-5 rounded-xl border border-border bg-surface p-5 shadow-soft">
            <div className="flex gap-3.5">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <div>
                <h3 className="text-[0.9375rem]">Our location</h3>
                <p className="text-sm">Mumbai, Maharashtra, India</p>
                <p className="text-sm text-muted-foreground">Visit by appointment only</p>
              </div>
            </div>
            <div className="flex gap-3.5 border-t border-border pt-5">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <div>
                <h3 className="text-[0.9375rem]">Business hours</h3>
                <p className="text-sm">Monday - Friday: 9 AM - 6 PM IST</p>
                <p className="text-sm">Saturday: 10 AM - 4 PM IST</p>
              </div>
            </div>
          </section>

          <nav aria-label="Quick help" className="flex flex-col gap-2 text-sm font-semibold text-primary">
            <Link to="/faq" className="inline-flex items-center gap-1.5 hover:underline">Frequently asked questions <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/shipping" className="inline-flex items-center gap-1.5 hover:underline">Shipping & returns policy <ArrowRight className="h-4 w-4" /></Link>
          </nav>
        </div>
      </div>
    </ContentPage>
  );
};

export default Contact;
