import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { useCartStore } from '../store/cart.store';
import { useState } from 'react';

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data } = await api.get(`/products/${id}`);
      return data;
    },
  });

  if (isLoading) return <div className="text-center py-16">Chargement...</div>;
  if (!product) return <div className="text-center py-16">Produit introuvable</div>;

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      unit: product.unit,
      photo: product.photos?.[0] || '',
      shopId: product.shop.id,
      shopName: product.shop.name,
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const avgRating = product.reviews?.length
    ? (product.reviews.reduce((s: number, r: any) => s + r.rating, 0) / product.reviews.length).toFixed(1)
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="text-green-600 hover:underline mb-6 block">← Retour</button>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="h-72 bg-gray-100">
          {product.photos?.[0]
            ? <img src={product.photos[0]} alt={product.name} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-6xl">🥦</div>}
        </div>
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{product.name}</h1>
              <p className="text-gray-500">{product.shop?.name}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">{product.price} €</p>
              <p className="text-gray-500 text-sm">/ {product.unit}</p>
            </div>
          </div>
          {product.description && <p className="text-gray-600 mb-4">{product.description}</p>}
          <div className="flex items-center gap-4 mb-6">
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">{product.category}</span>
            {avgRating && <span className="text-yellow-500">⭐ {avgRating} ({product.reviews.length} avis)</span>}
            <span className="text-gray-500 text-sm">Stock : {product.stock}</span>
          </div>
          <button onClick={handleAddToCart} disabled={product.stock === 0}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold">
            {added ? '✅ Ajouté au panier !' : product.stock === 0 ? 'Rupture de stock' : 'Ajouter au panier'}
          </button>
        </div>
      </div>
      {product.reviews?.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Avis clients</h2>
          <div className="space-y-4">
            {product.reviews.map((review: any) => (
              <div key={review.id} className="bg-white rounded-xl shadow p-4">
                <div className="flex justify-between mb-2">
                  <span className="font-semibold">{review.author.firstName}</span>
                  <span className="text-yellow-500">{'⭐'.repeat(review.rating)}</span>
                </div>
                <p className="text-gray-600">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
