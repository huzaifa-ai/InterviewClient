import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { getSentimentColor,getEmotionEmoji } from '../utils/helper';

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
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
      version: 'weekly',
    });

    loader.load().then(() => {
      if (mapRef.current && !mapInstanceRef.current) {
        const map = new google.maps.Map(mapRef.current, {
          center: { lat: 0, lng: 0 },
          zoom: 2,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }],
            },
          ],
        });

        mapInstanceRef.current = map;
        infoWindowRef.current = new google.maps.InfoWindow();
        updateMarkers();
        setIsLoading(false);
      }
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

    const bounds = new google.maps.LatLngBounds();

    if (!mapInstanceRef.current || !data.length) return;

    // Add new markers
    data.forEach(item => {
      const [lng, lat] = item.location.coordinates;
      const position = new google.maps.LatLng(lat, lng);

      const marker = new google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        title: item.name,
      });

      const contentString = `
        <div class="bg-white rounded-lg shadow-lg overflow-hidden" style="min-width: 300px; max-width: 400px;">
          <div class="p-4 border-b" style="background: linear-gradient(to right, #3B82F6, #2563EB);">
            <h3 class="text-lg font-semibold text-white" style="margin: 0; font-family: system-ui;">${item.name}</h3>
            <span class="inline-block px-2 py-1 mt-2 rounded text-sm" 
                  style="background: rgba(255,255,255,0.2); color: white; font-family: system-ui;">
              ${item.category}
            </span>
          </div>
          
          <div class="p-4" style="font-family: system-ui;">
            <div class="flex items-center mb-3" style="display: flex; align-items: center; margin-bottom: 12px;">
              <div style="background: ${getSentimentColor(item.sentiment.label)}; 
                          padding: 4px 8px; 
                          border-radius: 4px; 
                          color: white; 
                          display: inline-flex; 
                          align-items: center; 
                          gap: 4px;
                          font-size: 14px;">
                <span>${item.sentiment.label}</span>
              </div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
              ${Object.keys(item.sentiment).map((emotion) => `
                <div style="background: #F3F4F6; 
                             padding: 8px; 
                             border-radius: 4px; 
                             display: flex; 
                             align-items: center; 
                             gap: 4px;">
                  <span style="font-size: 16px;">${getEmotionEmoji(emotion)}</span>
                  <div style="flex: 1;">
                    <div style="font-size: 12px; color: #4B5563;">${emotion}</div>
                  </div>
                </div>
              `)
              .join('')}
            </div>
            
            <div class="mt-3" style="margin-top: 12px; font-size: 14px; color: #6B7280;">
              <div style="display: flex; gap: 4px;">
                <span>📍</span>
                <span>${lat.toFixed(4)}, ${lng.toFixed(4)}</span>
              </div>
            </div>
          </div>
        </div>
      `;

      marker.addListener('click', () => {
        if (infoWindowRef.current) {
          infoWindowRef.current.setContent(contentString);
          infoWindowRef.current.open({
            anchor: marker,
            map: mapInstanceRef.current,
            shouldFocus: false,
          });
        }
      });

      markersRef.current.push(marker);
      bounds.extend(position);
    });

    // Fit bounds with padding
    if (markersRef.current.length > 0) {
      mapInstanceRef.current?.fitBounds(bounds, {
        padding: { top: 50, right: 50, bottom: 50, left: 50 }
      });
    }
  };

  return (
    <div className="relative w-full h-full rounded-lg" style={{ minHeight: '400px' }}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading map...</p>
          </div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full rounded-lg" />
    </div>
  );
};

export default Map;
