import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, MapPin, Star, ChevronLeft, Package, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import api from '../lib/api';
import { useCartStore } from '../store/cart.store';
import { useAuthStore } from '../store/auth.store';

const PLACEHOLDER: Record<string, string> = {
  legumes: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800',
  fruits: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=800',
  fromage: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=800',
  charcuterie: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800',
  oeufs: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=800',
  epicerie: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800',
};

export default function ProductPage() {
  const { id } = useParams();
  const addItem = useCartStore(s => s.addItem);
  const cartItems = useCartStore(s => s.items);
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [added, setAdded] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => { const { data } = await api.get(`/products/${id}`); return data; },
  });

  const submitReview = useMutation({
    mutationFn: async () => { await api.post(`/reviews/products/${id}/reviews`, review); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['product', id] }); setReview({ rating: 5, comment: '' }); },
  });

  if (isLoading) return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
      <div className="animate-pulse w-full max-w-4xl mx-auto px-4 grid md:grid-cols-2 gap-10">
        <div className="h-96 bg-white/60 rounded-2xl" />
        <div className="space-y-4">
          <div className="h-8 bg-white/60 rounded w-3/4" />
          <div className="h-4 bg-white/60 rounded w-1/2" />
          <div className="h-24 bg-white/60 rounded" />
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
      <p className="text-gray-500">Produit introuvable</p>
    </div>
  );

  const photo = product.photos?.[0] || PLACEHOLDER[product.category] || PLACEHOLDER['legumes'];
  const avgRating = product.reviews?.length
    ? product.reviews.reduce((s: number, r: any) => s + r.rating, 0) / product.reviews.length
    : null;

  const handleAdd = () => {
    addItem({ productId: product.id, name: product.name, price: product.price, unit: product.unit, photo, shopId: product.shop?.id, shopName: product.shop?.name, quantity: 1 });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-600 transition-colors mb-6">
          <ChevronLeft size={16} /> Retour au catalogue
        </Link>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8 border-2 border-transparent hover:border-orange-200 hover:shadow-orange-100 hover:shadow-lg transition-all duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            <div className="relative h-80 md:h-full min-h-80 overflow-hidden">
              <img src={photo} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER[product.category] || PLACEHOLDER['legumes']; }} />
              <div className="absolute top-4 left-4">
                <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-sm px-3 py-1 rounded-full font-medium capitalize">
                  {product.category}
                </span>
              </div>
            </div>

            <div className="p-8 flex flex-col justify-between">
              <div>
                <h1 className="text-xl md:text-xl md:text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
                {avgRating && (
                  <div className="flex items-center gap-1 mb-3">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={16} className={s <= Math.round(avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
                    ))}
                    <span className="text-sm text-gray-500 ml-1">{avgRating.toFixed(1)} ({product.reviews.length} avis)</span>
                  </div>
                )}
                <p className="text-gray-600 text-sm leading-relaxed mb-6">{product.description}</p>

                <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2 border border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Stock disponible</span>
                    <span className={`font-medium ${product.stock < 10 ? 'text-orange-500' : 'text-green-600'}`}>
                      {product.stock} {product.unit}(s)
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Unite</span>
                    <span className="font-medium text-gray-700">{product.unit}</span>
                  </div>
                  {product.shop && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Producteur</span>
                      <span className="font-medium text-green-600">{product.shop.name}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-3xl font-bold text-green-600">{product.price.toFixed(2)} €</span>
                  <span className="text-gray-400">/ {product.unit}</span>
                </div>
                <button onClick={handleAdd} disabled={product.stock === 0}
                  className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-base transition-all duration-300 ${
                    added ? 'bg-green-100 text-green-700 border-2 border-green-300'
                    : product.stock === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-orange-500 shadow-sm hover:shadow-lg hover:shadow-orange-200'
                  }`}>
                  {added ? <><CheckCircle size={20} /> Ajoute au panier</> : product.stock === 0 ? <><Package size={20} /> Rupture de stock</> : <><ShoppingCart size={20} /> Ajouter au panier</>}
                </button>
              </div>
            </div>
          </div>
        </div>

        {product.shop && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border-2 border-transparent hover:border-orange-200 transition-all duration-300">
            <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <MapPin size={18} className="text-green-600" /> Point de retrait
            </h2>
            <p className="text-gray-700 font-medium">{product.shop.name}</p>
            <p className="text-sm text-gray-500">Coordonnees disponibles sur la carte</p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm p-6 border-2 border-transparent hover:border-orange-200 transition-all duration-300">
          <h2 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Star size={18} className="text-yellow-400 fill-yellow-400" />
            Avis clients ({product.reviews?.length || 0})
          </h2>

          <div className="space-y-4 mb-8">
            {product.reviews?.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">Aucun avis. Soyez le premier !</p>
            )}
            {product.reviews?.map((r: any) => (
              <div key={r.id} className="border border-gray-100 rounded-xl p-4 hover:border-orange-200 transition-all duration-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700 text-sm">{r.author?.firstName} {r.author?.lastName}</span>
                  <div className="flex">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={13} className={s <= r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{r.comment}</p>
              </div>
            ))}
          </div>

          {user && (
            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-700 mb-4">Laisser un avis</h3>
              <div className="flex gap-1 mb-4">
                {[1,2,3,4,5].map(s => (
                  <button key={s} onClick={() => setReview({ ...review, rating: s })}>
                    <Star size={24} className={s <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200 hover:text-yellow-300'} />
                  </button>
                ))}
              </div>
              <textarea value={review.comment} onChange={e => setReview({ ...review, comment: e.target.value })}
                placeholder="Partagez votre experience..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 resize-none transition-all"
                rows={3} />
              <button onClick={() => submitReview.mutate()}
                disabled={!review.comment.trim() || submitReview.isPending}
                className="mt-3 bg-green-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-orange-500 hover:shadow-md hover:shadow-orange-200 disabled:opacity-50 transition-all duration-300">
                {submitReview.isPending ? 'Envoi...' : "Publier l'avis"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
