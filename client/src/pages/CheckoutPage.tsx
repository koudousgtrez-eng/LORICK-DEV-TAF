import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useCartStore } from '../store/cart.store';
import { useAuthStore } from '../store/auth.store';
import { CreditCard, MapPin, User, ShoppingBag, ArrowLeft } from 'lucide-react';
import api from '../lib/api';

export default function CheckoutPage() {
  const { items, total, clear } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pickupPointId, setPickupPointId] = useState('');

  if (!user) { navigate('/login'); return null; }
  if (items.length === 0) { navigate('/cart'); return null; }

  // Récupérer les points de retrait du shop du premier item
  const shopId = items[0]?.shopId;
  const { data: shopData } = useQuery({
    queryKey: ['shopPickup', shopId],
    queryFn: async () => { const { data } = await api.get(`/shops/${shopId}`); return data; },
    enabled: !!shopId,
  });

  const handleCheckout = async () => {
    if (!pickupPointId && shopData?.pickupPoints?.length > 0) {
      setError('Veuillez sélectionner un point de retrait.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/orders/checkout', {
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
        pickupPointId: pickupPointId || shopData?.pickupPoints?.[0]?.id || null,
      });
      if (data.url) {
        window.location.href = data.url;
      } else {
        clear();
        navigate('/order-success');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du paiement');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button onClick={() => navigate('/cart')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-600 transition-colors mb-6">
          <ArrowLeft size={16} /> Retour au panier
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
          <ShoppingBag size={24} className="text-green-600" /> Finaliser la commande
        </h1>

        {/* Récapitulatif */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
          <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <ShoppingBag size={16} className="text-green-600" /> Récapitulatif
          </h2>
          {items.map((item) => (
            <div key={item.productId} className="flex items-center gap-3 py-2.5 border-b last:border-0">
              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                {item.photo && <img src={item.photo} alt={item.name} className="w-full h-full object-cover" />}
              </div>
              <span className="flex-1 text-sm text-gray-700">{item.name} × {item.quantity}</span>
              <span className="font-semibold text-sm">{(item.price * item.quantity).toFixed(2)} €</span>
            </div>
          ))}
          <div className="flex justify-between mt-4 pt-3 border-t">
            <span className="font-bold text-gray-900">Total</span>
            <span className="text-xl font-bold text-green-600">{total().toFixed(2)} €</span>
          </div>
        </div>

        {/* Point de retrait */}
        {shopData?.pickupPoints?.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
            <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <MapPin size={16} className="text-green-600" /> Point de retrait
            </h2>
            <div className="space-y-2">
              {shopData.pickupPoints.map((pp: any) => (
                <label key={pp.id} className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${pickupPointId === pp.id ? 'border-green-500 bg-green-50' : 'border-gray-100 hover:border-green-200'}`}>
                  <input type="radio" name="pickup" value={pp.id} checked={pickupPointId === pp.id}
                    onChange={() => setPickupPointId(pp.id)} className="mt-0.5 accent-green-600" />
                  <div>
                    <p className="font-medium text-sm text-gray-800">{pp.name}</p>
                    <p className="text-xs text-gray-500">{pp.address}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Acheteur */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <User size={16} className="text-green-600" /> Vos coordonnées
          </h2>
          <p className="text-gray-700 font-medium">{user.firstName} {user.lastName}</p>
          <p className="text-gray-500 text-sm">{user.email}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-4">{error}</div>
        )}

        <button onClick={handleCheckout} disabled={loading}
          className="w-full bg-green-600 text-white py-4 rounded-xl hover:bg-green-700 disabled:opacity-50 font-semibold text-base flex items-center justify-center gap-2 transition-colors shadow-sm">
          <CreditCard size={20} />
          {loading ? 'Redirection...' : 'Payer maintenant'}
        </button>

        <p className="text-center text-xs text-gray-400 mt-4">Paiement sécurisé via Stripe</p>
      </div>
    </div>
  );
}
