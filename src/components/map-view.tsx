"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L, { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Complaint } from "@/types/complaint";

// ✅ Fix default marker icons (needed in Next.js build)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// ✅ Helper component to update view
function MapUpdater({ center }: { center: LatLngExpression }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

export function MapView({
  complaints,
  route,
}: {
  complaints: Complaint[];
  route: LatLngExpression[];
}) {
  const [mapCenter] = useState<LatLngExpression>([51.505, -0.09]);

  // ✅ Cleanup fix for production
  useEffect(() => {
    return () => {
      // Destroy any Leaflet map bound to this container
      const container = document.querySelector(
        ".leaflet-container"
      ) as any;
      if (container && container._leaflet_id) {
        try {
          container._leaflet_id = null;
        } catch (e) {
          console.warn("Leaflet cleanup failed:", e);
        }
      }
    };
  }, []);

  return (
    <MapContainer
      center={mapCenter}
      zoom={13}
      scrollWheelZoom={true}
      className="h-[500px] w-full rounded-lg z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapUpdater center={mapCenter} />

      {/* Complaint markers */}
      {complaints.map((complaint, idx) => (
        <Marker
          key={idx}
          position={[
            complaint.location.lat,
            complaint.location.lng,
          ] as LatLngExpression}
        >
          <Popup>
            <h3 className="font-bold">{complaint.title}</h3>
            <p>{complaint.description}</p>
          </Popup>
        </Marker>
      ))}

      {/* Route polyline */}
      {route.length > 0 && <Polyline positions={route} color="blue" />}
    </MapContainer>
  );
}
