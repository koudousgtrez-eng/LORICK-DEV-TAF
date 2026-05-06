import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuthStore } from '../store/auth.store';

export default function MyOrdersPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  if (!user) { navigate('/login'); return null; }

  const { data: orders, isLoading } = useQuery({
    queryKey: ['myOrders'],
    queryFn: async () => {
      const { data } = await api.get('/orders/my-orders');
      return data;
    },
  });

  const statusLabel: Record<string, string> = {
    RECEIVED: '📥 Reçue',
    PREPARING: '👨‍🍳 En préparation',
    READY: '✅ Prête à retirer',
    DELIVERED: '🎉 Remise',
  };

  if (isLoading) return <div className="text-center py-16">Chargement...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-green-700 mb-6">📦 Mes commandes</h1>
      {(!orders || orders.length === 0) && (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">Aucune commande pour l'instant.</p>
          <button onClick={() => navigate('/')} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
            Voir le catalogue
          </button>
        </div>
      )}
      <div className="space-y-6">
        {orders?.map((order: any) => (
          <div key={order.id} className="bg-white rounded-xl shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-bold text-gray-800">Commande #{order.id.slice(0, 8)}</p>
                <p className="text-sm text-gray-500">{order.shop?.name}</p>
                <p className="text-sm text-gray-400">{new Date(order.createdAt).toLocaleDateString('fr-FR')}</p>
              </div>
              <div className="text-right">
                <p className="text-green-600 font-bold text-lg">{order.totalAmount} €</p>
                <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  {statusLabel[order.status] || order.status}
                </span>
              </div>
            </div>
            <div className="border-t pt-4 space-y-2">
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex justify-between text-sm text-gray-600">
                  <span>{item.product?.name} × {item.quantity}</span>
                  <span>{(item.unitPrice * item.quantity).toFixed(2)} €</span>
                </div>
              ))}
            </div>
            {order.pickupPoint && (
              <div className="border-t pt-3 mt-3">
                <p className="text-sm text-gray-500">📍 Retrait : {order.pickupPoint.name} — {order.pickupPoint.address}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
