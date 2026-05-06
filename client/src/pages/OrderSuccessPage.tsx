import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ShoppingBag, Home } from 'lucide-react';
import { useCartStore } from '../store/cart.store';

export default function OrderSuccessPage() {
  const clear = useCartStore(s => s.clear);
  useEffect(() => { clear(); }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm p-12 max-w-md text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={36} className="text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Commande confirmee !</h1>
        <p className="text-gray-500 mb-8">Votre commande a ete recue. Le vendeur va la preparer pour vous.</p>
        <div className="flex flex-col gap-3">
          <Link to="/my-orders" className="flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 font-medium transition-colors">
            <ShoppingBag size={18} /> Voir mes commandes
          </Link>
          <Link to="/" className="flex items-center justify-center gap-2 text-gray-500 hover:text-gray-700 py-2 transition-colors">
            <Home size={18} /> Retour au catalogue
          </Link>
        </div>
      </div>
    </div>
  );
}
