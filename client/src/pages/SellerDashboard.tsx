import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../lib/api';

export default function SellerDashboard() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', category: '', price: '',
    unit: 'pièce', stock: '', nutritionalInfo: '',
  });

  const { data: shop } = useQuery({
    queryKey: ['myShop'],
    queryFn: async () => {
      const { data } = await api.get('/shops/me/shop');
      return data;
    },
  });

  const { data: orders } = useQuery({
    queryKey: ['sellerOrders'],
    queryFn: async () => {
      const { data } = await api.get('/orders/seller-orders');
      return data;
    },
  });

  const createProduct = useMutation({
    mutationFn: async (productData: any) => {
      await api.post('/products', productData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myShop'] });
      setShowForm(false);
      setForm({ name: '', description: '', category: '', price: '', unit: 'pièce', stock: '', nutritionalInfo: '' });
    },
  });

  const togglePublish = useMutation({
    mutationFn: async (productId: string) => {
      await api.patch(`/products/${productId}/toggle`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myShop'] }),
  });

  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      await api.patch(`/orders/${orderId}/status`, { status });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sellerOrders'] }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProduct.mutate({
      ...form,
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-green-700 mb-8">🏪 Espace Vendeur</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{shop?.products?.length || 0}</p>
          <p className="text-gray-500 text-sm">Produits</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{orders?.length || 0}</p>
          <p className="text-gray-500 text-sm">Commandes</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-2xl font-bold text-green-600">
            {orders?.reduce((s: number, o: any) => s + o.totalAmount, 0).toFixed(2) || '0.00'} €
          </p>
          <p className="text-gray-500 text-sm">Chiffre d'affaires</p>
        </div>
      </div>

      {/* Produits */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Mes produits</h2>
          <button onClick={() => setShowForm(!showForm)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
            {showForm ? 'Annuler' : '+ Ajouter un produit'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <input placeholder="Nom du produit" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="border rounded-lg px-3 py-2" required />
            <input placeholder="Catégorie" value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              className="border rounded-lg px-3 py-2" required />
            <input type="number" placeholder="Prix (€)" value={form.price}
              onChange={e => setForm({ ...form, price: e.target.value })}
              className="border rounded-lg px-3 py-2" required />
            <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}
              className="border rounded-lg px-3 py-2">
              <option value="pièce">Pièce</option>
              <option value="kg">Kg</option>
              <option value="litre">Litre</option>
              <option value="barquette">Barquette</option>
            </select>
            <input type="number" placeholder="Stock" value={form.stock}
              onChange={e => setForm({ ...form, stock: e.target.value })}
              className="border rounded-lg px-3 py-2" required />
            <input placeholder="Description" value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="border rounded-lg px-3 py-2" />
            <button type="submit" className="col-span-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
              Créer le produit
            </button>
          </form>
        )}

        <div className="space-y-3">
          {shop?.products?.map((product: any) => (
            <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-semibold">{product.name}</p>
                <p className="text-sm text-gray-500">{product.price} € / {product.unit} — Stock: {product.stock}</p>
              </div>
              <button onClick={() => togglePublish.mutate(product.id)}
                className={`px-3 py-1 rounded-full text-sm font-medium ${product.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                {product.isPublished ? '✅ En ligne' : '⏸ Hors ligne'}
              </button>
            </div>
          ))}
          {(!shop?.products || shop.products.length === 0) && (
            <p className="text-gray-500 text-center py-4">Aucun produit. Ajoutez-en un !</p>
          )}
        </div>
      </div>

      {/* Commandes */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">Commandes reçues</h2>
        <div className="space-y-4">
          {orders?.map((order: any) => (
            <div key={order.id} className="border rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <span className="font-semibold">Commande #{order.id.slice(0, 8)}</span>
                <span className="text-green-600 font-bold">{order.totalAmount} €</span>
              </div>
              <p className="text-sm text-gray-500 mb-3">
                {order.buyer?.firstName} {order.buyer?.lastName}
              </p>
              <select value={order.status}
                onChange={e => updateOrderStatus.mutate({ orderId: order.id, status: e.target.value })}
                className="border rounded-lg px-3 py-1 text-sm">
                <option value="RECEIVED">Reçue</option>
                <option value="PREPARING">En préparation</option>
                <option value="READY">Prête</option>
                <option value="DELIVERED">Remise</option>
              </select>
            </div>
          ))}
          {(!orders || orders.length === 0) && (
            <p className="text-gray-500 text-center py-4">Aucune commande pour l'instant.</p>
          )}
        </div>
      </div>
    </div>
  );
}