import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Users, Store, ShoppingBag, Star, TrendingUp, CheckCircle, XCircle, Trash2, RotateCcw, Shield, UserCheck } from 'lucide-react';
import api from '../lib/api';
import { useAuthStore } from '../store/auth.store';

const STATUS_SHOP: Record<string, string> = {
  PENDING: 'bg-orange-100 text-orange-700',
  APPROVED: 'bg-green-100 text-green-700',
  SUSPENDED: 'bg-red-100 text-red-600',
};

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  if (!user || user.role !== 'ADMIN') { navigate('/'); return null; }

  const { data: stats } = useQuery({ queryKey: ['adminStats'], queryFn: async () => (await api.get('/admin/stats')).data });
  const { data: users } = useQuery({ queryKey: ['adminUsers'], queryFn: async () => (await api.get('/admin/users')).data });
  const { data: shops } = useQuery({ queryKey: ['adminShops'], queryFn: async () => (await api.get('/admin/shops')).data });
  const { data: reviews } = useQuery({ queryKey: ['adminReviews'], queryFn: async () => (await api.get('/admin/reviews/flagged')).data });

  const toggleUser   = useMutation({ mutationFn: (id: string) => api.patch(`/admin/users/${id}/toggle`), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminUsers'] }) });
  const updateShop   = useMutation({ mutationFn: ({ id, status }: any) => api.patch(`/admin/shops/${id}/status`, { status }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminShops'] }) });
  const deleteReview = useMutation({ mutationFn: (id: string) => api.delete(`/admin/reviews/${id}`), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminReviews'] }) });
  const restoreReview= useMutation({ mutationFn: (id: string) => api.patch(`/admin/reviews/${id}/restore`), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminReviews'] }) });

  const statCards = [
    { label: 'Utilisateurs', value: stats?.users, icon: Users, color: 'text-blue-600 bg-blue-50' },
    { label: 'Boutiques', value: stats?.shops, icon: Store, color: 'text-green-600 bg-green-50' },
    { label: 'Commandes', value: stats?.orders, icon: ShoppingBag, color: 'text-purple-600 bg-purple-50' },
    { label: 'Avis', value: stats?.reviews, icon: Star, color: 'text-yellow-600 bg-yellow-50' },
    { label: "Chiffre d'affaires", value: stats?.totalRevenue ? `${Number(stats.totalRevenue).toFixed(2)} €` : '0 €', icon: TrendingUp, color: 'text-orange-600 bg-orange-50' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Back-office Admin</h1>
            <p className="text-sm text-gray-500">Gestion de la plateforme EcoMarket</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {statCards.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl shadow-sm p-4 border-2 border-transparent hover:border-orange-200 transition-all duration-300">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                <Icon size={18} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
              <p className="text-gray-400 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Boutiques */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border-2 border-transparent hover:border-orange-200 transition-all duration-300">
          <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
            <Store size={18} className="text-green-600" /> Boutiques
          </h2>
          <div className="space-y-3">
            {shops?.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-orange-200 transition-all duration-200">
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{s.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.owner?.firstName} {s.owner?.lastName} · {s.address}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${STATUS_SHOP[s.status] || STATUS_SHOP.PENDING}`}>
                    {s.status}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => updateShop.mutate({ id: s.id, status: 'APPROVED' })}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200 transition-colors">
                    <CheckCircle size={13} /> Valider
                  </button>
                  <button onClick={() => updateShop.mutate({ id: s.id, status: 'SUSPENDED' })}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-600 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors">
                    <XCircle size={13} /> Suspendre
                  </button>
                </div>
              </div>
            ))}
            {(!shops || shops.length === 0) && <p className="text-gray-400 text-sm text-center py-4">Aucune boutique.</p>}
          </div>
        </div>

        {/* Utilisateurs */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border-2 border-transparent hover:border-orange-200 transition-all duration-300">
          <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
            <Users size={18} className="text-blue-600" /> Utilisateurs
          </h2>
          <div className="space-y-2">
            {users?.map((u: any) => (
              <div key={u.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:border-orange-200 transition-all duration-200">
                <div>
                  <p className="font-medium text-gray-800 text-sm">{u.firstName} {u.lastName}</p>
                  <p className="text-xs text-gray-400">{u.email} · <span className="font-medium text-gray-600">{u.role}</span></p>
                </div>
                <button onClick={() => toggleUser.mutate(u.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    u.isEmailVerified ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-600 hover:bg-red-200'
                  }`}>
                  <UserCheck size={13} />
                  {u.isEmailVerified ? 'Actif' : 'Suspendu'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Avis signales */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border-2 border-transparent hover:border-orange-200 transition-all duration-300">
          <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
            <Star size={18} className="text-yellow-500" /> Avis signales
          </h2>
          {(!reviews || reviews.length === 0) && (
            <p className="text-gray-400 text-sm text-center py-4">Aucun avis signale.</p>
          )}
          <div className="space-y-3">
            {reviews?.map((r: any) => (
              <div key={r.id} className="p-4 border border-gray-100 rounded-xl hover:border-orange-200 transition-all duration-200">
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-sm text-gray-800">{r.author?.firstName} sur "{r.product?.name}"</span>
                  <div className="flex">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={12} className={s <= r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-3">{r.comment}</p>
                <div className="flex gap-2">
                  <button onClick={() => restoreReview.mutate(r.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200 transition-colors">
                    <RotateCcw size={12} /> Restaurer
                  </button>
                  <button onClick={() => deleteReview.mutate(r.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-600 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors">
                    <Trash2 size={12} /> Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
