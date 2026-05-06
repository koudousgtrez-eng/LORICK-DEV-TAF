import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cart.store';
import { useEffect } from 'react';

export default function OrderSuccessPage() {
  const navigate = useNavigate();
  const clear = useCartStore((s) => s.clear);

  useEffect(() => {
    clear();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow p-10 text-center max-w-md">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-green-700 mb-2">Commande confirmée !</h1>
        <p className="text-gray-600 mb-6">Vous recevrez un email de confirmation. Merci pour votre achat !</p>
        <button onClick={() => navigate('/')}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
          Retour au catalogue
        </button>
      </div>
    </div>
  );
}