import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cart.store';
import { useAuthStore } from '../store/auth.store';
import api from '../lib/api';

export default function CheckoutPage() {
  const { items, total } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!user) {
    navigate('/login');
    return null;
  }

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleCheckout = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/orders/checkout', {
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
        pickupPointId: null,
      });
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du paiement');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-green-700 mb-6">💳 Finaliser la commande</h1>
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="font-semibold text-gray-700 mb-4">Récapitulatif</h2>
        {items.map((item) => (
          <div key={item.productId} className="flex justify-between py-2 border-b last:border-0">
            <span>{item.name} × {item.quantity}</span>
            <span className="font-semibold">{(item.price * item.quantity).toFixed(2)} €</span>
          </div>
        ))}
        <div className="flex justify-between mt-4 text-lg font-bold">
          <span>Total</span>
          <span className="text-green-600">{total().toFixed(2)} €</span>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="font-semibold text-gray-700 mb-2">Acheteur</h2>
        <p className="text-gray-600">{user.firstName} {user.lastName}</p>
        <p className="text-gray-600">{user.email}</p>
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <button onClick={handleCheckout} disabled={loading}
        className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold text-lg">
        {loading ? 'Redirection vers Stripe...' : '💳 Payer maintenant'}
      </button>
    </div>
  );
}