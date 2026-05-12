import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Store, Package, ShoppingBag, TrendingUp, Plus, X, Eye, EyeOff, ChevronDown } from 'lucide-react';
import api from '../lib/api';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  RECEIVED: { label: 'Reçue', color: 'bg-blue-100 text-blue-700' },
  PREPARING: { label: 'En préparation', color: 'bg-orange-100 text-orange-700' },
  READY: { label: 'Prête', color: 'bg-purple-100 text-purple-700' },
  DELIVERED: { label: 'Remise', color: 'bg-green-100 text-green-700' },
};

export default function SellerDashboard() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', category: '', price: '', unit: 'pièce', stock: '' });

  const { data: shop } = useQuery({ queryKey: ['myShop'], queryFn: async () => { const { data } = await api.get('/shops/me/shop'); return data; } });
  const { data: orders } = useQuery({ queryKey: ['sellerOrders'], queryFn: async () => { const { data } = await api.get('/orders/seller-orders'); return data; } });

  const createProduct = useMutation({
    mutationFn: async (d: any) => { await api.post('/products', d); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['myShop'] }); setShowForm(false); setForm({ name: '', description: '', category: '', price: '', unit: 'pièce', stock: '' }); },
  });

  const togglePublish = useMutation({
    mutationFn: async (id: string) => { await api.patch(`/products/${id}/toggle`); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myShop'] }),
  });

  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => { await api.patch(`/orders/${orderId}/status`, { status }); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sellerOrders'] }),
  });

  const ca = orders?.reduce((s: number, o: any) => s + o.totalAmount, 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
            <Store size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Espace Vendeur</h1>
            <p className="text-sm text-gray-500">{shop?.name || 'Ma boutique'}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { icon: Package, label: 'Produits', value: shop?.products?.length || 0, color: 'text-blue-600 bg-blue-50' },
            { icon: ShoppingBag, label: 'Commandes', value: orders?.length || 0, color: 'text-purple-600 bg-purple-50' },
            { icon: TrendingUp, label: "Chiffre d'affaires", value: `${ca.toFixed(2)} €`, color: 'text-green-600 bg-green-50' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl shadow-sm p-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                <Icon size={20} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-400">{label}</p>
            </div>
          ))}
        </div>

        {/* Produits */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2"><Package size={18} className="text-green-600" /> Mes produits</h2>
            <button onClick={() => setShowForm(!showForm)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${showForm ? 'bg-gray-100 text-gray-600' : 'bg-green-600 text-white hover:bg-green-700'}`}>
              {showForm ? <><X size={15} /> Annuler</> : <><Plus size={15} /> Ajouter</>}
            </button>
          </div>

          {showForm && (
            <div className="bg-gray-50 rounded-xl p-5 mb-6 grid grid-cols-2 gap-4">
              {[
                { key: 'name', placeholder: 'Nom du produit', type: 'text' },
                { key: 'category', placeholder: 'Catégorie (ex: légumes)', type: 'text' },
                { key: 'price', placeholder: 'Prix (€)', type: 'number' },
                { key: 'stock', placeholder: 'Stock disponible', type: 'number' },
              ].map(({ key, placeholder, type }) => (
                <input key={key} type={type} placeholder={placeholder} value={(form as any)[key]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-300" required />
              ))}
              <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-300">
                {['pièce', 'kg', 'litre', 'barquette', 'botte', 'pot'].map(u => <option key={u} value={u}>{u.charAt(0).toUpperCase() + u.slice(1)}</option>)}
              </select>
              <input placeholder="Description (optionnel)" value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-300" />
              <button onClick={() => createProduct.mutate({ ...form, price: parseFloat(form.price), stock: parseInt(form.stock), photos: (form as any).imageUrl ? [(form as any).imageUrl] : [] })}
                disabled={createProduct.isPending}
                className="col-span-2 bg-green-600 text-white py-2.5 rounded-xl hover:bg-green-700 text-sm font-medium transition-colors disabled:opacity-50">
                {createProduct.isPending ? 'Création...' : 'Créer le produit'}
              </button>
            </div>
          )}

          <div className="space-y-2">
            {shop?.products?.map((product: any) => (
              <div key={product.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
                <div className="flex-1">
                  <p className="font-medium text-gray-800 text-sm">{product.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{product.price} € / {product.unit} · Stock : {product.stock}</p>
                </div>
                <button onClick={() => togglePublish.mutate(product.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${product.isPublished ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                  {product.isPublished ? <><Eye size={13} /> En ligne</> : <><EyeOff size={13} /> Hors ligne</>}
                </button>
              </div>
            ))}
            {(!shop?.products || shop.products.length === 0) && (
              <div className="text-center py-8 text-gray-400">
                <Package size={36} className="mx-auto mb-2 text-gray-200" />
                <p className="text-sm">Aucun produit. Ajoutez-en un !</p>
              </div>
            )}
          </div>
        </div>

        {/* Commandes */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2"><ShoppingBag size={18} className="text-green-600" /> Commandes reçues</h2>
          <div className="space-y-3">
            {orders?.map((order: any) => {
              const st = STATUS_LABELS[order.status] || STATUS_LABELS.RECEIVED;
              return (
                <div key={order.id} className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-semibold text-sm text-gray-800">#{order.id.slice(0, 8).toUpperCase()}</span>
                      <p className="text-xs text-gray-400 mt-0.5">{order.buyer?.firstName} {order.buyer?.lastName}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-green-600">{order.totalAmount.toFixed(2)} €</span>
                      <span className={`block text-xs px-2 py-0.5 rounded-full mt-1 ${st.color}`}>{st.label}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <ChevronDown size={14} className="text-gray-400" />
                    <select value={order.status}
                      onChange={e => updateOrderStatus.mutate({ orderId: order.id, status: e.target.value })}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:ring-1 focus:ring-green-300">
                      <option value="RECEIVED">Reçue</option>
                      <option value="PREPARING">En préparation</option>
                      <option value="READY">Prête</option>
                      <option value="DELIVERED">Remise</option>
                    </select>
                  </div>
                </div>
              );
            })}
            {(!orders || orders.length === 0) && (
              <div className="text-center py-8 text-gray-400">
                <ShoppingBag size={36} className="mx-auto mb-2 text-gray-200" />
                <p className="text-sm">Aucune commande pour l'instant.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
