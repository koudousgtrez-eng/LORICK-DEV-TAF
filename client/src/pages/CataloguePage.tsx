import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal, ShoppingCart, Star, Package, Store } from 'lucide-react';
import api from '../lib/api';
import { useCartStore } from '../store/cart.store';

const CATEGORIES = ['Toutes', 'légumes', 'fruits', 'fromage', 'charcuterie', 'oeufs', 'epicerie'];

const PLACEHOLDER: Record<string, string> = {
  légumes: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400',
  fruits: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400',
  fromage: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a318?w=400',
  charcuterie: 'https://images.unsplash.com/photo-1544025162-d76538897a07?w=400',
  oeufs: 'https://images.unsplash.com/photo-1569288052389-dac9b0ac9eac?w=400',
  epicerie: 'https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=400',
};

export default function CataloguePage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Toutes');
  const [page, setPage] = useState(1);
  const addItem = useCartStore(s => s.addItem);
  const cartItems = useCartStore(s => s.items);

  const params = new URLSearchParams({ page: String(page), limit: '12' });
  if (search) params.set('search', search);
  if (category !== 'Toutes') params.set('category', category);

  const { data, isLoading } = useQuery({
    queryKey: ['products', search, category, page],
    queryFn: async () => { const { data } = await api.get(`/products?${params}`); return data; },
    staleTime: 30000,
  });

  const isInCart = (id: string) => cartItems.some(i => i.productId === id);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-green-700 to-green-500 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-3">Produits locaux & artisanaux</h1>
          <p className="text-green-100 text-lg mb-8">Directement des producteurs de votre région</p>
          <div className="relative max-w-xl mx-auto">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl text-gray-800 text-base shadow-lg outline-none focus:ring-2 focus:ring-green-300"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Filtres catégories */}
        <div className="flex items-center gap-2 mb-8 flex-wrap">
          <SlidersHorizontal size={16} className="text-gray-400" />
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => { setCategory(cat); setPage(1); }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                category === cat
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-green-50 border border-gray-200'
              }`}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-8 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : data?.products?.length === 0 ? (
          <div className="text-center py-20">
            <Package size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Aucun produit trouvé</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">{data?.pagination?.total || 0} produit(s)</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {data?.products?.map((product: any) => {
                const photo = product.photos?.[0] || PLACEHOLDER[product.category] || PLACEHOLDER['légumes'];
                const inCart = isInCart(product.id);
                return (
                  <div key={product.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                    <Link to={`/products/${product.id}`} className="block">
                      <div className="relative h-48 overflow-hidden">
                        <img src={photo} alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute top-2 left-2">
                          <span className="bg-white/90 backdrop-blur-sm text-gray-600 text-xs px-2 py-0.5 rounded-full font-medium capitalize">
                            {product.category}
                          </span>
                        </div>
                        {product.stock < 10 && product.stock > 0 && (
                          <div className="absolute top-2 right-2">
                            <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">Stock limité</span>
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="p-4">
                      <Link to={`/products/${product.id}`}>
                        <h3 className="font-semibold text-gray-800 text-sm leading-tight mb-1 hover:text-green-600 transition-colors line-clamp-2">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                        <Store size={11} /> {product.shop?.name}
                      </p>
                      {product.reviews && product.reviews.length > 0 && (
                        <div className="flex items-center gap-1 mb-2">
                          <Star size={12} className="text-yellow-400 fill-yellow-400" />
                          <span className="text-xs text-gray-500">
                            {(product.reviews.reduce((s: number, r: any) => s + r.rating, 0) / product.reviews.length).toFixed(1)}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-3">
                        <div>
                          <span className="text-lg font-bold text-green-600">{product.price.toFixed(2)} €</span>
                          <span className="text-xs text-gray-400 ml-1">/ {product.unit}</span>
                        </div>
                        <button
                          onClick={() => addItem({ productId: product.id, name: product.name, price: product.price, unit: product.unit, photo, shopId: product.shop?.id, shopName: product.shop?.name, quantity: 1 })}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            inCart
                              ? 'bg-green-100 text-green-700'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}>
                          <ShoppingCart size={13} />
                          {inCart ? 'Ajouté' : 'Ajouter'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {data?.pagination?.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {[...Array(data.pagination.totalPages)].map((_,i) => (
                  <button key={i} onClick={() => setPage(i + 1)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                      page === i + 1 ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-green-400'
                    }`}>
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
