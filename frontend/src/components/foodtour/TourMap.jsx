import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet Default Icon
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
});

// Helper: Create custom colored marker icon
const createColoredIcon = (color) => {
    return L.divIcon({
        className: 'custom-marker',
        html: `
            <div style="position: relative;">
                <div style="
                    width: 30px;
                    height: 30px;
                    background-color: ${color};
                    border: 3px solid white;
                    border-radius: 50% 50% 50% 0;
                    transform: rotate(-45deg);
                    box-shadow: 0 3px 6px rgba(0,0,0,0.3);
                "></div>
                <div style="
                    position: absolute;
                    top: 6px;
                    left: 6px;
                    width: 12px;
                    height: 12px;
                    background-color: white;
                    border-radius: 50%;
                "></div>
            </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30]
    });
};

const LOCATIONS = {
    HCM: [10.7769, 106.7009],
};

const SlotColors = {
    unsorted: '#9ca3af',  // gray-400
    morning: '#4ade80',   // green-400
    lunch: '#facc15',     // yellow-400
    afternoon: '#f97316', // orange-500
    dinner: '#a855f7',    // purple-500
};

const FitBounds = ({ markers }) => {
    const map = useMap();
    useEffect(() => {
        if (markers.length > 0) {
            const bounds = L.latLngBounds(markers.map(m => m.position));
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [markers, map]);
    return null;
};

const TourMap = ({ tourItems }) => {
    // Flatten items for polyline: Unsorted is skipped in route, others in chronological order
    const order = ['morning', 'lunch', 'afternoon', 'dinner'];
    
    let allMarkers = [];
    let polylinePositions = [];

    // Add unsorted items to markers (but not to route)
    tourItems.unsorted?.forEach(item => {
        let lat, lon;
        if (item.location?.coordinates) {
            [lon, lat] = item.location.coordinates;
        } else {
            lat = item.lat;
            lon = item.lon;
        }

        if (lat && lon) {
            const pos = [lat, lon];
            allMarkers.push({
                ...item,
                position: pos,
                slotColor: SlotColors.unsorted,
                slotName: 'Chưa sắp xếp'
            });
        }
    });

    // Add scheduled items to markers AND route
    order.forEach(slot => {
        tourItems[slot]?.forEach(item => {
             // Location logic: coordinates [lon, lat] from Mongo OR lat/lon legacy
             let lat, lon;
             if (item.location?.coordinates) {
                 [lon, lat] = item.location.coordinates;
             } else {
                 lat = item.lat;
                 lon = item.lon;
             }

             if (lat && lon) {
                 const pos = [lat, lon];
                 const slotNames = {
                     morning: 'Buổi Sáng',
                     lunch: 'Buổi Trưa',
                     afternoon: 'Buổi Chiều',
                     dinner: 'Buổi Tối'
                 };
                 allMarkers.push({
                     ...item,
                     position: pos,
                     slotColor: SlotColors[slot],
                     slotName: slotNames[slot]
                 });
                 polylinePositions.push(pos);
             }
        });
    });

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden shadow-inner border border-gray-200 z-0">
        <MapContainer 
            center={LOCATIONS.HCM} 
            zoom={13} 
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Markers */}
            {allMarkers.map((marker, idx) => (
                <Marker 
                    key={"" + marker.cartId + "-" + idx} 
                    position={marker.position}
                    icon={createColoredIcon(marker.slotColor)}
                >
                    <Popup>
                        <div className="font-sans">
                            <h3 className="font-bold text-sm mb-1">{marker.name}</h3>
                            <p className="text-xs text-gray-500 mb-1">{marker.address}</p>
                            <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded text-white" style={{ backgroundColor: marker.slotColor }}>
                                {marker.slotName}
                            </span>
                        </div>
                    </Popup>
                </Marker>
            ))}

            {/* Polyline Route */}
            {polylinePositions.length > 1 && (
                <Polyline 
                    positions={polylinePositions} 
                    pathOptions={{ color: '#f97316', weight: 4, opacity: 0.7, dashArray: '10, 10' }} 
                />
            )}

            <FitBounds markers={allMarkers} />
        </MapContainer>

        {/* Legend Overlay */}
        <div className="absolute bottom-4 left-4 bg-white/90 p-2 rounded-lg text-xs font-semibold shadow-md z-[1000] backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-1"><span className="w-3 h-3 rounded-full bg-gray-400"></span> Chưa sắp xếp</div>
            <div className="flex items-center gap-2 mb-1"><span className="w-3 h-3 rounded-full bg-green-400"></span> Sáng</div>
            <div className="flex items-center gap-2 mb-1"><span className="w-3 h-3 rounded-full bg-yellow-400"></span> Trưa</div>
            <div className="flex items-center gap-2 mb-1"><span className="w-3 h-3 rounded-full bg-orange-500"></span> Chiều</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-purple-500"></span> Tối</div>
        </div>
    </div>
  );
};

export default TourMap;
