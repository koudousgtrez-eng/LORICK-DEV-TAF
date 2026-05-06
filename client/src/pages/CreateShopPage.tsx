import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuthStore } from '../store/auth.store';

export default function CreateShopPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [form, setForm] = useState({ name: '', description: '', address: '', latitude: '', longitude: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!user || user.role !== 'SELLER') { navigate('/'); return null; }

  const handleGeolocate = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setForm({ ...form, latitude: String(pos.coords.latitude), longitude: String(pos.coords.longitude) });
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/shops', form);
      navigate('/seller');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-green-700 mb-6">🏪 Créer ma boutique</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="bg-white rounded-xl shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input placeholder="Nom de la boutique" value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" required />
          <textarea placeholder="Description (bio, pratiques, etc.)" value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 h-24" />
          <input placeholder="Adresse complète" value={form.address}
            onChange={e => setForm({ ...form, address: e.target.value })}
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" required />
          <div className="flex gap-2">
            <input placeholder="Latitude" value={form.latitude}
              onChange={e => setForm({ ...form, latitude: e.target.value })}
              className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" required />
            <input placeholder="Longitude" value={form.longitude}
              onChange={e => setForm({ ...form, longitude: e.target.value })}
              className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" required />
          </div>
          <button type="button" onClick={handleGeolocate}
            className="w-full border border-green-600 text-green-600 py-2 rounded-lg hover:bg-green-50">
            📍 Utiliser ma position GPS
          </button>
          <button type="submit" disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold">
            {loading ? 'Création...' : 'Créer ma boutique'}
          </button>
        </form>
      </div>
    </div>
  );
}