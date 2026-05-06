import { useCartStore } from '../store/cart.store';
import { useNavigate } from 'react-router-dom';

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCartStore();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-4xl mb-4">🛒</p>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Votre panier est vide</h2>
        <button onClick={() => navigate('/')} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
          Voir le catalogue
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-green-700 mb-6">🛒 Mon panier</h1>
      <div className="space-y-4 mb-8">
        {items.map((item) => (
          <div key={item.productId} className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
              {item.photo
                ? <img src={item.photo} alt={item.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-2xl">🥦</div>}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800">{item.name}</h3>
              <p className="text-sm text-gray-500">{item.shopName}</p>
              <p className="text-green-600 font-bold">{item.price} € / {item.unit}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 font-bold">−</button>
              <span className="w-8 text-center font-semibold">{item.quantity}</span>
              <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 font-bold">+</button>
            </div>
            <button onClick={() => removeItem(item.productId)}
              className="text-red-400 hover:text-red-600 ml-2">✕</button>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between text-lg font-bold mb-4">
          <span>Total</span>
          <span className="text-green-600">{total().toFixed(2)} €</span>
        </div>
        <button onClick={() => navigate('/checkout')}
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold">
          Passer la commande
        </button>
      </div>
    </div>
  );
}
