import { Link } from 'react-router-dom';

const CategoryTile = ({ name, image, to }) => (
  <Link
    to={to}
    className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-soft transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lift"
  >
    <img src={image} alt="" loading="lazy" className="h-16 w-16 object-contain transition-transform duration-300 ease-out group-hover:scale-110 sm:h-[4.5rem] sm:w-[4.5rem]" />
    <span className="text-center text-sm font-semibold leading-tight">{name}</span>
  </Link>
);

export default CategoryTile;
