"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from "react-leaflet";
import L, { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

interface Complaint {
  id: string;
  location: { lat: number; lng: number };
  description: string;
}

export function MapView({
  complaints,
  route,
}: {
  complaints: Complaint[];
  route: LatLngExpression[];
}) {
  const [mapCenter] = useState<LatLngExpression>([51.505, -0.09]);

  // ✅ Route circle calculation (safe)
  let routeCircle: { center: LatLngExpression; radius: number } | null = null;
  if (route && route.length > 1) {
    const routeBounds = L.latLngBounds(route as L.LatLngExpression[]);
    const center = routeBounds.getCenter();
    const radius = center.distanceTo(routeBounds.getNorthEast());
    routeCircle = { center, radius };
  } else if (route && route.length === 1) {
    routeCircle = { center: route[0], radius: 5000 }; // fallback circle
  }

  return (
    <MapContainer
      center={mapCenter}
      zoom={13}
      scrollWheelZoom={true}
      className="h-[500px] w-full rounded-lg z-0" // ✅ no id="map"
    >
      {/* Base map */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Route polyline */}
      {route && route.length > 0 && (
        <Polyline positions={route} pathOptions={{ color: "red" }} />
      )}

      {/* Route coverage circle */}
      {routeCircle && (
        <Circle
          center={routeCircle.center}
          radius={routeCircle.radius}
          pathOptions={{ color: "blue", fillColor: "blue", fillOpacity: 0.1 }}
        />
      )}

      {/* Complaint markers */}
      {complaints.map((complaint) => (
        <Marker
          key={complaint.id}
          position={[complaint.location.lat, complaint.location.lng]}
        >
          <Popup>
            <div>
              <strong>Complaint:</strong>
              <p>{complaint.description}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
