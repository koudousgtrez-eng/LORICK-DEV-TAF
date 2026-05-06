import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuthStore } from '../store/auth.store';

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  if (!user || user.role !== 'ADMIN') { navigate('/'); return null; }

  const { data: stats } = useQuery({ queryKey: ['adminStats'], queryFn: async () => (await api.get('/admin/stats')).data });
  const { data: users } = useQuery({ queryKey: ['adminUsers'], queryFn: async () => (await api.get('/admin/users')).data });
  const { data: shops } = useQuery({ queryKey: ['adminShops'], queryFn: async () => (await api.get('/admin/shops')).data });
  const { data: reviews } = useQuery({ queryKey: ['adminReviews'], queryFn: async () => (await api.get('/admin/reviews/flagged')).data });

  const toggleUser = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/users/${id}/toggle`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminUsers'] }),
  });

  const updateShop = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.patch(`/admin/shops/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminShops'] }),
  });

  const deleteReview = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/reviews/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminReviews'] }),
  });

  const restoreReview = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/reviews/${id}/restore`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminReviews'] }),
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-green-700 mb-8">⚙️ Back-office Admin</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Utilisateurs', value: stats?.users },
          { label: 'Boutiques', value: stats?.shops },
          { label: 'Commandes', value: stats?.orders },
          { label: 'Avis', value: stats?.reviews },
          { label: 'CA total', value: stats?.totalRevenue ? `${stats.totalRevenue.toFixed(2)} €` : '0 €' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{s.value ?? '—'}</p>
            <p className="text-gray-500 text-sm">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Utilisateurs */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">👥 Utilisateurs</h2>
        <div className="space-y-2">
          {users?.map((u: any) => (
            <div key={u.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-semibold">{u.firstName} {u.lastName}</p>
                <p className="text-sm text-gray-500">{u.email} — <span className="font-medium">{u.role}</span></p>
              </div>
              <button onClick={() => toggleUser.mutate(u.id)}
                className={`px-3 py-1 rounded-full text-sm font-medium ${u.isEmailVerified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                {u.isEmailVerified ? '✅ Actif' : '🚫 Suspendu'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Boutiques */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">🏪 Boutiques</h2>
        <div className="space-y-2">
          {shops?.map((s: any) => (
            <div key={s.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-semibold">{s.name}</p>
                <p className="text-sm text-gray-500">{s.owner?.firstName} {s.owner?.lastName} — {s.address}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => updateShop.mutate({ id: s.id, status: 'APPROVED' })}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium hover:bg-green-200">
                  ✅ Valider
                </button>
                <button onClick={() => updateShop.mutate({ id: s.id, status: 'REJECTED' })}
                  className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium hover:bg-red-200">
                  ❌ Refuser
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Avis signalés */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">🚩 Avis signalés</h2>
        {(!reviews || reviews.length === 0) && <p className="text-gray-500 text-center py-4">Aucun avis signalé.</p>}
        <div className="space-y-3">
          {reviews?.map((r: any) => (
            <div key={r.id} className="p-4 border rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="font-semibold">{r.author?.firstName} sur "{r.product?.name}"</span>
                <span className="text-yellow-500">{'⭐'.repeat(r.rating)}</span>
              </div>
              <p className="text-gray-600 text-sm mb-3">{r.comment}</p>
              <div className="flex gap-2">
                <button onClick={() => restoreReview.mutate(r.id)}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm hover:bg-green-200">
                  ✅ Restaurer
                </button>
                <button onClick={() => deleteReview.mutate(r.id)}
                  className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm hover:bg-red-200">
                  🗑 Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}