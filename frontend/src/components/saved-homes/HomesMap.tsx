import { useState, useCallback, useEffect, useRef } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import { Link } from "react-router-dom";
import type { Home } from "@/lib/api";

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? "";

const containerStyle = { width: "100%", height: "100%" };

const defaultCenter = { lat: 39.8283, lng: -95.5795 };

type GeocodedHome = {
  home: Home;
  lat: number;
  lng: number;
};

function buildAddress(home: Home): string {
  return [home.StreetAddress, home.City, home.State, home.Zip]
    .filter(Boolean)
    .join(", ");
}

type HomesMapProps = {
  homes: Home[];
  className?: string;
};

export function HomesMap({ homes, className }: HomesMapProps) {
  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: API_KEY });
  const [geocoded, setGeocoded] = useState<GeocodedHome[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const geocodedRef = useRef<Map<number, { lat: number; lng: number }>>(new Map());

  const geocodeHomes = useCallback(() => {
    if (!isLoaded || homes.length === 0) return;

    const geocoder = new google.maps.Geocoder();
    const toGeocode = homes.filter((h) => !geocodedRef.current.has(h.HomeID));

    if (toGeocode.length === 0) {
      setGeocoded(
        homes
          .filter((h) => geocodedRef.current.has(h.HomeID))
          .map((h) => ({ home: h, ...geocodedRef.current.get(h.HomeID)! }))
      );
      return;
    }

    toGeocode.forEach((home) => {
      const address = buildAddress(home);
      if (!address) return;

      geocoder.geocode({ address }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          const loc = results[0].geometry.location;
          geocodedRef.current.set(home.HomeID, {
            lat: loc.lat(),
            lng: loc.lng(),
          });
        }

        setGeocoded(
          homes
            .filter((h) => geocodedRef.current.has(h.HomeID))
            .map((h) => ({ home: h, ...geocodedRef.current.get(h.HomeID)! }))
        );
      });
    });
  }, [isLoaded, homes]);

  useEffect(() => {
    geocodeHomes();
  }, [geocodeHomes]);

  const mapRef = useRef<google.maps.Map | null>(null);

  const onLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;
      if (geocoded.length > 0) fitBounds(map, geocoded);
    },
    [geocoded]
  );

  useEffect(() => {
    if (mapRef.current && geocoded.length > 0) {
      fitBounds(mapRef.current, geocoded);
    }
  }, [geocoded]);

  if (!API_KEY) return null;
  if (!isLoaded) {
    return (
      <div className={className}>
        <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
          Loading map…
        </div>
      </div>
    );
  }

  const selected = geocoded.find((g) => g.home.HomeID === selectedId) ?? null;

  return (
    <div className={className}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={geocoded.length === 1 ? geocoded[0] : defaultCenter}
        zoom={geocoded.length === 1 ? 14 : 4}
        onLoad={onLoad}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
        }}
      >
        {geocoded.map((g) => (
          <Marker
            key={g.home.HomeID}
            position={{ lat: g.lat, lng: g.lng }}
            onClick={() => setSelectedId(g.home.HomeID)}
          />
        ))}

        {selected && (
          <InfoWindow
            position={{ lat: selected.lat, lng: selected.lng }}
            onCloseClick={() => setSelectedId(null)}
          >
            <div className="text-sm max-w-[200px]">
              <p className="font-semibold">{selected.home.StreetAddress}</p>
              <p className="text-muted-foreground text-xs">
                {[selected.home.City, selected.home.State].filter(Boolean).join(", ")}
              </p>
              {selected.home.Price != null && (
                <p className="font-bold text-primary mt-1">
                  ${selected.home.Price.toLocaleString()}
                </p>
              )}
              <Link
                to={`/homes/${selected.home.HomeID}`}
                className="text-xs text-primary underline mt-1 inline-block"
              >
                View details
              </Link>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}

function fitBounds(map: google.maps.Map, items: GeocodedHome[]) {
  if (items.length === 0) return;
  if (items.length === 1) {
    map.setCenter({ lat: items[0].lat, lng: items[0].lng });
    map.setZoom(14);
    return;
  }
  const bounds = new google.maps.LatLngBounds();
  items.forEach((g) => bounds.extend({ lat: g.lat, lng: g.lng }));
  map.fitBounds(bounds, 50);
}
