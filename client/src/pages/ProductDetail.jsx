import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ShoppingBag, Check, Truck, RotateCcw, Banknote } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Price } from '../components/ui/price';
import { Breadcrumbs } from '../components/ui/breadcrumbs';
import { QuantityStepper } from '../components/ui/quantity-stepper';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../components/ui/accordion';
import { useCart, getVariantStock, MAX_LINE_QUANTITY } from '../context/CartContext';
import { productsAPI } from '../utils/api';
import toast from 'react-hot-toast';
import usePageTitle from '../hooks/usePageTitle';

const titleCase = (value = '') => value.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

const DetailSkeleton = () => (
  <div className="page-container py-8 sm:py-12" role="status" aria-label="Loading product">
    <Skeleton className="mb-8 h-4 w-56" />
    <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
      <Skeleton className="aspect-square w-full rounded-2xl" />
      <div className="space-y-5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  </div>
);

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isAdded, setIsAdded] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [sizeError, setSizeError] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const { addToCart } = useCart();
  const sizeGroupRef = useRef(null);
  const addedTimer = useRef();

  usePageTitle(product?.title);

  useEffect(() => () => clearTimeout(addedTimer.current), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    productsAPI.getById(id)
      .then((response) => {
        if (cancelled) return;
        const data = response.data;
        setProduct(data);
        setActiveImage(0);
        setQuantity(1);
        setSizeError(false);
        const sizes = data.sizes || [];
        setSelectedSize(data.category === 'clothing' && sizes.length === 1 ? sizes[0].size : '');
      })
      .catch((error) => {
        console.error('Error fetching product:', error);
        if (!cancelled) navigate('/shop', { replace: true });
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id, navigate]);

  if (loading || !product) return <DetailSkeleton />;

  const isClothing = product.category === 'clothing';
  const available = Math.min(getVariantStock(product, selectedSize), MAX_LINE_QUANTITY);
  const outOfStock = isClothing ? product.totalStock === 0 : (product.stock ?? 0) === 0;
  const images = product.images?.length ? product.images : [{ url: product.imageUrl }];

  const stockNote = outOfStock
    ? { tone: 'destructive', text: 'Sold out' }
    : !isClothing && product.stock < 10
    ? { tone: 'warning', text: `Only ${product.stock} left in stock` }
    : isClothing && selectedSize && available < 5
    ? { tone: 'warning', text: `Only ${available} left in size ${selectedSize}` }
    : { tone: 'success', text: 'In stock' };

  const selectSize = (size) => {
    setSelectedSize(size);
    setSizeError(false);
    setQuantity(1);
  };

  const handleAddToCart = () => {
    if (isClothing && !selectedSize) {
      setSizeError(true);
      sizeGroupRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      sizeGroupRef.current?.querySelector('button:not([disabled])')?.focus({ preventScroll: true });
      return;
    }
    const result = addToCart(product, quantity, selectedSize);
    if (!result.ok) {
      toast.error(result.reason === 'out_of_stock'
        ? 'This item is out of stock'
        : `You already have the maximum available (${result.available}) in your cart`);
      return;
    }
    toast.success(result.capped
      ? `Added to cart (only ${result.available} available)`
      : `${quantity} × ${product.title}${selectedSize ? ` (${selectedSize})` : ''} added to cart`);
    setQuantity(1);
    setIsAdded(true);
    clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setIsAdded(false), 1800);
  };

  const addLabel = outOfStock ? 'Sold out' : isAdded ? 'Added to cart' : isClothing && !selectedSize ? 'Select a size' : 'Add to cart';
  const AddIcon = isAdded ? Check : ShoppingBag;

  return (
    <div className="page-container py-6 pb-28 sm:py-10 lg:pb-12">
      <Breadcrumbs
        className="mb-6"
        items={[
          { label: 'Home', to: '/' },
          { label: 'Shop', to: '/shop' },
          ...(product.subcategory ? [{ label: titleCase(product.subcategory), to: `/category/${isClothing ? 'clothing' : product.subcategory}${isClothing ? `?subcategory=${product.subcategory}` : ''}` }] : []),
          { label: product.title },
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
        <div className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <div className="aspect-square overflow-hidden rounded-2xl border border-border bg-muted">
            <img
              key={activeImage}
              src={images[activeImage]?.url}
              alt={product.title}
              className="h-full w-full animate-pop-in object-cover"
            />
          </div>
          {images.length > 1 && (
            <ul className="mt-3 grid grid-cols-5 gap-2.5 sm:grid-cols-6" aria-label="Product images">
              {images.map((image, index) => (
                <li key={image.publicId || index}>
                  <button
                    type="button"
                    onClick={() => setActiveImage(index)}
                    aria-label={`Show image ${index + 1} of ${images.length}`}
                    aria-current={activeImage === index}
                    className={`aspect-square w-full overflow-hidden rounded-lg border-2 bg-muted transition-[border-color,opacity] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                      activeImage === index ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={image.url} alt="" loading="lazy" className="h-full w-full object-cover" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{titleCase(product.subcategory || product.category)}</p>
          <h1 className="mt-1 text-3xl sm:text-4xl">{product.title}</h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            <Price value={product.price} className="text-2xl" />
            {product.rating > 0 && (
              <span className="num flex items-center gap-1.5 text-sm text-muted-foreground" aria-label={`Rated ${product.rating} out of 5`}>
                <Star className="h-4 w-4 fill-warning text-warning" aria-hidden="true" />
                <span className="font-semibold text-foreground">{product.rating}</span> / 5
              </span>
            )}
            <Badge variant={stockNote.tone}>{stockNote.text}</Badge>
          </div>

          <p className="mt-6 max-w-[62ch] leading-relaxed text-foreground/85">{product.description}</p>

          <div className="mt-8 space-y-6 rounded-2xl border border-border bg-card p-5 shadow-soft sm:p-6">
            {isClothing && (
              <div ref={sizeGroupRef}>
                <div className="mb-2.5 flex items-baseline justify-between">
                  <span id="size-label" className="text-sm font-medium">
                    Size{selectedSize && <span className="ml-1.5 font-normal text-muted-foreground">{selectedSize}</span>}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-labelledby="size-label" aria-invalid={sizeError || undefined}>
                  {(product.sizes || []).map((entry) => {
                    const selected = selectedSize === entry.size;
                    const soldOut = entry.stock === 0;
                    return (
                      <button
                        key={entry.size}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        disabled={soldOut}
                        onClick={() => selectSize(entry.size)}
                        title={soldOut ? `${entry.size} is sold out` : undefined}
                        className={`num h-11 min-w-[3rem] rounded-lg border px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card ${
                          selected
                            ? 'border-primary bg-primary text-primary-foreground'
                            : soldOut
                            ? 'cursor-not-allowed border-border text-muted-foreground/60 line-through'
                            : sizeError
                            ? 'border-destructive text-foreground hover:bg-muted'
                            : 'border-input hover:border-primary hover:bg-muted'
                        }`}
                      >
                        {entry.size}
                      </button>
                    );
                  })}
                </div>
                {sizeError && <p role="alert" className="mt-2 text-[0.8125rem] text-destructive">Please choose a size to continue.</p>}
              </div>
            )}

            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="mb-2.5 block text-sm font-medium">Quantity</span>
                <QuantityStepper
                  value={quantity}
                  onChange={(next) => setQuantity(Math.min(Math.max(next, 1), Math.max(available, 1)))}
                  max={isClothing && !selectedSize ? MAX_LINE_QUANTITY : Math.max(available, 1)}
                />
              </div>
              <div className="text-right">
                <span className="block text-sm text-muted-foreground">Total</span>
                <Price value={product.price * quantity} className="text-2xl" />
              </div>
            </div>

            <Button size="lg" className="w-full" onClick={handleAddToCart} disabled={outOfStock} aria-live="polite">
              <AddIcon className="h-[1.125rem] w-[1.125rem]" />
              {addLabel}
            </Button>

            <ul className="grid gap-3 border-t border-border pt-5 text-sm text-muted-foreground sm:grid-cols-3">
              <li className="flex items-center gap-2.5"><Truck className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />Free shipping</li>
              <li className="flex items-center gap-2.5"><Banknote className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />Cash on delivery</li>
              <li className="flex items-center gap-2.5"><RotateCcw className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />14-day returns</li>
            </ul>
          </div>

          <Accordion type="multiple" defaultValue={['details']} className="mt-8 border-t border-border">
            <AccordionItem value="details">
              <AccordionTrigger>Product details</AccordionTrigger>
              <AccordionContent>
                <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5 text-sm">
                  <dt className="text-muted-foreground">Category</dt>
                  <dd className="text-right capitalize text-foreground">{product.category}</dd>
                  {product.subcategory && (<><dt className="text-muted-foreground">Type</dt><dd className="text-right text-foreground">{titleCase(product.subcategory)}</dd></>)}
                  {isClothing && product.gender && (<><dt className="text-muted-foreground">For</dt><dd className="text-right capitalize text-foreground">{product.gender}</dd></>)}
                  {product.rating > 0 && (<><dt className="text-muted-foreground">Rating</dt><dd className="num text-right text-foreground">{product.rating} / 5</dd></>)}
                </dl>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="shipping">
              <AccordionTrigger>Shipping and returns</AccordionTrigger>
              <AccordionContent>
                Free shipping across India with no minimum order. Orders typically arrive in 5–7 business days.
                Unused items can be returned within 14 days of delivery.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* Mobile purchase bar keeps the primary action in reach while scrolling */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 p-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-4">
          <div className="min-w-0">
            <p className="truncate text-xs text-muted-foreground">{product.title}</p>
            <Price value={product.price * quantity} className="text-lg" />
          </div>
          <Button className="ml-auto flex-1 sm:flex-none sm:px-10" onClick={handleAddToCart} disabled={outOfStock}>
            <AddIcon className="h-4 w-4" />
            {addLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
