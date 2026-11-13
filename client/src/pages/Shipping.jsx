import { Truck, RotateCcw, Clock, Shield } from 'lucide-react';
import ContentPage from '../components/ContentPage';
import usePageTitle from '../hooks/usePageTitle';

const HIGHLIGHTS = [
  { icon: Truck, title: 'Free shipping', description: 'We offer free shipping across India on all orders. No minimum order value required.' },
  { icon: Clock, title: 'Delivery time', description: 'Orders typically take 5-7 business days to reach you. Remote locations may take up to 10 days.' },
  { icon: RotateCcw, title: '14-day returns', description: 'Return unused items in original condition within 14 days of delivery for a full refund.' },
  { icon: Shield, title: 'Quality guarantee', description: 'All products are quality-checked before shipping. We stand behind our craftsmanship.' },
];

const Block = ({ title, children }) => (
  <section className="border-t border-border py-8 first:border-t-0 first:pt-0">
    <h2 className="text-2xl">{title}</h2>
    <div className="mt-5 space-y-6">{children}</div>
  </section>
);

const Item = ({ heading, children }) => (
  <div>
    <h3 className="mb-1.5 font-semibold">{heading}</h3>
    <div className="max-w-[68ch] leading-relaxed text-muted-foreground">{children}</div>
  </div>
);

const Shipping = () => {
  usePageTitle('Shipping & returns');
  return (
    <ContentPage title="Shipping & returns" description="Everything you need to know about our shipping and return policies.">
      <ul className="grid gap-4 sm:grid-cols-2">
        {HIGHLIGHTS.map(({ icon: Icon, title, description }) => (
          <li key={title} className="flex gap-4 rounded-xl border border-border bg-card p-5 shadow-soft">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-sans text-base font-semibold tracking-normal">{title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-14">
        <Block title="Shipping information">
          <Item heading="Shipping areas">We currently ship to all locations within India. International shipping is not available at this time.</Item>
          <Item heading="Processing time">Orders are processed within 1-2 business days. You will receive a confirmation email once your order is shipped.</Item>
          <Item heading="Tracking">Once shipped, you will receive a tracking number to monitor your order's progress.</Item>
        </Block>

        <Block title="Return policy">
          <Item heading="Return window">Items can be returned within 14 days of delivery. Please contact us within this timeframe to initiate a return.</Item>
          <Item heading="Return conditions">
            <ul className="list-disc space-y-1.5 pl-5 marker:text-primary">
              <li>Items must be unused and in original condition</li>
              <li>Original packaging and tags must be intact</li>
              <li>Personalized or custom items cannot be returned</li>
              <li>Items must not show signs of wear or damage</li>
            </ul>
          </Item>
          <Item heading="Return process">
            <ol className="list-decimal space-y-1.5 pl-5 marker:font-semibold marker:text-primary">
              <li>Contact our customer service team</li>
              <li>Receive return authorization and instructions</li>
              <li>Package items securely for return</li>
              <li>We arrange pickup or provide return address</li>
              <li>Refund processed within 5-7 business days</li>
            </ol>
          </Item>
        </Block>

        <Block title="Exchange policy">
          <Item heading="Size exchanges">We offer size exchanges for clothing items subject to availability. Exchange requests must be made within 14 days of delivery.</Item>
          <Item heading="Defective items">If you receive a defective item, please contact us immediately. We will arrange for a replacement or full refund at no cost to you.</Item>
        </Block>
      </div>

      <aside className="mt-6 rounded-2xl border border-border bg-surface p-6 shadow-soft sm:p-8">
        <h2 className="text-2xl">Need help?</h2>
        <p className="mt-2 text-muted-foreground">Have questions about shipping or returns? Our customer service team is here to help.</p>
        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-[auto_1fr] sm:gap-x-6">
          <dt className="font-semibold">Email</dt><dd><a className="text-primary underline underline-offset-4" href="mailto:hello@houseofhomegrown.com">hello@houseofhomegrown.com</a></dd>
          <dt className="font-semibold">Phone</dt><dd><a className="num text-primary underline underline-offset-4" href="tel:+919876543210">+91 98765 43210</a></dd>
          <dt className="font-semibold">Hours</dt><dd>Monday - Friday, 9 AM - 6 PM IST</dd>
        </dl>
      </aside>
    </ContentPage>
  );
};

export default Shipping;
