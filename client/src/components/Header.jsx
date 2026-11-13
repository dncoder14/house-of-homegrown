import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Menu, ChevronDown, Sun, Moon, User, Package, LayoutDashboard, LogOut, Truck } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetClose } from './ui/sheet';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './ui/accordion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { productsAPI } from '../utils/api';

const NAV_GROUPS = [
  {
    label: 'Indian Taste',
    to: '/category/indian-taste',
    items: [
      { to: '/category/indian-taste?subcategory=spices', label: 'Spices & Masalas' },
      { to: '/category/indian-taste?subcategory=tea', label: 'Tea & Beverages' },
      { to: '/category/indian-taste?subcategory=grains', label: 'Organic Grains' },
      { to: '/category/indian-taste?subcategory=pickles', label: 'Pickles & Preserves' },
      { to: '/category/indian-taste?subcategory=sweets', label: 'Traditional Sweets' },
    ],
  },
  {
    label: 'Clothing',
    to: '/category/clothing',
    items: [
      { to: '/category/clothing?subcategory=sarees', label: 'Sarees' },
      { to: '/category/clothing?subcategory=kurtas', label: 'Kurtas & Kurtis' },
      { to: '/category/clothing?subcategory=lehengas', label: 'Lehengas' },
      { to: '/category/clothing?subcategory=fabrics', label: 'Fabrics' },
    ],
  },
];

const titleCase = (value) => value.charAt(0).toUpperCase() + value.slice(1);

const navLinkClass = 'flex h-10 items-center gap-1 whitespace-nowrap rounded-lg px-2.5 xl:px-3 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground';

const SearchBox = ({ value, onChange, onSubmit, className, inputId }) => (
  <form onSubmit={onSubmit} role="search" className={className}>
    <label htmlFor={inputId} className="sr-only">Search products</label>
    <div className="relative">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
      <Input
        id={inputId}
        type="search"
        placeholder="Search products"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 rounded-full bg-muted pl-10 shadow-none"
      />
    </div>
  </form>
);

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { getTotalItems } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const itemCount = getTotalItems();

  useEffect(() => {
    productsAPI.getCategories()
      .then((response) => setCategories(response.data))
      .catch((error) => console.error('Error fetching categories:', error));
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [location.pathname, location.search]);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    navigate(`/shop?search=${encodeURIComponent(query)}`);
    setSearchQuery('');
    setMobileOpen(false);
  };

  const initial = (user?.name || 'U').trim().charAt(0).toUpperCase();

  return (
    <>
      <a
        href="#main"
        className="sr-only z-[100] rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>

      <div className="bg-foreground text-background dark:bg-secondary dark:text-secondary-foreground">
        <div className="page-container flex h-9 items-center justify-center gap-2 text-[0.8125rem] font-medium">
          <Truck className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden="true" />
          <p className="truncate">
            Free shipping across India<span className="hidden sm:inline"> · Cash on delivery · 14-day returns</span>
          </p>
        </div>
      </div>

      <header
        className={`sticky top-0 z-40 border-b bg-background/90 backdrop-blur-md transition-shadow duration-200 ${
          scrolled ? 'border-border shadow-soft' : 'border-transparent'
        }`}
      >
        <div className="page-container flex h-[4.25rem] items-center gap-3 lg:gap-4">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="-ml-2 lg:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[88%] max-w-sm overflow-y-auto p-0">
              <div className="border-b border-border px-5 py-4">
                <SheetTitle className="font-display text-xl font-normal">House of Homegrown</SheetTitle>
              </div>
              <div className="flex flex-col gap-5 px-5 pb-8">
                <SearchBox value={searchQuery} onChange={setSearchQuery} onSubmit={handleSearch} inputId="search-mobile" />

                <nav aria-label="Mobile">
                  <SheetClose asChild>
                    <Link to="/shop" className="flex h-12 items-center border-b border-border text-[0.9375rem] font-semibold">
                      Shop all
                    </Link>
                  </SheetClose>
                  <Accordion type="single" collapsible>
                    {NAV_GROUPS.map((group) => (
                      <AccordionItem key={group.label} value={group.label}>
                        <AccordionTrigger>{group.label}</AccordionTrigger>
                        <AccordionContent className="flex flex-col">
                          {group.items.map((item) => (
                            <SheetClose asChild key={item.to}>
                              <Link to={item.to} className="rounded-lg px-2 py-2.5 text-foreground/80 hover:bg-muted hover:text-foreground">
                                {item.label}
                              </Link>
                            </SheetClose>
                          ))}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                    <AccordionItem value="categories">
                      <AccordionTrigger>Categories</AccordionTrigger>
                      <AccordionContent className="flex flex-col">
                        {categories.map((category) => (
                          <SheetClose asChild key={category}>
                            <Link to={`/shop?category=${category}`} className="rounded-lg px-2 py-2.5 text-foreground/80 hover:bg-muted hover:text-foreground">
                              {titleCase(category)}
                            </Link>
                          </SheetClose>
                        ))}
                        <SheetClose asChild>
                          <Link to="/categories" className="rounded-lg px-2 py-2.5 font-semibold text-primary">View all categories</Link>
                        </SheetClose>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  <SheetClose asChild>
                    <Link to="/about" className="flex h-12 items-center border-b border-border text-[0.9375rem] font-semibold">Our story</Link>
                  </SheetClose>
                </nav>

                {isAuthenticated ? (
                  <div className="flex flex-col gap-1">
                    <p className="px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Signed in as {user?.name}</p>
                    <SheetClose asChild><Link to="/profile" className="flex h-11 items-center gap-3 rounded-lg px-2 hover:bg-muted"><User className="h-4 w-4 text-muted-foreground" />Profile</Link></SheetClose>
                    <SheetClose asChild><Link to="/orders" className="flex h-11 items-center gap-3 rounded-lg px-2 hover:bg-muted"><Package className="h-4 w-4 text-muted-foreground" />Orders</Link></SheetClose>
                    {isAdmin && (
                      <SheetClose asChild><Link to="/admin" className="flex h-11 items-center gap-3 rounded-lg px-2 hover:bg-muted"><LayoutDashboard className="h-4 w-4 text-muted-foreground" />Admin dashboard</Link></SheetClose>
                    )}
                    <button onClick={() => { logout(); setMobileOpen(false); }} className="flex h-11 items-center gap-3 rounded-lg px-2 text-left hover:bg-muted">
                      <LogOut className="h-4 w-4 text-muted-foreground" />Log out
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <SheetClose asChild><Button asChild variant="outline"><Link to="/login">Log in</Link></Button></SheetClose>
                    <SheetClose asChild><Button asChild><Link to="/signup">Sign up</Link></Button></SheetClose>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>

          <Link to="/" className="flex shrink-0 items-center gap-2.5" aria-label="House of Homegrown home">
            <img src="/logo.png" alt="" className="h-9 w-9 rounded-md" />
            <span className="hidden font-display text-[1.25rem] leading-none tracking-tight sm:inline lg:hidden xl:inline">House of Homegrown</span>
          </Link>

          <nav aria-label="Primary" className="hidden items-center lg:flex">
            <NavLink to="/shop" className={navLinkClass}>Shop</NavLink>
            {NAV_GROUPS.map((group) => (
              <div key={group.label} className="group relative">
                <Link to={group.to} className={navLinkClass} aria-haspopup="true">
                  {group.label}
                  <ChevronDown className="h-3.5 w-3.5 opacity-60 transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180" aria-hidden="true" />
                </Link>
                <div className="invisible absolute left-0 top-full z-50 pt-2 opacity-0 transition-[opacity,visibility] duration-150 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                  <ul className="w-56 rounded-xl border border-border bg-popover p-1.5 shadow-float">
                    {group.items.map((item) => (
                      <li key={item.to}>
                        <Link to={item.to} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/85 transition-colors hover:bg-muted hover:text-foreground">
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
            <div className="group relative">
              <Link to="/categories" className={navLinkClass} aria-haspopup="true">
                Categories
                <ChevronDown className="h-3.5 w-3.5 opacity-60 transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180" aria-hidden="true" />
              </Link>
              <div className="invisible absolute left-0 top-full z-50 pt-2 opacity-0 transition-[opacity,visibility] duration-150 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                <ul className="w-56 rounded-xl border border-border bg-popover p-1.5 shadow-float">
                  {categories.map((category) => (
                    <li key={category}>
                      <Link to={`/shop?category=${category}`} className="block rounded-lg px-3 py-2.5 text-sm font-medium capitalize text-foreground/85 transition-colors hover:bg-muted hover:text-foreground">
                        {category}
                      </Link>
                    </li>
                  ))}
                  <li className="mt-1 border-t border-border pt-1">
                    <Link to="/categories" className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-muted">
                      View all categories
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <NavLink to="/about" className={navLinkClass}>Our story</NavLink>
          </nav>

          <SearchBox
            value={searchQuery}
            onChange={setSearchQuery}
            onSubmit={handleSearch}
            inputId="search-desktop"
            className="ml-auto hidden w-full max-w-xs shrink-0 md:block lg:w-44 xl:w-52"
          />

          <div className="ml-auto flex items-center gap-1 md:ml-0">
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}>
              {isDark ? <Sun className="h-[1.125rem] w-[1.125rem]" /> : <Moon className="h-[1.125rem] w-[1.125rem]" />}
            </Button>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Account menu" className="hidden md:inline-flex">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{initial}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60">
                  <DropdownMenuLabel>
                    <span className="block font-semibold">{user?.name}</span>
                    <span className="block truncate text-xs font-normal text-muted-foreground">{user?.email}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => navigate('/profile')}><User />Profile</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => navigate('/orders')}><Package />Orders</DropdownMenuItem>
                  {isAdmin && <DropdownMenuItem onSelect={() => navigate('/admin')}><LayoutDashboard />Admin dashboard</DropdownMenuItem>}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={logout}><LogOut />Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden items-center gap-1 md:flex">
                <Button asChild variant="ghost" size="sm"><Link to="/login">Log in</Link></Button>
                <Button asChild size="sm"><Link to="/signup">Sign up</Link></Button>
              </div>
            )}

            <Button asChild variant="ghost" size="icon" className="relative">
              <Link to="/cart" aria-label={`Cart, ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}>
                <ShoppingBag className="h-[1.125rem] w-[1.125rem]" />
                {itemCount > 0 && (
                  <span className="num absolute right-0.5 top-0.5 flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-primary px-1 text-[0.6875rem] font-bold leading-none text-primary-foreground">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </Link>
            </Button>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
