import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Map, BookOpen, LogOut, User, Store, LayoutDashboard, Leaf, Menu, X } from 'lucide-react';
import { useAuthStore } from '../store/auth.store';
import { useCartStore } from '../store/cart.store';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const items = useCartStore(s => s.items);
  const navigate = useNavigate();
  const location = useLocation();
  const cartCount = items.reduce((s, i) => s + i.quantity, 0);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); setMenuOpen(false); };
  const isActive = (path: string) => location.pathname === path ? 'text-green-600 font-semibold' : 'text-gray-600 hover:text-green-600';
  const navLink = (to: string, icon: any, label: string) => (
    <Link to={to} onClick={() => setMenuOpen(false)}
      className={`flex items-center gap-2 text-sm transition-colors py-2 md:py-0 ${isActive(to)}`}>
      {icon} {label}
    </Link>
  );

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group flex-shrink-0" onClick={() => setMenuOpen(false)}>
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center group-hover:bg-green-700 transition-colors">
            <Leaf size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">Eco<span className="text-green-600">Market</span></span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLink('/', <BookOpen size={16} />, 'Catalogue')}
          {navLink('/map', <Map size={16} />, 'Carte')}
          {user?.role === 'SELLER' && navLink('/seller', <Store size={16} />, 'Mon espace')}
          {user?.role === 'ADMIN' && navLink('/admin', <LayoutDashboard size={16} />, 'Admin')}
          <Link to="/cart" className="relative flex items-center gap-1.5 text-sm text-gray-600 hover:text-green-600 transition-colors">
            <ShoppingCart size={18} />
            {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">{cartCount}</span>}
          </Link>
          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/my-orders" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-green-600 transition-colors">
                <User size={16} /><span>{user.firstName}</span>
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 transition-colors">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-sm text-gray-600 hover:text-green-600 transition-colors px-3 py-1.5">Connexion</Link>
              <Link to="/register" className="text-sm bg-green-600 text-white px-4 py-1.5 rounded-lg hover:bg-green-700 transition-colors font-medium">S'inscrire</Link>
            </div>
          )}
        </div>

        {/* Mobile : panier + burger */}
        <div className="flex md:hidden items-center gap-3">
          <Link to="/cart" className="relative text-gray-600">
            <ShoppingCart size={22} />
            {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">{cartCount}</span>}
          </Link>
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-600 hover:text-green-600 transition-colors">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-1 shadow-lg">
          {navLink('/', <BookOpen size={16} />, 'Catalogue')}
          {navLink('/map', <Map size={16} />, 'Carte')}
          {user?.role === 'SELLER' && navLink('/seller', <Store size={16} />, 'Mon espace vendeur')}
          {user?.role === 'ADMIN' && navLink('/admin', <LayoutDashboard size={16} />, 'Administration')}
          {user ? (
            <>
              <Link to="/my-orders" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-600 py-2">
                <User size={16} /> {user.firstName} — Mes commandes
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-red-400 hover:text-red-600 py-2 w-full">
                <LogOut size={16} /> Se deconnecter
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Link to="/login" onClick={() => setMenuOpen(false)} className="text-center text-sm border border-green-600 text-green-600 px-4 py-2.5 rounded-xl hover:bg-green-50 transition-colors font-medium">Connexion</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="text-center text-sm bg-green-600 text-white px-4 py-2.5 rounded-xl hover:bg-green-700 transition-colors font-medium">S'inscrire</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
