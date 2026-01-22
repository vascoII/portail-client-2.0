"use client";
import React, { useMemo, useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useImmeubles } from "@/lib/hooks/useImmeubles";
import { LoadingSkeleton } from "@/components/ui/loading";

// Fix for default marker icons in Next.js (SSR issue)
if (typeof window !== "undefined") {
  delete (Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
  Icon.Default.mergeOptions({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

// Dynamically import MapContainer to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

interface ImmeubleCardProps {
  pkImmeuble: string;
}

// Adresse de secours si l'adresse de l'immeuble n'est pas trouvée
const FALLBACK_ADDRESS = "378 Avenue de la Division Leclerc, 92290 Châtenay-Malabry, France";

// Configuration de la carte
const defaultCenter: [number, number] = [48.8566, 2.3522]; // Paris par défaut [lat, lng]
const defaultZoom = 15;

// Interface pour les coordonnées Nominatim
interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

export default function ImmeubleCard({ pkImmeuble }: ImmeubleCardProps) {
  const { useImmeubleQuery } = useImmeubles();
  const { data: immeubleData, isLoading: isImmeubleLoading } = useImmeubleQuery(pkImmeuble);
  const [mapCenter, setMapCenter] = useState<[number, number]>(defaultCenter);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodingError, setGeocodingError] = useState(false);

  // Extract immeuble information from API response
  const immeubleInfo = useMemo(() => {
    const immeuble = immeubleData?.immeuble;
    // Handle both nested Immeuble object and direct properties
    const immeubleObj = (immeuble && typeof immeuble === 'object' && 'Immeuble' in immeuble) 
      ? (immeuble as { Immeuble?: Record<string, unknown> }).Immeuble ?? immeuble
      : immeuble;
    
    return {
      nom: immeubleObj?.Nom ?? immeubleObj?.nom ?? "—",
      ref: immeubleObj?.Ref ?? immeubleObj?.ref ?? "—",
      numero: immeubleObj?.Numero ?? immeubleObj?.numero ?? "—",
      adresse1: immeubleObj?.Adresse1 ?? immeubleObj?.adresse1 ?? "—",
      cp: immeubleObj?.Cp ?? immeubleObj?.cp ?? "—",
      ville: immeubleObj?.Ville ?? immeubleObj?.ville ?? "—",
    };
  }, [immeubleData]);

  // Format full address
  const fullAddress = useMemo(() => {
    const parts = [
      immeubleInfo.adresse1 !== "—" ? immeubleInfo.adresse1 : null,
      immeubleInfo.cp !== "—" ? immeubleInfo.cp : null,
      immeubleInfo.ville !== "—" ? immeubleInfo.ville : null,
    ].filter(Boolean);
    
    return parts.length > 0 ? parts.join(" ") : null;
  }, [immeubleInfo]);

  // Geocode address using Nominatim (OpenStreetMap)
  const geocodeAddress = useCallback(async (address: string, useFallback = false) => {
    setIsGeocoding(true);
    if (useFallback) {
      setGeocodingError(true);
    }

    try {
      // Respect Nominatim usage policy: max 1 request per second
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));

      const encodedAddress = encodeURIComponent(address);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`,
        {
          headers: {
            "User-Agent": "Techem Customer Portal", // Required by Nominatim
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const results: NominatimResult[] = await response.json();

      if (results && results.length > 0) {
        const location = results[0];
        setMapCenter([parseFloat(location.lat), parseFloat(location.lon)]);
        setGeocodingError(false);
      } else {
        // Address not found, use fallback
        if (!useFallback) {
          console.warn(`Adresse non trouvée: ${address}. Utilisation de l'adresse de secours: ${FALLBACK_ADDRESS}`);
          await geocodeAddress(FALLBACK_ADDRESS, true);
        }
      }
    } catch (error) {
      console.error("Erreur lors du géocodage:", error);
      if (!useFallback) {
        setGeocodingError(true);
        // Try fallback address
        await geocodeAddress(FALLBACK_ADDRESS, true);
      }
    } finally {
      setIsGeocoding(false);
    }
  }, []);

  useEffect(() => {
    if (isImmeubleLoading) {
      return;
    }

    // If no address is available, use fallback address directly
    const addressToGeocode = fullAddress || FALLBACK_ADDRESS;
    if (!fullAddress) {
      setGeocodingError(true);
    }

    geocodeAddress(addressToGeocode);
  }, [fullAddress, isImmeubleLoading, geocodeAddress]);

  if (isImmeubleLoading) {
    return (
      <div className="rounded-xl border border-[#1d1914] bg-white p-5 shadow-[0_0.625rem_0.938rem_0_rgba(0,0,0,0.2)] sm:p-6">
        <div className="flex justify-between mb-6">
          <h3 className="text-xl font-normal text-[#1d1914]">
            Informations de l&apos;immeuble
          </h3>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <LoadingSkeleton variant="text" width="120px" height="16px" />
              <LoadingSkeleton variant="text" width="200px" height="20px" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#1d1914] bg-white p-5 shadow-[0_0.625rem_0.938rem_0_rgba(0,0,0,0.2)] sm:p-6">
      <div className="flex justify-between mb-6">
        <h3 className="text-xl font-normal text-[#1d1914]">
          Localisation de l&apos;immeuble
        </h3>
      </div>

      {/* OpenStreetMap with Leaflet */}
      <div className="mb-6 rounded-lg overflow-hidden border border-[#1d1914]">
        {isGeocoding && (
          <div className="w-full h-[300px] flex items-center justify-center bg-[#e9ecef]">
            <p className="text-sm text-[#1d1914]">
              Recherche de l&apos;adresse...
            </p>
          </div>
        )}
        {!isGeocoding && (
          <div className="w-full h-[300px]">
            <MapContainer
              center={mapCenter}
              zoom={defaultZoom}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={mapCenter}>
                <Popup>
                  {fullAddress || "Localisation"}
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        )}
        {geocodingError && (
          <div className="px-4 py-2 bg-[#ffe5e6] border-t border-[#1d1914]">
            <p className="text-xs text-[#1d1914]">
              Adresse non trouvée. Affichage de l&apos;adresse de secours.
            </p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-base font-normal text-[#1d1914]">
            Nom: <span className="text-base font-normal text-[#1d1914]">{immeubleInfo.nom}</span>
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-base font-normal text-[#1d1914]">
            Référence: <span className="text-base font-normal text-[#1d1914]">{immeubleInfo.ref}</span>
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-base font-normal text-[#1d1914]">
            N° d&apos;immeuble: <span className="text-base font-normal text-[#1d1914]">{immeubleInfo.numero}</span>
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-base font-normal text-[#1d1914]">
            Adresse: <span className="text-base font-normal text-[#1d1914]">{fullAddress || "—"}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
