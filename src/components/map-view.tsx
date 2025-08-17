"use client";

import { useState } from "react";
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

  // ✅ Filter invalid route points
  const validRoute = (route || []).filter(
    (p: any) => Array.isArray(p) ? !isNaN(p[0]) && !isNaN(p[1]) : p?.lat !== undefined && p?.lng !== undefined
  ) as LatLngExpression[];

  // ✅ Compute circle only if we have valid route
  let routeCircle: { center: LatLngExpression; radius: number } | null = null;
  if (validRoute.length > 1) {
    const routeBounds = L.latLngBounds(validRoute as L.LatLngExpression[]);
    const center = routeBounds.getCenter();
    const radius = center.distanceTo(routeBounds.getNorthEast());
    routeCircle = { center, radius };
  } else if (validRoute.length === 1) {
    routeCircle = { center: validRoute[0], radius: 5000 }; // fallback
  }

  // ✅ Filter invalid complaints
  const validComplaints = complaints.filter(
    (c) =>
      c.location &&
      typeof c.location.lat === "number" &&
      typeof c.location.lng === "number" &&
      !isNaN(c.location.lat) &&
      !isNaN(c.location.lng)
  );

  return (
    <MapContainer
      center={mapCenter}
      zoom={13}
      scrollWheelZoom={true}
      className="h-[500px] w-full rounded-lg z-0"
    >
      {/* Base map */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Route polyline */}
      {validRoute.length > 0 && (
        <Polyline positions={validRoute} pathOptions={{ color: "red" }} />
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
      {validComplaints.map((complaint) => (
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
