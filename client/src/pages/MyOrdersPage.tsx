import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Package, MapPin, ShoppingBag, ChevronRight, Clock, CheckCircle, Truck, ChefHat } from 'lucide-react';
import api from '../lib/api';
import { useAuthStore } from '../store/auth.store';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  RECEIVED:  { label: 'Recue',           color: 'bg-blue-100 text-blue-700',   icon: Clock },
  PREPARING: { label: 'En preparation',  color: 'bg-orange-100 text-orange-700', icon: ChefHat },
  READY:     { label: 'Prete a retirer', color: 'bg-purple-100 text-purple-700', icon: Package },
  DELIVERED: { label: 'Remise',          color: 'bg-green-100 text-green-700',  icon: CheckCircle },
};

export default function MyOrdersPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  if (!user) { navigate('/login'); return null; }

  const { data: orders, isLoading } = useQuery({
    queryKey: ['myOrders'],
    queryFn: async () => { const { data } = await api.get('/orders/my-orders'); return data; },
  });

  if (isLoading) return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
          <ShoppingBag size={24} className="text-green-600" /> Mes commandes
          <span className="text-sm font-normal text-gray-400 ml-2">{orders?.length || 0} commande(s)</span>
        </h1>

        {(!orders || orders.length === 0) && (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center border-2 border-transparent hover:border-orange-200 transition-all duration-300">
            <ShoppingBag size={48} className="text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 mb-6">Aucune commande pour l'instant.</p>
            <button onClick={() => navigate('/')}
              className="bg-green-600 text-white px-6 py-2.5 rounded-xl hover:bg-green-700 hover:shadow-lg hover:shadow-green-200 transition-all font-medium">
              Voir le catalogue
            </button>
          </div>
        )}

        <div className="space-y-4">
          {orders?.map((order: any) => {
            const st = STATUS_CONFIG[order.status] || STATUS_CONFIG.RECEIVED;
            const Icon = st.icon;
            return (
              <div key={order.id}
                className="bg-white rounded-2xl shadow-sm p-6 border-2 border-transparent hover:border-orange-200 hover:shadow-orange-100 hover:shadow-md transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-bold text-gray-800 text-sm">#{order.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-sm text-green-600 font-medium mt-0.5">{order.shop?.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <p className="text-green-600 font-bold text-lg">{order.totalAmount.toFixed(2)} €</p>
                    <span className={`flex items-center gap-1 text-xs px-3 py-1 rounded-full font-medium ${st.color}`}>
                      <Icon size={12} /> {st.label}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="flex items-center gap-1 mb-4">
                  {['RECEIVED','PREPARING','READY','DELIVERED'].map((s, i) => {
                    const steps = ['RECEIVED','PREPARING','READY','DELIVERED'];
                    const current = steps.indexOf(order.status);
                    const isActive = i <= current;
                    return (
                      <div key={s} className={`flex-1 h-1.5 rounded-full transition-all ${isActive ? 'bg-green-500' : 'bg-gray-200'}`} />
                    );
                  })}
                </div>

                <div className="border-t border-gray-50 pt-4 space-y-2">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-1">
                        <ChevronRight size={12} className="text-gray-300" />
                        {item.product?.name} × {item.quantity}
                      </span>
                      <span className="text-gray-700 font-medium">{(item.unitPrice * item.quantity).toFixed(2)} €</span>
                    </div>
                  ))}
                </div>

                {order.pickupPoint && (
                  <div className="border-t border-gray-50 pt-3 mt-3 flex items-start gap-2">
                    <MapPin size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-500">
                      <span className="font-medium">{order.pickupPoint.name}</span> — {order.pickupPoint.address}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
