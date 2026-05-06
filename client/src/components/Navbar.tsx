import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { useCartStore } from '../store/cart.store';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const cartCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-green-700">🌱 EcoMarket</Link>
        <div className="flex items-center gap-4">
          <Link to="/" className="text-gray-600 hover:text-green-600">Catalogue</Link>
          <Link to="/map" className="text-gray-600 hover:text-green-600">Carte</Link>
          <Link to="/cart" className="relative text-gray-600 hover:text-green-600">
            🛒
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          {user ? (
            <>
              {user.role === 'SELLER' && (
                <Link to="/seller" className="text-gray-600 hover:text-green-600">Mon espace</Link>
              )}
              <span className="text-gray-700 font-medium">{user.firstName}</span>
              <button onClick={handleLogout} className="bg-red-100 text-red-600 px-3 py-1 rounded-lg hover:bg-red-200">
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-600 hover:text-green-600">Connexion</Link>
              <Link to="/register" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                S'inscrire
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
