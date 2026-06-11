import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import useCart from '../hooks/useCart';

export default function CartIcon() {
  const { itemCount } = useCart();
  return (
    <Link to="/cart" className="relative inline-flex items-center text-slate-300 hover:text-white transition-colors">
      <ShoppingCart size={22} />
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center
                         rounded-full bg-brand-500 text-[10px] font-bold text-white
                         animate-bounce-subtle">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </Link>
  );
}
