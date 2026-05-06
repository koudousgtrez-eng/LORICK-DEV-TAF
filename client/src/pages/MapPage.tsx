import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix icône Leaflet par défaut
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => { map.setView([lat, lng], 12); }, [lat, lng]);
  return null;
}

export default function MapPage() {
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [radius, setRadius] = useState(10);

  const { data: shops } = useQuery({
    queryKey: ['shops'],
    queryFn: async () => {
      const { data } = await api.get('/shops');
      return data;
    },
  });

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setUserPos({ lat: 48.8566, lng: 2.3522 }) // Paris par défaut
    );
  }, []);

  const defaultPos = userPos || { lat: 48.8566, lng: 2.3522 };

  const filteredShops = shops?.filter((shop: any) => {
    if (!userPos) return true;
    const R = 6371;
    const dLat = ((shop.latitude - userPos.lat) * Math.PI) / 180;
    const dLng = ((shop.longitude - userPos.lng) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos((userPos.lat * Math.PI) / 180) *
      Math.cos((shop.latitude * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
    const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return dist <= radius;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-green-700 mb-4">🗺️ Carte des producteurs</h1>

      <div className="flex items-center gap-4 mb-4">
        <label className="text-gray-600 font-medium">Rayon :</label>
        {[5, 10, 20, 50].map((r) => (
          <button key={r} onClick={() => setRadius(r)}
            className={`px-3 py-1 rounded-full text-sm font-medium border ${radius === r ? 'bg-green-600 text-white border-green-600' : 'border-gray-300 text-gray-600 hover:border-green-500'}`}>
            {r} km
          </button>
        ))}
        <span className="text-gray-500 text-sm">{filteredShops?.length || 0} producteur(s)</span>
      </div>

      <div className="rounded-xl overflow-hidden shadow" style={{ height: '500px' }}>
        <MapContainer center={[defaultPos.lat, defaultPos.lng]} zoom={12} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {userPos && <RecenterMap lat={userPos.lat} lng={userPos.lng} />}
          {userPos && (
            <Circle center={[userPos.lat, userPos.lng]} radius={radius * 1000}
              pathOptions={{ color: 'green', fillColor: 'green', fillOpacity: 0.05 }} />
          )}
          {filteredShops?.map((shop: any) => (
            <Marker key={shop.id} position={[shop.latitude, shop.longitude]}>
              <Popup>
                <div className="text-center">
                  <p className="font-bold text-green-700">{shop.name}</p>
                  <p className="text-sm text-gray-500 mb-2">{shop.address}</p>
                  <p className="text-sm text-gray-600 mb-2">{shop.products?.length || 0} produit(s)</p>
                  <Link to={`/shops/${shop.id}`} className="text-green-600 text-sm hover:underline">
                    Voir la boutique →
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}