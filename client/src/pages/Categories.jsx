import CategoryTile from '../components/CategoryTile';
import { PageHeader } from '../components/ui/page-header';
import { Breadcrumbs } from '../components/ui/breadcrumbs';
import usePageTitle from '../hooks/usePageTitle';

const Categories = () => {
  usePageTitle('Categories');

  const categoryRows = [
    {
      title: 'Clothing & Fashion',
      categories: [
        { name: 'Sarees', image: '/saree.png', link: '/category/clothing?subcategory=sarees' },
        { name: 'Kurtas', image: '/kurtas.png', link: '/category/clothing?subcategory=kurtas' },
        { name: 'Lehengas', image: '/lehnga.png', link: '/category/clothing?subcategory=lehengas' },
        { name: 'Jewelry', image: '/jewellery.png', link: '/category/jewelry' },
        { name: 'Footwear', image: '/footwear.png', link: '/category/footwear' },
        { name: 'Accessories', image: '/accessories.png', link: '/category/accessories' },
        { name: 'Fabrics', image: '/fabric.png', link: '/category/clothing?subcategory=fabrics' },
        { name: 'Bags', image: '/bags.png', link: '/category/bags' }
      ]
    },
    {
      title: 'Food & Spices',
      categories: [
        { name: 'Spices', image: '/spices.png', link: '/category/indian-taste?subcategory=spices' },
        { name: 'Tea', image: '/tea.png', link: '/category/indian-taste?subcategory=tea' },
        { name: 'Grains', image: '/grains.png', link: '/category/indian-taste?subcategory=grains' },
        { name: 'Pickles', image: '/pickles.png', link: '/category/indian-taste?subcategory=pickles' },
        { name: 'Ghee & Oils', image: '/ghee and oil.png', link: '/category/oils' },
        { name: 'Honey', image: '/honey.png', link: '/category/honey' },
        { name: 'Dry Fruits', image: '/dry fruits.png', link: '/category/dryfruits' },
        { name: 'Sweets', image: '/sweets.png', link: '/category/indian-taste?subcategory=sweets' }
      ]
    },
    {
      title: 'Home & Living',
      categories: [
        { name: 'Pottery', image: '/pottery.png', link: '/category/pottery' },
        { name: 'Textiles', image: '/textile.png', link: '/category/textiles' },
        { name: 'Furniture', image: '/furniture.png', link: '/category/furniture' },
        { name: 'Kitchenware', image: '/kitchenware.png', link: '/category/kitchenware' },
        { name: 'Decor', image: '/decor.png', link: '/category/decor' },
        { name: 'Lighting', image: '/lighting.png', link: '/category/lighting' },
        { name: 'Storage', image: '/storage.png', link: '/category/storage' },
        { name: 'Carpets', image: '/carpet.png', link: '/category/carpets' }
      ]
    }
  ];

  return (
    <div className="page-container py-8 sm:py-12">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Categories' }]} className="mb-6" />
      <PageHeader
        title="Explore Indian heritage"
        description={'Authentic products celebrating "Roti, Kapda aur Makan", the essence of Indian living.'}
      />

      <div className="mt-12 space-y-14">
        {categoryRows.map((row) => (
          <section key={row.title} aria-labelledby={`cat-${row.title}`}>
            <h2 id={`cat-${row.title}`} className="mb-5 text-2xl">{row.title}</h2>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8 lg:gap-4">
              {row.categories.map((category) => (
                <li key={category.name}>
                  <CategoryTile name={category.name} image={category.image} to={category.link} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
};

export default Categories;
