import { useCartStore } from '../store/cart.store';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Store } from 'lucide-react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCartStore();
  const navigate = useNavigate();

  if (items.length === 0) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center px-4">
      <div className="bg-white rounded-2xl shadow-sm p-12 max-w-sm">
        <ShoppingCart size={56} className="text-gray-200 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Votre panier est vide</h2>
        <p className="text-gray-400 text-sm mb-6">Découvrez nos produits locaux</p>
        <button onClick={() => navigate('/')} className="bg-green-600 text-white px-6 py-2.5 rounded-xl hover:bg-green-700 transition-colors font-medium">
          Voir le catalogue
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
          <ShoppingCart size={24} className="text-green-600" /> Mon panier
          <span className="text-sm font-normal text-gray-400 ml-2">{items.length} article(s)</span>
        </h1>

        <div className="space-y-3 mb-6">
          {items.map((item) => (
            <div key={item.productId} className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-4">
              <div className="w-18 h-18 flex-shrink-0 rounded-xl overflow-hidden w-16 h-16">
                {item.photo
                  ? <img src={item.photo} alt={item.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-gray-100 flex items-center justify-center"><Package size={24} className="text-gray-300" /></div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 text-sm truncate">{item.name}</h3>
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><Store size={11} /> {item.shopName}</p>
                <p className="text-green-600 font-bold text-sm mt-1">{item.price.toFixed(2)} € / {item.unit}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                  <Plus size={14} />
                </button>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="font-bold text-gray-800 text-sm">{(item.price * item.quantity).toFixed(2)} €</span>
                <button onClick={() => removeItem(item.productId)}
                  className="text-gray-300 hover:text-red-400 transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-500 text-sm">Sous-total</span>
            <span className="text-gray-700">{total().toFixed(2)} €</span>
          </div>
          <div className="flex justify-between items-center mb-6 pt-3 border-t">
            <span className="font-bold text-gray-900">Total</span>
            <span className="text-2xl font-bold text-green-600">{total().toFixed(2)} €</span>
          </div>
          <button onClick={() => navigate('/checkout')}
            className="w-full bg-green-600 text-white py-3.5 rounded-xl hover:bg-green-700 font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm">
            Passer la commande <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
