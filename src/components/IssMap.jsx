import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

// Default Leaflet icon fix (since CRA/Vite bundling sometimes needs explicit paths)
const icon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

/**
 * IssMap component
 * Props:
 *  - latitude (string or number)
 *  - longitude (string or number)
 */
export default function IssMap({ latitude, longitude }) {
  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView([lat, lon]);
    }
  }, [lat, lon]);

  if (Number.isNaN(lat) || Number.isNaN(lon)) return null;

  return (
    <div style={{ height: '320px', width: '100%', borderRadius: 8, overflow: 'hidden' }}>
      <MapContainer
        center={[lat, lon]}
        zoom={3}
        ref={mapRef}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        <Marker position={[lat, lon]} icon={icon}>
          <Popup>
            ISS Position<br />Lat: {lat.toFixed(2)} Lon: {lon.toFixed(2)}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
