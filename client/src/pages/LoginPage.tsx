import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Leaf, Eye, EyeOff } from 'lucide-react';
import api from '../lib/api';
import { useAuthStore } from '../store/auth.store';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/auth/login', form);
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      setUser(data.user);
      navigate(data.user.role === 'SELLER' ? '/seller' : data.user.role === 'ADMIN' ? '/admin' : '/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Identifiants incorrects');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
            <Leaf size={22} className="text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-900">Eco<span className="text-green-600">Market</span></span>
        </div>

        <h1 className="text-xl font-bold text-gray-800 mb-1 text-center">Bon retour !</h1>
        <p className="text-gray-400 text-sm text-center mb-8">Connectez-vous à votre compte</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="email" placeholder="Email" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent"
              required />
          </div>
          <div className="relative">
            <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type={showPwd ? 'text' : 'password'} placeholder="Mot de passe" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent"
              required />
            <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 disabled:opacity-50 font-semibold transition-colors">
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-green-600 font-medium hover:text-green-700">S'inscrire</Link>
        </p>
      </div>
    </div>
  );
}
