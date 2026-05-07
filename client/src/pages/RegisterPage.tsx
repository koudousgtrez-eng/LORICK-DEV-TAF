import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Users, Leaf, Eye, EyeOff } from 'lucide-react';
import api from '../lib/api';

export default function RegisterPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'BUYER' });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await api.post('/auth/register', form);
      setSuccess('Compte cree ! Vous allez etre redirige...');
      setTimeout(() => navigate('/login', { state: { message: 'Compte cree ! Connectez-vous.' } }), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md border border-transparent hover:border-orange-200 transition-all duration-300">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center shadow-md shadow-green-200">
            <Leaf size={22} className="text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-900">Eco<span className="text-green-600">Market</span></span>
        </div>

        <h1 className="text-xl font-bold text-gray-800 mb-1 text-center">Creer un compte</h1>
        <p className="text-gray-400 text-sm text-center mb-8">Rejoignez la communaute locale</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <User size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input placeholder="Prenom" value={form.firstName}
                onChange={e => setForm({ ...form, firstName: e.target.value })}
                className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition-all"
                required />
            </div>
            <div className="relative">
              <User size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input placeholder="Nom" value={form.lastName}
                onChange={e => setForm({ ...form, lastName: e.target.value })}
                className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition-all"
                required />
            </div>
          </div>
          <div className="relative">
            <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="email" placeholder="Email" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition-all"
              required />
          </div>
          <div className="relative">
            <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type={showPwd ? 'text' : 'password'} placeholder="Mot de passe (8 car. min)" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition-all"
              minLength={8} required />
            <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          <div className="relative">
            <Users size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300 appearance-none bg-white focus:border-orange-300 transition-all">
              <option value="BUYER">Acheteur</option>
              <option value="SELLER">Vendeur / Producteur</option>
            </select>
          </div>
          {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          {success && <p className="text-green-600 text-sm bg-green-50 px-3 py-2 rounded-lg">{success}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 disabled:opacity-50 font-semibold transition-all hover:shadow-lg hover:shadow-green-200">
            {loading ? 'Creation...' : 'Creer mon compte'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Deja un compte ?{' '}
          <Link to="/login" className="text-green-600 font-medium hover:text-green-700">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
