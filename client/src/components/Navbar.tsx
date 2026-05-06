import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Map, BookOpen, LogOut, User, Store, LayoutDashboard, Leaf } from 'lucide-react';
import { useAuthStore } from '../store/auth.store';
import { useCartStore } from '../store/cart.store';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const items = useCartStore(s => s.items);
  const navigate = useNavigate();
  const location = useLocation();
  const cartCount = items.reduce((s, i) => s + i.quantity, 0);

  const handleLogout = () => { logout(); navigate('/'); };

  const isActive = (path: string) =>
    location.pathname === path ? 'text-green-600 font-semibold' : 'text-gray-600 hover:text-green-600';

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center group-hover:bg-green-700 transition-colors">
            <Leaf size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">Eco<span className="text-green-600">Market</span></span>
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/" className={`flex items-center gap-1.5 text-sm transition-colors ${isActive('/')}`}>
            <BookOpen size={16} /> Catalogue
          </Link>
          <Link to="/map" className={`flex items-center gap-1.5 text-sm transition-colors ${isActive('/map')}`}>
            <Map size={16} /> Carte
          </Link>

          {user?.role === 'SELLER' && (
            <Link to="/seller" className={`flex items-center gap-1.5 text-sm transition-colors ${isActive('/seller')}`}>
              <Store size={16} /> Mon espace
            </Link>
          )}
          {user?.role === 'ADMIN' && (
            <Link to="/admin" className={`flex items-center gap-1.5 text-sm transition-colors ${isActive('/admin')}`}>
              <LayoutDashboard size={16} /> Admin
            </Link>
          )}

          <Link to="/cart" className="relative flex items-center gap-1.5 text-sm text-gray-600 hover:text-green-600 transition-colors">
            <ShoppingCart size={18} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/my-orders" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-green-600 transition-colors">
                <User size={16} />
                <span className="hidden md:block">{user.firstName}</span>
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 transition-colors">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-sm text-gray-600 hover:text-green-600 transition-colors px-3 py-1.5">
                Connexion
              </Link>
              <Link to="/register" className="text-sm bg-green-600 text-white px-4 py-1.5 rounded-lg hover:bg-green-700 transition-colors font-medium">
                S'inscrire
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
