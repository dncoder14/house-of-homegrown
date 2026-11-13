import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { useTheme } from '../context/ThemeContext';
import usePageTitle from '../hooks/usePageTitle';

const NotFound = () => {
  const { isDark } = useTheme();
  usePageTitle('Page not found');

  return (
    <div className={`min-h-[60vh] ${isDark ? 'bg-background' : 'bg-earth-cream/30'} flex items-center justify-center px-4`}>
      <div className="text-center">
        <h1 className={`text-6xl font-bold ${isDark ? 'text-white' : 'text-earth-brown'} mb-2`}>404</h1>
        <p className={`${isDark ? 'text-white/70' : 'text-earth-brown/70'} mb-6`}>We couldn't find the page you were looking for.</p>
        <Link to="/shop"><Button size="lg">Continue Shopping</Button></Link>
      </div>
    </div>
  );
};

export default NotFound;
