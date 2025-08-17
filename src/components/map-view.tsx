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

// ✅ Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

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

  // ✅ Cleanup
  useEffect(() => {
    return () => {
      const container = document.querySelector(
        ".leaflet-container"
      ) as any;
      if (container && container._leaflet_id) {
        container._leaflet_id = null;
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

      {/* ✅ Only render markers with valid lat/lng */}
      {complaints.map((complaint, idx) => {
        if (
          !complaint.location ||
          complaint.location.lat == null ||
          complaint.location.lng == null
        ) {
          console.warn("Skipping invalid complaint:", complaint);
          return null;
        }
        return (
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
        );
      })}

      {/* ✅ Only render polyline if all points are valid */}
      {route.length > 0 && (
        <Polyline
          positions={route.filter(
            (pt) =>
              Array.isArray(pt) &&
              pt[0] !== undefined &&
              pt[1] !== undefined
          )}
          color="blue"
        />
      )}
    </MapContainer>
  );
}
