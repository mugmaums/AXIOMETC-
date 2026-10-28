import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { MapPin, Search, Compass, Navigation, Layers, Sparkles, Plus, Trash2, X } from 'lucide-react';

interface AxiometicMapWidgetProps {
  apiKey: string;
}

interface CustomMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  category: string;
}

export const AxiometicMapWidget: React.FC<AxiometicMapWidgetProps> = ({ apiKey }) => {
  const [center, setCenter] = useState({ lat: 37.7749, lng: -122.4194 });
  const [zoom, setZoom] = useState(13);
  const [searchQuery, setSearchQuery] = useState('');
  const [markers, setMarkers] = useState<CustomMarker[]>([
    { id: '1', lat: 37.7749, lng: -122.4194, title: 'AXIOMETIC Central Node', category: 'HQ' },
    { id: '2', lat: 37.7833, lng: -122.4167, title: 'Vaelourix Neural Core', category: 'AI' },
    { id: '3', lat: 37.7692, lng: -122.4467, title: 'Quantum Research Facility', category: 'Lab' },
  ]);
  const [selectedMarker, setSelectedMarker] = useState<CustomMarker | null>(null);
  const [mapStyleMode, setMapStyleMode] = useState<'dark' | 'satellite' | 'hybrid'>('dark');

  // Custom dark styles for Google Maps
  const darkMapStyles = [
    { elementType: 'geometry', stylers: [{ color: '#060913' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#060913' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
    { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
    { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#0a1024' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#111c38' }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1f2937' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#1e3a8a' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#020617' }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#3b82f6' }] }
  ];

  const handleAddMarker = () => {
    const newMarker: CustomMarker = {
      id: `m_${Date.now()}`,
      lat: center.lat + (Math.random() - 0.5) * 0.05,
      lng: center.lng + (Math.random() - 0.5) * 0.05,
      title: searchQuery ? `Location: ${searchQuery}` : 'New Vaelourix Node',
      category: 'Custom'
    };
    setMarkers(prev => [...prev, newMarker]);
    setSelectedMarker(newMarker);
    setSearchQuery('');
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0F172A] text-[#F8FAFC] rounded-xl overflow-hidden border border-slate-700 shadow-xl">
      {/* Widget Header Controls */}
      <div className="p-4 bg-slate-800/90 border-b border-slate-700/80 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-400">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h4 className="font-bold text-[#F8FAFC] text-sm">AxiometicMapWidget & Neural Navigation</h4>
            <p className="text-[11px] font-mono text-slate-400">Advanced Google Maps Platform Integration</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search destination..."
              className="pl-9 pr-4 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-[#F8FAFC] placeholder-slate-400 focus:outline-none focus:border-[#2563EB] font-mono"
            />
          </div>
          <button
            onClick={handleAddMarker}
            className="px-3.5 py-1.5 bg-[#2563EB] hover:bg-blue-500 text-[#F8FAFC] text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Node</span>
          </button>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="flex-1 relative w-full h-[500px]">
        <APIProvider apiKey={apiKey}>
          <Map
            defaultCenter={center}
            defaultZoom={zoom}
            mapId="DEMO_MAP_ID"
            options={{
              styles: mapStyleMode === 'dark' ? darkMapStyles : undefined,
              mapTypeId: mapStyleMode === 'satellite' ? 'satellite' : 'roadmap',
              disableDefaultUI: false,
              zoomControl: true,
            }}
            internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
            style={{ width: '100%', height: '100%' }}
          >
            {markers.map((marker) => (
              <AdvancedMarker
                key={marker.id}
                position={{ lat: marker.lat, lng: marker.lng }}
                title={marker.title}
                onClick={() => setSelectedMarker(marker)}
              >
                <div className="px-2.5 py-1 rounded-lg bg-blue-600 border border-cyan-300 text-white font-mono text-[10px] shadow-lg flex items-center gap-1 animate-pulse">
                  <MapPin className="w-3 h-3 text-cyan-300" />
                  <span>{marker.title}</span>
                </div>
              </AdvancedMarker>
            ))}
          </Map>
        </APIProvider>

        {/* Floating Info Overlay */}
        {selectedMarker && (
          <div className="absolute bottom-6 left-6 p-4 bg-neutral-900/95 backdrop-blur border border-blue-800 rounded-2xl shadow-2xl max-w-sm z-10 space-y-2 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-cyan-300 border border-blue-800">{selectedMarker.category}</span>
              <button onClick={() => setSelectedMarker(null)} className="text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <h5 className="font-bold text-white text-sm">{selectedMarker.title}</h5>
            <p className="text-xs font-mono text-neutral-400">Lat: {selectedMarker.lat.toFixed(4)}, Lng: {selectedMarker.lng.toFixed(4)}</p>
            <div className="flex items-center gap-2 pt-2 border-t border-neutral-800">
              <button
                onClick={() => {
                  setMarkers(prev => prev.filter(m => m.id !== selectedMarker.id));
                  setSelectedMarker(null);
                }}
                className="px-3 py-1 bg-rose-950/80 hover:bg-rose-900 text-rose-300 text-xs rounded-lg font-mono flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Remove Node</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
