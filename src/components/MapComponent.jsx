import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Red marker icon
const redIcon = new L.Icon({
  iconUrl: 'https://png.pngtree.com/png-vector/20221125/ourmid/pngtree-map-position-marker-symbol-vector-png-image_34790780.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41],
});

const LiveLocationMap = () => {
  const [markers, setMarkers] = useState([]);
  const [label, setLabel] = useState('');
  const [position, setPosition] = useState(null);

  // Fetch existing markers from the API
  useEffect(() => {
    const fetchMarkers = async () => {
      try {
        const response = await fetch('http://localhost:1337/api/user-locs?populate=*');
        const data = await response.json();
        
        const fetchedMarkers = data?.data?.map(marker => {
          const attributes = marker?.attributes || {};
          const diseases = attributes.Diseases ? Object.values(attributes.Diseases) : ["No Disease"];
          
          return {
            id: marker.id,
            position: [attributes.Latitude, attributes.Longitude],
            diseases: diseases.flat(), // Flattening the array if it's nested
          };
        });
        setMarkers(fetchedMarkers || []);
      } catch (error) {
        console.error('Error fetching markers:', error);
      }
      finally{
      }
    };
    
    fetchMarkers();
  }, []);

  // Fetch live location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (location) => {
        const { latitude, longitude } = location.coords;
        setPosition([latitude, longitude]);
        console.log(latitude," ",longitude);
      },
      (error) => {
        console.error('Error fetching live location:', error);
      }
    );
  }, []);

  // Add new marker
  const addMarker = async () => {
    if (position && label.trim()) {
      // Check if a marker already exists at this position
      const existingMarker = markers.find(marker =>
        marker.position[0] === position[0] && marker.position[1] === position[1]
      );

      if (existingMarker) {
        // Update existing marker
        const updatedDiseases = {
          ...existingMarker.diseases.reduce((acc, disease, index) => ({ ...acc, [index + 1]: disease }), {}),
          [Object.keys(existingMarker.diseases).length + 1]: label.trim(),
        };
    
        try {
          await fetch(`http://localhost:1337/api/user-locs/${existingMarker.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              data: {
                Diseases: updatedDiseases, // Send updated diseases as JSON object
              },
            }),
          });

          setMarkers(prev => prev.map(marker =>
            marker.id === existingMarker.id
              ? { ...marker, diseases: Object.values(updatedDiseases) }
              : marker
          ));
        } catch (error) {
          console.error('Error updating marker:', error);
        }
      } else {
        // Create new marker
        try {
          const response = await fetch('http://localhost:1337/api/user-locs', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              data: {
                Latitude: position[0],
                Longitude: position[1],
                Diseases: { '1': label.trim() }, // New disease as JSON object
              },
            }),
          });
          
          const newMarker = await response.json();
          setMarkers(prev => [
            ...prev,
            {
              id: newMarker.data.id,
              position: [newMarker.data.attributes.Latitude, newMarker.data.attributes.Longitude],
              diseases: Object.values(newMarker.data.attributes.Diseases),
            },
          ]);
          setLabel(''); // Clear input after adding marker
        } catch (error) {
          console.error('Error adding marker:', error);
        }
      }
    }
  };

  return (
    <div>
      <h2>Live Location Map with Disease Markers</h2>
      <label>
        Enter Disease Label:
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Enter disease here"
        />
      </label>
      <button onClick={addMarker}>Add Marker</button>

      {position ? (
        <MapContainer center={position} zoom={13} style={{ height: '100vh', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          {markers.map((marker) => (
            <Marker key={marker.id} position={marker.position} icon={redIcon}>
              <Popup>
                {marker.diseases.join(', ')} {/* Show all diseases for the marker */}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      ) : (
        <p>Fetching live location...</p>
      )}
    </div>
  );
};

export default LiveLocationMap;