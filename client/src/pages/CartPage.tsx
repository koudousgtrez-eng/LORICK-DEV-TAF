import { useCartStore } from '../store/cart.store';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Store, LogIn } from 'lucide-react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  if (items.length === 0) return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col items-center justify-center text-center px-4">
      <div className="bg-white rounded-2xl shadow-sm p-12 max-w-sm border border-orange-100 hover:shadow-orange-100 hover:shadow-lg transition-all duration-300">
        <ShoppingCart size={56} className="text-gray-200 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Votre panier est vide</h2>
        <p className="text-gray-400 text-sm mb-6">Decouvrez nos produits locaux</p>
        <button onClick={() => navigate('/')} className="bg-green-600 text-white px-6 py-2.5 rounded-xl hover:bg-green-700 transition-colors font-medium hover:shadow-lg hover:shadow-green-200">
          Voir le catalogue
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
          <ShoppingCart size={24} className="text-green-600" /> Mon panier
          <span className="text-sm font-normal text-gray-400 ml-2">{items.length} article(s)</span>
        </h1>

        <div className="space-y-3 mb-6">
          {items.map((item) => (
            <div key={item.productId}
              className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-4 border border-transparent hover:border-orange-300 hover:shadow-orange-100 hover:shadow-md transition-all duration-300 group">
              <div className="w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden ring-2 ring-transparent group-hover:ring-orange-200 transition-all duration-300">
                {item.photo
                  ? <img src={item.photo} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  : <div className="w-full h-full bg-gray-100 flex items-center justify-center"><ShoppingCart size={24} className="text-gray-300" /></div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 text-sm truncate">{item.name}</h3>
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><Store size={11} /> {item.shopName}</p>
                <p className="text-green-600 font-bold text-sm mt-1">{item.price.toFixed(2)} € / {item.unit}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-orange-100 hover:text-orange-600 flex items-center justify-center transition-colors">
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-orange-100 hover:text-orange-600 flex items-center justify-center transition-colors">
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

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-transparent hover:border-orange-200 transition-all duration-300">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-500 text-sm">Sous-total</span>
            <span className="text-gray-700">{total().toFixed(2)} €</span>
          </div>
          <div className="flex justify-between items-center mb-6 pt-3 border-t">
            <span className="font-bold text-gray-900">Total</span>
            <span className="text-2xl font-bold text-green-600">{total().toFixed(2)} €</span>
          </div>

          {user ? (
            <button onClick={() => navigate('/checkout')}
              className="w-full bg-green-600 text-white py-3.5 rounded-xl hover:bg-green-700 font-semibold flex items-center justify-center gap-2 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-green-200">
              Passer la commande <ArrowRight size={18} />
            </button>
          ) : (
            <div className="space-y-3">
              <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 text-center">
                <p className="text-orange-700 text-sm font-medium">Connectez-vous pour passer votre commande</p>
              </div>
              <button onClick={() => navigate('/login', { state: { from: '/checkout', message: 'Connectez-vous pour finaliser votre commande.' } })}
                className="w-full bg-green-600 text-white py-3.5 rounded-xl hover:bg-green-700 font-semibold flex items-center justify-center gap-2 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-green-200">
                <LogIn size={18} /> Se connecter pour commander
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
