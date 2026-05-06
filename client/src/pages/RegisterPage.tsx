import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '', role: 'BUYER' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/register', form);
      setSuccess('Compte créé ! Vérifiez votre email.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow w-full max-w-md">
        <h1 className="text-2xl font-bold text-green-700 mb-6">Créer un compte</h1>
        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
        {success && <p className="text-green-600 mb-4 text-sm">{success}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Prénom"
            value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" required />
          <input type="text" placeholder="Nom"
            value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" required />
          <input type="email" placeholder="Email"
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" required />
          <input type="password" placeholder="Mot de passe (8 caractères min)"
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" required />
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500">
            <option value="BUYER">Acheteur</option>
            <option value="SELLER">Vendeur</option>
          </select>
          <button type="submit" disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50">
            {loading ? 'Inscription...' : "S'inscrire"}
          </button>
        </form>
        <p className="mt-4 text-sm text-center">
          Déjà un compte ? <Link to="/login" className="text-green-600 hover:underline">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
