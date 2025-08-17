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

// ✅ Fix default marker icons (important in Next.js build)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// ✅ Helper component for panning map
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

  // ✅ Cleanup fix for "Map container already initialized"
  useEffect(() => {
    return () => {
      const container = L.DomUtil.get("map");
      if (container != null) {
        try {
          // reset leaflet internal id so next mount is fresh
          // @ts-ignore
          container._leaflet_id = null;
        } catch (e) {
          console.warn("Leaflet cleanup failed:", e);
        }
      }
    };
  }, []);

  return (
    <MapContainer
      id="map"
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

      {/* Complaints Markers */}
      {complaints.map((complaint, idx) => (
        <Marker
          key={idx}
          position={[
            complaint.location.lat,
            complaint.location.lng,
          ] as LatLngExpression}
        >
          <Popup>
            <div>
              <h3 className="font-bold">{complaint.title}</h3>
              <p>{complaint.description}</p>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Route Polyline */}
      {route.length > 0 && (
        <Polyline positions={route} color="blue" />
      )}
    </MapContainer>
  );
}
