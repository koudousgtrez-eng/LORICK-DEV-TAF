import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, MapPin, FileText, Navigation, Leaf } from 'lucide-react';
import api from '../lib/api';
import { useAuthStore } from '../store/auth.store';

export default function CreateShopPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [form, setForm] = useState({ name: '', description: '', address: '', latitude: '', longitude: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locating, setLocating] = useState(false);

  if (!user || user.role !== 'SELLER') { navigate('/'); return null; }

  const handleGeolocate = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm({ ...form, latitude: pos.coords.latitude.toFixed(6), longitude: pos.coords.longitude.toFixed(6) });
        setLocating(false);
      },
      () => { setError('Geolocalisation refusee.'); setLocating(false); }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await api.post('/shops', { ...form, latitude: parseFloat(form.latitude), longitude: parseFloat(form.longitude) });
      navigate('/seller');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la creation');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-lg border-2 border-transparent hover:border-orange-200 transition-all duration-300">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center shadow-md shadow-green-200">
            <Leaf size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Creer ma boutique</h1>
            <p className="text-sm text-gray-400">Configurez votre espace vendeur</p>
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-5">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Store size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input placeholder="Nom de la boutique" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition-all"
              required />
          </div>

          <div className="relative">
            <FileText size={17} className="absolute left-3.5 top-3.5 text-gray-400" />
            <textarea placeholder="Description (bio, pratiques, histoire...)" value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition-all resize-none"
              rows={3} />
          </div>

          <div className="relative">
            <MapPin size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input placeholder="Adresse complete" value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition-all"
              required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Latitude (ex: 48.8566)" value={form.latitude}
              onChange={e => setForm({ ...form, latitude: e.target.value })}
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition-all"
              required />
            <input placeholder="Longitude (ex: 2.3522)" value={form.longitude}
              onChange={e => setForm({ ...form, longitude: e.target.value })}
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition-all"
              required />
          </div>

          <button type="button" onClick={handleGeolocate} disabled={locating}
            className="w-full flex items-center justify-center gap-2 border-2 border-green-600 text-green-600 py-3 rounded-xl hover:bg-green-50 hover:shadow-md hover:shadow-green-100 transition-all text-sm font-medium disabled:opacity-50">
            <Navigation size={16} className={locating ? 'animate-spin' : ''} />
            {locating ? 'Localisation...' : 'Utiliser ma position GPS'}
          </button>

          {form.latitude && form.longitude && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2 text-xs text-green-700 flex items-center gap-2">
              <MapPin size={12} /> Position : {parseFloat(form.latitude).toFixed(4)}, {parseFloat(form.longitude).toFixed(4)}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-green-600 text-white py-3.5 rounded-xl hover:bg-green-700 hover:shadow-lg hover:shadow-green-200 disabled:opacity-50 font-semibold transition-all flex items-center justify-center gap-2">
            <Store size={18} />
            {loading ? 'Creation en cours...' : 'Creer ma boutique'}
          </button>
        </form>
      </div>
    </div>
  );
}
