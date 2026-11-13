import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Plus, Check, Ruler } from 'lucide-react';
import { Badge } from './ui/badge';
import { Price } from './ui/price';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [isAdded, setIsAdded] = useState(false);
  const timer = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);

  const isClothing = product.category === 'clothing';
  const inStockSizes = (product.sizes || []).filter((s) => s.stock > 0);
  const outOfStock = isClothing ? product.totalStock === 0 : (product.stock ?? 0) === 0;
  const lowStock = !outOfStock && !isClothing && product.stock < 10;
  const needsSize = isClothing && inStockSizes.length !== 1;

  const handleAddToCart = () => {
    if (outOfStock) return;

    if (needsSize) {
      toast('Choose a size to add this item');
      navigate(`/product/${product.id}`);
      return;
    }

    const size = isClothing ? inStockSizes[0].size : '';
    const result = addToCart(product, 1, size);
    if (!result.ok) {
      toast.error(result.reason === 'out_of_stock' ? 'This item is out of stock' : `Maximum available (${result.available}) already in your cart`);
      return;
    }
    setIsAdded(true);
    toast.success(`${product.title} added to cart`);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setIsAdded(false), 1800);
  };

  const actionLabel = needsSize ? `Choose size for ${product.title}` : `Add ${product.title} to cart`;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-soft transition-[box-shadow,transform,border-color] duration-300 ease-out hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lift">
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <img
          src={product.imageUrl}
          alt=""
          loading="lazy"
          className={`h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] ${outOfStock ? 'opacity-60 grayscale-[40%]' : ''}`}
        />
        {(outOfStock || lowStock) && (
          <div className="absolute left-3 top-3">
            {outOfStock ? (
              <Badge variant="muted" className="bg-background/90 backdrop-blur">Sold out</Badge>
            ) : (
              <Badge variant="warning">Only {product.stock} left</Badge>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        <div className="mb-1 flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="truncate capitalize">{product.subcategory?.replace(/-/g, ' ') || product.category}</span>
          {product.rating > 0 && (
            <span className="num flex shrink-0 items-center gap-1" aria-label={`Rated ${product.rating} out of 5`}>
              <Star className="h-3.5 w-3.5 fill-warning text-warning" aria-hidden="true" />
              {product.rating}
            </span>
          )}
        </div>

        <h3 className="line-clamp-2 min-h-[2.5rem] text-[0.9375rem] font-semibold leading-5">
          <Link to={`/product/${product.id}`} className="rounded-sm before:absolute before:inset-0 before:z-0 focus-visible:outline-none focus-visible:before:rounded-xl focus-visible:before:ring-2 focus-visible:before:ring-ring">
            {product.title}
          </Link>
        </h3>

        <div className="mt-auto flex min-h-[2.5rem] items-center justify-between pt-3 box-content">
          <Price value={product.price} className="text-lg" />
          {!outOfStock && (
            <button
              type="button"
              onClick={handleAddToCart}
              aria-label={actionLabel}
              title={needsSize ? 'Choose size' : 'Add to cart'}
              className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card active:scale-90 ${
                isAdded
                  ? 'bg-success text-background'
                  : 'bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground'
              }`}
            >
              {isAdded ? <Check className="h-4 w-4" /> : needsSize ? <Ruler className="h-4 w-4" /> : <Plus className="h-[1.125rem] w-[1.125rem]" />}
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
