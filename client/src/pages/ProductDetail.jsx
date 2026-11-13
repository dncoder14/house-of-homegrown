import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, ArrowLeft, Plus, Minus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useCart, getVariantStock, MAX_LINE_QUANTITY } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { productsAPI } from '../utils/api';
import toast from 'react-hot-toast';
import usePageTitle from '../hooks/usePageTitle';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { isDark } = useTheme();

  usePageTitle(product?.title);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getById(id);
      setProduct(response.data);
      setActiveImage(0);
      setQuantity(1);
      const sizes = response.data.sizes || [];
      setSelectedSize(response.data.category === 'clothing' && sizes.length === 1 ? sizes[0].size : '');
    } catch (error) {
      console.error('Error fetching product:', error);
      navigate('/shop');
    } finally {
      setLoading(false);
    }
  };

  const isClothing = product?.category === 'clothing';
  const available = product ? Math.min(getVariantStock(product, selectedSize), MAX_LINE_QUANTITY) : 0;
  const outOfStock = product ? (isClothing ? product.totalStock === 0 : (product.stock ?? 0) === 0) : false;

  const selectSize = (size) => {
    setSelectedSize(size);
    setQuantity(1);
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (isClothing && !selectedSize) {
      toast.error('Please select a size');
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
      : `${quantity} × ${product.title}${selectedSize ? ` (${selectedSize})` : ''} added to cart!`);
    setQuantity(1);
    setIsAdding(true);
    setTimeout(() => setIsAdding(false), 600);
  };

  const incrementQuantity = () => {
    if (quantity < available) setQuantity((prev) => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) setQuantity((prev) => prev - 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-earth-terracotta"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-earth-brown mb-4">Product not found</h2>
          <Button onClick={() => navigate('/shop')}>Back to Shop</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-background' : 'bg-earth-cream/30'}`}>
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className={`mb-6 ${isDark ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-earth-brown hover:text-earth-terracotta hover:bg-earth-cream'}`}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className={`aspect-square overflow-hidden rounded-lg ${isDark ? 'bg-card' : 'bg-white'}`}>
              <img
                src={product.images?.[activeImage]?.url || product.imageUrl}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images?.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((image, index) => (
                  <button
                    key={image.publicId || index}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    aria-label={`Show image ${index + 1}`}
                    className={`aspect-square overflow-hidden rounded-md border-2 ${activeImage === index ? 'border-earth-terracotta' : 'border-transparent opacity-70 hover:opacity-100'}`}
                  >
                    <img src={image.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className={`${isDark ? 'bg-white/10 text-white' : 'bg-earth-beige text-earth-brown'}`}>{product.category}</Badge>
                {product.rating > 0 && (
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className={`text-sm ${isDark ? 'text-white/70' : 'text-earth-brown/70'}`}>{product.rating}</span>
                  </div>
                )}
              </div>
              <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-earth-brown'} mb-4`}>{product.title}</h1>
              <p className="text-2xl font-bold text-earth-terracotta mb-4">₹{product.price}</p>
              {outOfStock ? (
                <p className="text-red-500 font-medium">Out of stock</p>
              ) : !isClothing && product.stock < 10 ? (
                <p className="text-orange-400 font-medium">Only {product.stock} left in stock</p>
              ) : isClothing && selectedSize && available < 5 ? (
                <p className="text-orange-400 font-medium">Only {available} left in size {selectedSize}</p>
              ) : null}
            </div>

            <div>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-earth-brown'} mb-2`}>Description</h3>
              <p className={`${isDark ? 'text-white/80' : 'text-earth-brown/80'} leading-relaxed`}>{product.description}</p>
            </div>

            <Card className={`${isDark ? 'bg-card border-border' : 'bg-white border-earth-beige'}`}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {isClothing && (
                    <div>
                      <label className={`text-sm font-medium ${isDark ? 'text-white' : 'text-earth-brown'} mb-2 block`}>
                        Size{selectedSize ? `: ${selectedSize}` : ''}
                      </label>
                      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Size">
                        {(product.sizes || []).map((entry) => (
                          <button
                            key={entry.size}
                            type="button"
                            role="radio"
                            aria-checked={selectedSize === entry.size}
                            disabled={entry.stock === 0}
                            onClick={() => selectSize(entry.size)}
                            className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors ${
                              selectedSize === entry.size
                                ? 'bg-earth-terracotta text-white border-earth-terracotta'
                                : entry.stock === 0
                                ? 'line-through opacity-40 cursor-not-allowed border-earth-brown/20'
                                : isDark
                                ? 'border-white/30 text-white hover:border-earth-terracotta'
                                : 'border-earth-brown/30 text-earth-brown hover:border-earth-terracotta'
                            }`}
                          >
                            {entry.size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <label className={`text-sm font-medium ${isDark ? 'text-white' : 'text-earth-brown'} mb-2 block`}>Quantity</label>
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={decrementQuantity}
                        disabled={quantity <= 1}
                        className={`${isDark ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' : 'bg-earth-cream border-earth-brown/20 text-earth-brown hover:bg-earth-beige'}`}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className={`text-lg font-medium w-12 text-center ${isDark ? 'text-white' : 'text-earth-brown'}`}>{quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={incrementQuantity}
                        disabled={quantity >= available}
                        className={`${isDark ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' : 'bg-earth-cream border-earth-brown/20 text-earth-brown hover:bg-earth-beige'}`}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className={`pt-4 border-t ${isDark ? 'border-white/10' : 'border-earth-beige'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-lg font-medium ${isDark ? 'text-white' : 'text-earth-brown'}`}>Total:</span>
                      <span className="text-2xl font-bold text-earth-terracotta">
                        ₹{(product.price * quantity).toLocaleString()}
                      </span>
                    </div>
                    
                    <Button
                      onClick={handleAddToCart}
                      disabled={outOfStock}
                      className={`w-full transition-all duration-300 ${isAdding ? 'scale-95 bg-green-600 hover:bg-green-600' : ''}`}
                      size="lg"
                    >
                      <ShoppingCart className={`h-5 w-5 mr-2 transition-transform duration-300 ${isAdding ? 'scale-110' : ''}`} />
                      {outOfStock ? 'Out of Stock' : isAdding ? 'Added!' : 'Add to Cart'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`${isDark ? 'bg-card border-border' : 'bg-white border-earth-beige'}`}>
              <CardContent className="p-6">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-earth-brown'} mb-4`}>Product Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className={`${isDark ? 'text-white/70' : 'text-earth-brown/70'}`}>Category:</span>
                    <span className={`capitalize ${isDark ? 'text-white' : 'text-earth-brown'}`}>{product.category}</span>
                  </div>
                  {product.rating > 0 && (
                    <div className="flex justify-between">
                      <span className={`${isDark ? 'text-white/70' : 'text-earth-brown/70'}`}>Rating:</span>
                      <span className={`${isDark ? 'text-white' : 'text-earth-brown'}`}>{product.rating}/5</span>
                    </div>
                  )}
                  {!isClothing && product.stock > 0 && (
                    <div className="flex justify-between">
                      <span className={`${isDark ? 'text-white/70' : 'text-earth-brown/70'}`}>Stock:</span>
                      <span className={`${isDark ? 'text-white' : 'text-earth-brown'}`}>{product.stock} units</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;