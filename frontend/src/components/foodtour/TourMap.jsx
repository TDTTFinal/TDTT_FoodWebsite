import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getRoute, getHaversineDistance, getRouteDistance } from '../../services/osrmService';

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

// User location icon (blue pulsing dot style)
const userLocationIcon = L.divIcon({
    className: 'user-location-marker',
    html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
            <div style="
                width: 20px;
                height: 20px;
                background-color: #3b82f6;
                border: 3px solid white;
                border-radius: 50%;
                box-shadow: 0 2px 8px rgba(59, 130, 246, 0.5);
            "></div>
            <div style="
                position: absolute;
                width: 40px;
                height: 40px;
                background-color: rgba(59, 130, 246, 0.2);
                border-radius: 50%;
                animation: pulse 2s infinite;
            "></div>
        </div>
        <style>
            @keyframes pulse {
                0% { transform: scale(0.8); opacity: 1; }
                100% { transform: scale(1.5); opacity: 0; }
            }
        </style>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
});

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

const FitBounds = ({ markers, userLocation }) => {
    const map = useMap();
    useEffect(() => {
        const allPositions = [...markers.map(m => m.position)];
        if (userLocation) {
            allPositions.push(userLocation);
        }
        if (allPositions.length > 0) {
            const bounds = L.latLngBounds(allPositions);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [markers, userLocation, map]);
    return null;
};

const TourMap = ({ tourItems }) => {
    const [userLocation, setUserLocation] = useState(null);
    const [routeGeometry, setRouteGeometry] = useState([]);
    const [routeInfo, setRouteInfo] = useState({ distance: 0, duration: 0 });
    const [isLoadingRoute, setIsLoadingRoute] = useState(false);

    // Get user location on mount
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation([position.coords.latitude, position.coords.longitude]);
                },
                (error) => {
                    console.log('Geolocation error:', error.message);
                    // Fallback to HCM center if location denied
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
            );
        }
    }, []);

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

    // Fetch OSRM route when polyline positions change
    // Route order: User Location -> Morning -> Lunch -> Afternoon -> Dinner
    useEffect(() => {
        const fetchRoute = async () => {
            // Need at least 1 restaurant position (user location will be prepended)
            if (polylinePositions.length < 1) {
                setRouteGeometry([]);
                setRouteInfo({ distance: 0, duration: 0 });
                return;
            }

            // If only 1 position and no user location, can't draw route
            if (polylinePositions.length < 2 && !userLocation) {
                setRouteGeometry([]);
                setRouteInfo({ distance: 0, duration: 0 });
                return;
            }

            setIsLoadingRoute(true);

            // Build route: start from user location if available
            let routePoints = [...polylinePositions];
            if (userLocation) {
                routePoints = [userLocation, ...routePoints];
            }

            // Convert to OSRM format: [lon, lat]
            const coordinates = routePoints.map(pos => [pos[1], pos[0]]);

            try {
                const result = await getRoute(coordinates);
                
                if (result.success && result.geometry.length > 0) {
                    setRouteGeometry(result.geometry);
                    setRouteInfo({
                        distance: result.distance,
                        duration: result.duration
                    });
                } else {
                    // Fallback to straight lines if OSRM fails
                    console.warn('OSRM route failed, using straight lines:', result.error);
                    setRouteGeometry(routePoints);
                    setRouteInfo({ distance: 0, duration: 0 });
                }
            } catch (error) {
                console.error('Route fetch error:', error);
                setRouteGeometry(routePoints);
                setRouteInfo({ distance: 0, duration: 0 });
            } finally {
                setIsLoadingRoute(false);
            }
        };

        fetchRoute();
    }, [JSON.stringify(polylinePositions), JSON.stringify(userLocation)]); // Include userLocation in dependencies

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
            
            {/* User Location Marker */}
            {userLocation && (
                <>
                    <Circle 
                        center={userLocation}
                        radius={100}
                        pathOptions={{ 
                            color: '#3b82f6', 
                            fillColor: '#3b82f6', 
                            fillOpacity: 0.1,
                            weight: 1
                        }}
                    />
                    <Marker position={userLocation} icon={userLocationIcon}>
                        <Popup>
                            <div className="font-sans text-center">
                                <h3 className="font-bold text-sm text-blue-600">📍 Vị trí của bạn</h3>
                                <p className="text-xs text-gray-500">Vị trí hiện tại</p>
                            </div>
                        </Popup>
                    </Marker>
                </>
            )}

            {/* Restaurant Markers */}
            {allMarkers.map((marker, idx) => {
                // Calculate distance from user to this marker
                const distanceFromUser = userLocation 
                    ? getHaversineDistance(
                        userLocation[0], userLocation[1],
                        marker.position[0], marker.position[1]
                      ).toFixed(1)
                    : null;

                return (
                    <Marker 
                        key={"" + marker.cartId + "-" + idx} 
                        position={marker.position}
                        icon={createColoredIcon(marker.slotColor)}
                    >
                        <Popup>
                            <div className="font-sans min-w-[180px]">
                                <h3 className="font-bold text-sm mb-1">{marker.name}</h3>
                                <p className="text-xs text-gray-500 mb-2">{marker.address}</p>
                                
                                {/* Distance from user */}
                                {distanceFromUser && (
                                    <div className="flex items-center gap-1 text-xs text-blue-600 mb-2 bg-blue-50 px-2 py-1 rounded">
                                        <span>📍</span>
                                        <span>Cách bạn <strong>{distanceFromUser} km</strong></span>
                                    </div>
                                )}
                                
                                <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded text-white" style={{ backgroundColor: marker.slotColor }}>
                                    {marker.slotName}
                                </span>
                            </div>
                        </Popup>
                    </Marker>
                );
            })}

            {/* Route Polyline - Now uses OSRM road geometry */}
            {routeGeometry.length > 1 && (
                <Polyline 
                    positions={routeGeometry} 
                    pathOptions={{ 
                        color: '#f97316', 
                        weight: 4, 
                        opacity: 0.8,
                        // Solid line for real route, dashed for fallback
                        dashArray: routeInfo.distance > 0 ? undefined : '10, 10'
                    }} 
                />
            )}

            <FitBounds markers={allMarkers} userLocation={userLocation} />
        </MapContainer>

        {/* Route Info Overlay */}
        {routeInfo.distance > 0 && (
            <div className="absolute top-4 right-4 bg-white/95 px-3 py-2 rounded-lg text-xs font-semibold shadow-lg z-[1000] backdrop-blur-sm border border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-orange-600">
                        <span>🚗</span>
                        <span>{routeInfo.distance.toFixed(1)} km</span>
                    </div>
                    <div className="w-px h-4 bg-gray-300"></div>
                    <div className="flex items-center gap-1 text-blue-600">
                        <span>⏱️</span>
                        <span>{Math.round(routeInfo.duration)} phút</span>
                    </div>
                </div>
            </div>
        )}

        {/* Loading Indicator */}
        {isLoadingRoute && (
            <div className="absolute top-4 right-4 bg-white/95 px-3 py-2 rounded-lg text-xs font-semibold shadow-lg z-[1000] backdrop-blur-sm border border-gray-200">
                <div className="flex items-center gap-2 text-gray-600">
                    <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang tính lộ trình...</span>
                </div>
            </div>
        )}

        {/* Legend Overlay */}
        <div className="absolute bottom-4 left-4 bg-white/90 p-2 rounded-lg text-xs font-semibold shadow-md z-[1000] backdrop-blur-sm">
            {userLocation && (
                <div className="flex items-center gap-2 mb-1 pb-1 border-b border-gray-200">
                    <span className="w-3 h-3 rounded-full bg-blue-500 ring-2 ring-blue-200"></span> Vị trí của bạn
                </div>
            )}
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
