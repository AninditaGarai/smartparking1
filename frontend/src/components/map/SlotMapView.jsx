import { useEffect, useMemo, useState } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";

const CITY_CENTERS = {
  Mumbai: [19.076, 72.8777],
  Pune: [18.5204, 73.8567],
  Delhi: [28.6139, 77.209],
  Chennai: [13.0827, 80.2707],
  Bengaluru: [12.9716, 77.5946],
};

function hashCode(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function slotCoordinates(slot) {
  const center = CITY_CENTERS[slot.city] || [20.5937, 78.9629];
  const hash = Math.abs(hashCode(`${slot.code}:${slot.address}`));
  const latOffset = ((hash % 1000) / 1000 - 0.5) * 0.16;
  const lngOffset = (((hash >> 3) % 1000) / 1000 - 0.5) * 0.16;
  return {
    lat: Number((center[0] + latOffset).toFixed(6)),
    lng: Number((center[1] + lngOffset).toFixed(6)),
  };
}

function haversineKm(start, end) {
  const toRad = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(end.lat - start.lat);
  const dLng = toRad(end.lng - start.lng);
  const lat1 = toRad(start.lat);
  const lat2 = toRad(end.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

function etaFromDistance(distanceKm) {
  const avgUrbanSpeedKmH = 28;
  return Math.max(3, Math.round((distanceKm / avgUrbanSpeedKmH) * 60));
}

function MapViewUpdater({ center }) {
  const map = useMap();

  useEffect(() => {
    if (!center) return;
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);

  return null;
}

export default function SlotMapView({ slots, favoriteSlotIds, onToggleFavorite, onBookSlot }) {
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [userLocation, setUserLocation] = useState(null);

  const withGeo = useMemo(() => {
    return slots.map((slot) => {
      const coord = slotCoordinates(slot);
      if (!userLocation) {
        return { ...slot, ...coord, distanceFromYouKm: null, etaMin: null };
      }

      const distanceFromYouKm = haversineKm(userLocation, coord);
      return {
        ...slot,
        ...coord,
        distanceFromYouKm,
        etaMin: etaFromDistance(distanceFromYouKm),
      };
    });
  }, [slots, userLocation]);

  const sortedByEta = useMemo(() => {
    if (!userLocation) return withGeo;
    return [...withGeo].sort((a, b) => (a.etaMin || 999) - (b.etaMin || 999));
  }, [withGeo, userLocation]);

  const mapCenter = useMemo(() => {
    if (userLocation) return [userLocation.lat, userLocation.lng];
    if (withGeo[0]) return [withGeo[0].lat, withGeo[0].lng];
    return [20.5937, 78.9629];
  }, [userLocation, withGeo]);

  const detectLocation = () => {
    setLocationError("");
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported in this browser.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocating(false);
      },
      (err) => {
        const messageByCode = {
          1: "Location permission was blocked. Allow location access in the browser and try again.",
          2: "Your location could not be determined right now.",
          3: "Location request timed out. Try again.",
        };
        setLocationError(messageByCode[err.code] || err.message || "Could not detect location.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    );
  };

  return (
    <div className="container">
      <div className="section-head" style={{ marginBottom: 12 }}>
        <div>
          <h2>Map Explorer</h2>
          <p style={{ color: "var(--text-soft)" }}>Live slot markers, your location, and ETA-based ordering.</p>
        </div>
        <button className="btn primary" onClick={detectLocation} disabled={locating}>
          {locating ? "Locating..." : userLocation ? "Refresh My Location" : "Use My Location"}
        </button>
      </div>

      {locationError && <div className="card" style={{ marginBottom: 12, color: "#ad384d" }}>{locationError}</div>}

      <div className="map-layout">
        <div className="card map-shell">
          <MapContainer center={mapCenter} zoom={11} scrollWheelZoom className="parking-map">
            <MapViewUpdater center={mapCenter} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {userLocation && (
              <CircleMarker center={[userLocation.lat, userLocation.lng]} radius={10} pathOptions={{ color: "#2f8f6c", fillColor: "#2f8f6c", fillOpacity: 0.85 }}>
                <Popup>You are here</Popup>
              </CircleMarker>
            )}

            {withGeo.map((slot) => {
              const occupancyRatio = slot.total > 0 ? (slot.total - slot.free) / slot.total : 0;
              const color = occupancyRatio > 0.8 ? "#7a7652" : occupancyRatio > 0.55 ? "#9ba34b" : "#2f8f6c";
              return (
                <CircleMarker
                  key={slot.id}
                  center={[slot.lat, slot.lng]}
                  radius={clamp(8 + Math.round(slot.free / 3), 8, 13)}
                  pathOptions={{ color, fillColor: color, fillOpacity: 0.65 }}
                >
                  <Popup>
                    <div style={{ minWidth: 200 }}>
                      <strong>{slot.name}</strong>
                      <div style={{ marginTop: 5 }}>{slot.address}</div>
                      <div style={{ marginTop: 5 }}>Free: {slot.free}/{slot.total}</div>
                      <div style={{ marginTop: 5 }}>Price: Rs {slot.pricePerHour}/h</div>
                      {slot.etaMin && <div style={{ marginTop: 5 }}>ETA: ~{slot.etaMin} min</div>}
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Nearest By ETA</h3>
          <p style={{ color: "var(--text-soft)", fontSize: 13, marginTop: 4 }}>
            {userLocation ? "Sorted by calculated travel ETA from your current location." : "Enable location to unlock ETA sorting and distance estimates."}
          </p>
          <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
            {sortedByEta.map((slot) => (
              <div className="map-slot-row" key={slot.id}>
                <div className="section-head">
                  <strong>{slot.name}</strong>
                  <span className="mono">Rs {slot.pricePerHour}/h</span>
                </div>
                <div style={{ fontSize: 13, color: "var(--text-soft)" }}>{slot.city} · {slot.address}</div>
                <div className="row" style={{ justifyContent: "space-between", marginTop: 6 }}>
                  <span>Free {slot.free}/{slot.total}</span>
                  <span className="mono">
                    {slot.distanceFromYouKm == null ? "ETA unavailable" : `${slot.distanceFromYouKm.toFixed(1)} km · ~${slot.etaMin} min`}
                  </span>
                </div>
                <div className="row" style={{ marginTop: 8 }}>
                  <button className="btn" onClick={() => onToggleFavorite(slot.id)}>
                    {favoriteSlotIds.includes(slot.id) ? "★ Saved" : "☆ Save"}
                  </button>
                  <button className="btn primary" onClick={() => onBookSlot(slot)} disabled={slot.free <= 0}>
                    {slot.free <= 0 ? "Full" : "Book from map"}
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

export function MiniMapPreview({ slots }) {
  const withGeo = useMemo(() => slots.map((slot) => ({ ...slot, ...slotCoordinates(slot) })), [slots]);
  const mapCenter = useMemo(() => {
    if (withGeo[0]) return [withGeo[0].lat, withGeo[0].lng];
    return [20.5937, 78.9629];
  }, [withGeo]);

  return (
    <div className="card map-shell" style={{ padding: 10 }}>
      <div className="section-head" style={{ marginBottom: 10 }}>
        <div>
          <strong>Live Map Preview</strong>
          <div style={{ fontSize: 12, color: "var(--text-soft)" }}>Quick glance at active parking zones</div>
        </div>
        <div className="mono" style={{ fontSize: 12, color: "var(--text-soft)" }}>{withGeo.length} slots</div>
      </div>
      <MapContainer center={mapCenter} zoom={5} scrollWheelZoom={false} dragging={false} zoomControl={false} className="parking-map" style={{ height: 280 }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {withGeo.map((slot) => {
          const occupancyRatio = slot.total > 0 ? (slot.total - slot.free) / slot.total : 0;
          const color = occupancyRatio > 0.8 ? "#7a7652" : occupancyRatio > 0.55 ? "#9ba34b" : "#2f8f6c";
          return (
            <CircleMarker
              key={slot.id}
              center={[slot.lat, slot.lng]}
              radius={clamp(8 + Math.round(slot.free / 4), 8, 12)}
              pathOptions={{ color, fillColor: color, fillOpacity: 0.7 }}
            >
              <Popup>
                <div style={{ minWidth: 180 }}>
                  <strong>{slot.name}</strong>
                  <div style={{ marginTop: 4 }}>{slot.city}</div>
                  <div style={{ marginTop: 4 }}>Free: {slot.free}/{slot.total}</div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
