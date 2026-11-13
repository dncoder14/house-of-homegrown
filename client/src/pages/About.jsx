import { Leaf, Heart, Users, Award } from 'lucide-react';
import ContentPage from '../components/ContentPage';
import usePageTitle from '../hooks/usePageTitle';

const VALUES = [
  { icon: Leaf, title: 'Sustainability first', description: 'Every product is crafted with eco-friendly materials and sustainable practices, ensuring minimal environmental impact.' },
  { icon: Heart, title: 'Handcrafted excellence', description: 'Our products are lovingly handcrafted by skilled artisans who have inherited traditional techniques passed down through generations.' },
  { icon: Users, title: 'Community support', description: 'We work directly with local communities, ensuring fair wages and supporting the preservation of traditional crafts.' },
  { icon: Award, title: 'Premium quality', description: 'Each product undergoes rigorous quality checks to ensure you receive only the finest handcrafted goods.' },
];

const About = () => {
  usePageTitle('About us');
  return (
    <ContentPage
      title="Our story"
      crumb="Our story"
      description="House of Homegrown was born from a deep love for India's rich cultural heritage and a commitment to sustainable living."
    >
      <div className="prose-copy">
        <p>
          In a world increasingly dominated by mass production and fast fashion, we believe there's something magical about
          products made by hand, with love, and with respect for our planet. Our journey began with a simple mission: to
          celebrate and preserve India's incredible artisanal traditions while promoting sustainable living.
        </p>
        <p>
          Every product in our collection tells a story: of skilled hands that shaped it, of natural materials carefully
          sourced, and of communities that have kept these traditions alive for centuries. From organic cotton kurtas woven
          in Rajasthan to copper vessels crafted in Kerala, each item represents our commitment to authenticity and quality.
        </p>
        <p>
          We work directly with artisans and small-scale producers across India, ensuring fair wages and supporting
          sustainable livelihoods. When you choose House of Homegrown, you're not just buying a product, you're supporting a
          movement towards conscious consumption and cultural preservation.
        </p>
      </div>

      <section className="mt-16" aria-labelledby="values-heading">
        <h2 id="values-heading" className="text-3xl">What we stand for</h2>
        <dl className="mt-8 grid gap-x-10 gap-y-8 sm:grid-cols-2">
          {VALUES.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <dt className="font-semibold">{title}</dt>
                <dd className="mt-1.5 text-[0.9375rem] leading-relaxed text-muted-foreground">{description}</dd>
              </div>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-16 rounded-2xl border border-border bg-surface p-8 shadow-soft sm:p-10">
        <h2 className="text-2xl sm:text-3xl">Join our mission</h2>
        <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
          Together, we can create a more sustainable future while celebrating the incredible craftsmanship that makes India
          unique. Every purchase you make helps preserve traditional skills and supports artisan communities across the country.
        </p>
      </section>
    </ContentPage>
  );
};

export default About;
