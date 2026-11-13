import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Check } from 'lucide-react';
import { Card, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { isDark } = useTheme();
  const [isAdded, setIsAdded] = useState(false);
  const navigate = useNavigate();
  const isClothing = product.category === 'clothing';
  const outOfStock = isClothing ? product.totalStock === 0 : (product.stock ?? 0) === 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (outOfStock) return;

    let size = '';
    if (isClothing) {
      const sizes = (product.sizes || []).filter((s) => s.stock > 0);
      if (sizes.length !== 1) {
        toast('Please choose a size', { icon: '👕' });
        navigate(`/product/${product.id}`);
        return;
      }
      size = sizes[0].size;
    }

    const result = addToCart(product, 1, size);
    if (!result.ok) {
      toast.error(result.reason === 'out_of_stock' ? 'This item is out of stock' : `Maximum available (${result.available}) already in your cart`);
      return;
    }
    setIsAdded(true);
    toast.success(`${product.title} added to cart!`);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <Link to={`/product/${product.id}`}>
      <Card className="group hover:shadow-lg transition-shadow duration-300 overflow-hidden bg-card border-border">
        <div className="aspect-square overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <CardContent className="p-3 md:p-4">
          <div className="flex items-center justify-between mb-1 md:mb-2">
            <Badge variant="secondary" className="text-xs">
              {product.category}
            </Badge>
            {product.rating > 0 && (
              <div className="flex items-center space-x-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-muted-foreground">{product.rating}</span>
              </div>
            )}
          </div>
          <h3 className="font-semibold text-sm md:text-base mb-1 md:mb-2 line-clamp-2 text-card-foreground leading-tight">{product.title}</h3>
          <p className="text-xs text-muted-foreground mb-2 md:mb-3 line-clamp-2 hidden md:block">{product.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-base md:text-lg font-bold text-earth-terracotta">₹{product.price}</span>
            {outOfStock ? (
              <span className="text-xs text-red-600">Out of stock</span>
            ) : !isClothing && product.stock < 10 ? (
              <span className="text-xs text-orange-600">Only {product.stock} left</span>
            ) : null}
          </div>
        </CardContent>
        <CardFooter className="p-3 md:p-4 pt-0">
          <Button
            onClick={handleAddToCart}
            disabled={outOfStock}
            className={`w-full transition-all duration-300 text-xs md:text-sm py-2 ${
              isAdded 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : ''
            }`}
            size="sm"
          >
            {isAdded ? (
              <>
                <Check className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                Added!
              </>
            ) : outOfStock ? (
              'Out of Stock'
            ) : (
              <>
                <ShoppingCart className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                {isClothing && (product.sizes || []).filter((s) => s.stock > 0).length !== 1 ? 'Select Size' : 'Add to Cart'}
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default ProductCard;