import { useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface MapProps {
  data: Array<{
    location: {
      coordinates: [number, number];
    };
    name: string;
    category: string;
    sentiment: {
      label: string;
    };
  }>;
}

const Map: React.FC<MapProps> = ({ data }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyDsRy4pRqshdrNkq4LxQq2nPeXMjHRbxkI',
      version: 'weekly',
    });

    loader.load().then(() => {
      if (mapRef.current && !mapInstanceRef.current) {
        mapInstanceRef.current = new google.maps.Map(mapRef.current, {
          center: { lat: 0, lng: 0 },
          zoom: 2,
        });
      }
      updateMarkers();
    });
  }, []); 

  // Separate effect for updating markers when data changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      updateMarkers();
    }
  }, [data]);

  const updateMarkers = () => {
    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    if (!mapInstanceRef.current || !data.length) return;

    const bounds = new google.maps.LatLngBounds();

    // Add new markers
    data.forEach(item => {
      const [lng, lat] = item.location.coordinates;
      const position = { lat, lng };
      
      const marker = new google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        title: item.name,
      });

      // Create info window content
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px">
            <h3 style="margin: 0 0 8px 0; font-weight: bold">${item.name}</h3>
            <p style="margin: 4px 0">Category: ${item.category}</p>
            <p style="margin: 4px 0">Sentiment: ${item.sentiment.label}</p>
          </div>
        `,
      });

      // Add click listener to show info window
      marker.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current, marker);
      });

      markersRef.current.push(marker);
      bounds.extend(position);
    });

    // Fit map to bounds with padding
    // if (markersRef.current.length > 0) {
    //   mapInstanceRef.current.fitBounds(bounds, {
    //     padding: { top: 50, right: 50, bottom: 50, left: 50 }
    //   });
    // }
  };

  return (
    <div 
      ref={mapRef} 
      style={{ width: '100%', height: '100%', minHeight: '400px' }}
      className="rounded-lg overflow-hidden"
    />
  );
};

export default Map;
