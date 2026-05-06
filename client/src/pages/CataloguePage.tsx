import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../lib/api';

export default function CataloguePage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['products', search, category],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (category) params.set('category', category);
      const { data } = await api.get(`/products?${params}`);
      return data;
    },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-green-700 mb-6">🌱 Catalogue</h1>
      <div className="flex gap-4 mb-8">
        <input type="text" placeholder="Rechercher un produit..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
        <select value={category} onChange={(e) => setCategory(e.target.value)}
          className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500">
          <option value="">Toutes catégories</option>
          <option value="légumes">Légumes</option>
          <option value="fruits">Fruits</option>
          <option value="viande">Viande</option>
          <option value="fromage">Fromage</option>
          <option value="boulangerie">Boulangerie</option>
        </select>
      </div>
      {isLoading && <p className="text-center text-gray-500">Chargement...</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {data?.products?.map((product: any) => (
          <Link key={product.id} to={`/products/${product.id}`}
            className="bg-white rounded-xl shadow hover:shadow-md transition overflow-hidden">
            <div className="h-48 bg-gray-100">
              {product.photos?.[0]
                ? <img src={product.photos[0]} alt={product.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-4xl">🥦</div>}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-800">{product.name}</h3>
              <p className="text-sm text-gray-500">{product.shop?.name}</p>
              <p className="text-green-600 font-bold mt-2">{product.price} € / {product.unit}</p>
            </div>
          </Link>
        ))}
      </div>
      {data?.products?.length === 0 && (
        <p className="text-center text-gray-500 mt-12">Aucun produit trouvé.</p>
      )}
    </div>
  );
}
