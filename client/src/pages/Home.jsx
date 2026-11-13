import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, Heart, Users } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ProductGrid, ProductGridSkeleton } from '../components/ProductGrid';
import CategoryTile from '../components/CategoryTile';
import { productsAPI } from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import usePageTitle from '../hooks/usePageTitle';

const FEATURED_CATEGORIES = [
  { name: 'Sarees', image: '/saree.png', link: '/category/clothing?subcategory=sarees' },
  { name: 'Kurtas', image: '/kurtas.png', link: '/category/clothing?subcategory=kurtas' },
  { name: 'Lehengas', image: '/lehnga.png', link: '/category/clothing?subcategory=lehengas' },
  { name: 'Jewelry', image: '/jewellery.png', link: '/category/jewelry' },
  { name: 'Spices', image: '/spices.png', link: '/category/indian-taste?subcategory=spices' },
  { name: 'Pottery', image: '/pottery.png', link: '/category/pottery' },
  { name: 'Textiles', image: '/textile.png', link: '/category/textiles' },
  { name: 'Tea', image: '/tea.png', link: '/category/indian-taste?subcategory=tea' },
];

const VALUES = [
  { icon: Leaf, title: 'Sustainable', description: 'Eco-friendly products made with natural materials and traditional methods.' },
  { icon: Heart, title: 'Handcrafted', description: 'Each product is lovingly crafted by skilled artisans across India.' },
  { icon: Users, title: 'Community', description: 'Supporting local communities and preserving traditional crafts.' },
];

const SectionHeading = ({ title, description, action }) => (
  <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <h2 className="text-3xl sm:text-4xl">{title}</h2>
      {description && <p className="mt-2 max-w-xl text-muted-foreground">{description}</p>}
    </div>
    {action}
  </div>
);

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  usePageTitle();

  useEffect(() => {
    productsAPI.getAll({ limit: 8 })
      .then((response) => setFeaturedProducts(response.data))
      .catch((error) => console.error('Error fetching products:', error))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero: on large screens the copy sits on the photograph's empty left side; on small screens
          the photo is a banner and the copy sits below it, so nothing covers the picture. */}
      <section className="relative isolate overflow-hidden bg-background lg:aspect-[2/1] lg:max-h-[54rem] lg:min-h-[34rem]">
        <img
          src={`/hero-${theme}-1600.webp`}
          srcSet={`/hero-${theme}-1600.webp 1600w, /hero-${theme}-3200.webp 3200w`}
          sizes="100vw"
          width="3548"
          height="1774"
          alt="A shop assistant standing beside mannequins dressed in a saree, an anarkali and a kurta, with shelves of folded handloom textiles and copper pots behind"
          fetchpriority="high"
          className="h-[22rem] w-full object-cover object-[78%_center] sm:h-[30rem] lg:absolute lg:inset-0 lg:h-full"
        />

        <div className="lg:absolute lg:inset-0 lg:flex lg:items-center">
          <div className="page-container py-10 sm:py-12 lg:py-0">
            <div className="max-w-md animate-fade-up lg:max-w-[30rem] xl:max-w-lg">
              <h1 className="text-4xl leading-[1.05] sm:text-5xl xl:text-[3.5rem]">
                Celebrating India's heritage and craft
              </h1>
              <p className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">
                Premium, sustainable products made by local artisans. Every purchase supports traditional craftsmanship.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link to="/shop">Shop now <ArrowRight className="h-4 w-4" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/categories">Browse categories</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-container pt-16 sm:pt-20" aria-labelledby="home-categories">
        <SectionHeading
          title={<span id="home-categories">Shop by craft</span>}
          description="From handwoven drapes to small-batch pantry staples."
          action={
            <Button asChild variant="ghost" className="self-start sm:self-auto">
              <Link to="/categories">All categories <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          }
        />
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8 lg:gap-4">
          {FEATURED_CATEGORIES.map((category) => (
            <li key={category.name}>
              <CategoryTile name={category.name} image={category.image} to={category.link} />
            </li>
          ))}
        </ul>
      </section>

      <section className="page-container pt-20 sm:pt-24" aria-labelledby="home-featured">
        <SectionHeading
          title={<span id="home-featured">Featured products</span>}
          description="Hand-picked from our latest arrivals."
          action={
            <Button asChild variant="outline" className="self-start sm:self-auto">
              <Link to="/shop">View all products <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          }
        />
        {loading ? <ProductGridSkeleton count={8} /> : <ProductGrid products={featuredProducts} />}
      </section>

      <section className="page-container pt-20 sm:pt-24" aria-labelledby="home-values">
        <div className="rounded-2xl border border-border bg-surface px-6 py-12 shadow-soft sm:px-12 sm:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 id="home-values" className="text-3xl sm:text-4xl">Made slowly, made well</h2>
            <p className="mt-3 text-muted-foreground">
              We work directly with artisan communities so what you receive is honest, durable and carries a story.
            </p>
          </div>
          <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
            {VALUES.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex flex-col items-center text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-lg">{title}</h3>
                <p className="mt-2 max-w-xs text-[0.9375rem] leading-relaxed text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button asChild variant="outline">
              <Link to="/about">Read our story</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
