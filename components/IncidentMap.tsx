'use client';

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Incident {
  id: number;
  lat: number;
  lng: number;
  category: string;
  description: string;
}

interface IncidentMapProps {
  incidents: Incident[];
  onAddIncident: (lat: number, lng: number) => void;
}

const IncidentMap: React.FC<IncidentMapProps> = ({ incidents, onAddIncident }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const MapEvents = () => {
    useMapEvents({
      click(e) {
        onAddIncident(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  };

  const getMarkerIcon = (category: string) => {
    return L.icon({
      iconUrl: `/icons/${category}.png`,
      iconSize: [25, 25],
    });
  };

  if (!isMounted) {
    return null;
  }

  return (
    <MapContainer center={[52.1332, -106.6700]} zoom={13} style={{ height: '400px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <MapEvents />
      {incidents.map((incident) => (
        <Marker 
          key={incident.id} 
          position={[incident.lat, incident.lng]}
          icon={getMarkerIcon(incident.category)}
        >
          <Popup>
            <h3>{incident.category}</h3>
            <p>{incident.description}</p>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default IncidentMap;
