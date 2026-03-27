import { useState, useCallback, useEffect } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
} from "@react-google-maps/api";

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? "";

const containerStyle = { width: "100%", height: "100%" };

type SingleHomeMapProps = {
  address: string;
  className?: string;
};

export function SingleHomeMap({ address, className }: SingleHomeMapProps) {
  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: API_KEY });
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);

  const geocode = useCallback(() => {
    if (!isLoaded || !address) return;
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        const loc = results[0].geometry.location;
        setPosition({ lat: loc.lat(), lng: loc.lng() });
      }
    });
  }, [isLoaded, address]);

  useEffect(() => {
    geocode();
  }, [geocode]);

  if (!API_KEY || !address) return null;

  if (!isLoaded) {
    return (
      <div className={className}>
        <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
          Loading map…
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={position ?? { lat: 39.8283, lng: -95.5795 }}
        zoom={position ? 15 : 4}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
        }}
      >
        {position && <Marker position={position} />}
      </GoogleMap>
    </div>
  );
}
