/**
 * BarbershopMap — a real interactive map (Leaflet + OpenStreetMap tiles).
 * ----------------------------------------------------------------------
 * Renders genuine street map tiles, a marker per barbershop at its real
 * coordinates, and a distinct marker for the user's location. Clicking a shop
 * marker opens a popup with its name, city, rating, distance (if known), and a
 * "Book" button that calls the onBook callback (Dashboard scrolls to / opens it).
 *
 * No API key and no billing required — OSM tiles are free. We respect OSM by
 * showing the required attribution (Leaflet adds it automatically).
 */

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default marker icon paths (CRA bundling breaks the defaults).
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Green icon for the user's location — embedded directly (self-contained),
// so it loads for everyone on the deployed URL with no external request.
const GREEN_PIN = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNSIgaGVpZ2h0PSI0MSIgdmlld0JveD0iMCAwIDI1IDQxIj48cGF0aCBkPSJNMTIuNSAwQzUuNiAwIDAgNS42IDAgMTIuNWMwIDguNCAxMi41IDI4LjUgMTIuNSAyOC41UzI1IDIwLjkgMjUgMTIuNUMyNSA1LjYgMTkuNCAwIDEyLjUgMHoiIGZpbGw9IiMyZWNjNDAiLz48Y2lyY2xlIGN4PSIxMi41IiBjeT0iMTIuNSIgcj0iNSIgZmlsbD0iI2ZmZmZmZiIvPjwvc3ZnPg==';

const userIcon = new L.Icon({
  iconUrl: GREEN_PIN,
  iconRetinaUrl: GREEN_PIN,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function BarbershopMap({ shops, userLocation, onBook }) {
  const mapRef = useRef(null);     // the Leaflet map instance
  const containerRef = useRef(null); // the DOM node
  const layerRef = useRef(null);   // a layer group holding all markers

  // Create the map once.
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const center = userLocation
      ? [userLocation.latitude, userLocation.longitude]
      : [32.0786, 34.7741]; // Tel Aviv fallback

    const map = L.map(containerRef.current).setView(center, 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    mapRef.current = map;
    layerRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Redraw markers whenever shops or the user location change.
  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();
    const bounds = [];

    // User marker
    if (userLocation && userLocation.latitude != null) {
      const m = L.marker([userLocation.latitude, userLocation.longitude], { icon: userIcon })
        .bindPopup(`<b>You are here</b><br/>${userLocation.addressLabel || 'Your location'}`);
      layer.addLayer(m);
      bounds.push([userLocation.latitude, userLocation.longitude]);
    }

    // Shop markers
    (shops || []).forEach((shop) => {
      if (shop.latitude == null || shop.longitude == null) return;
      const dist = shop.distanceKm != null ? `<br/>${shop.distanceKm} km away` : '';
      const rating = shop.rating != null ? `★ ${shop.rating.toFixed(1)} (${shop.reviewCount || 0})` : 'No rating';

      const popupHtml = `
        <div style="min-width:160px">
          <b>${shop.name}</b><br/>
          ${shop.address || shop.city}<br/>
          ${rating}${dist}<br/>
          <button id="book-${shop.barbershopId}"
            style="margin-top:6px;padding:4px 10px;background:#111827;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:12px">
            Book
          </button>
        </div>`;

      const marker = L.marker([shop.latitude, shop.longitude]).bindPopup(popupHtml);

      // Wire the Book button inside the popup once it opens.
      marker.on('popupopen', () => {
        const btn = document.getElementById(`book-${shop.barbershopId}`);
        if (btn) btn.onclick = () => onBook && onBook(shop);
      });

      layer.addLayer(marker);
      bounds.push([shop.latitude, shop.longitude]);
    });

    // Fit the view to everything we plotted.
    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [40, 40] });
    } else if (bounds.length === 1) {
      map.setView(bounds[0], 13);
    }
  }, [shops, userLocation, onBook]);

  return (
    <div
      ref={containerRef}
      className="w-full rounded-lg shadow"
      style={{ height: '420px', zIndex: 0 }}
    />
  );
}