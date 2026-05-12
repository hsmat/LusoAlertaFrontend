import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap, GeoJSON } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import MapControl from "./MapControl";
import customMarkerImage from "./assets/logo_lusoAlerta.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Constants defined outside the component so they aren't recreated on every render
const INITIAL_CENTRE = [40.1598, -7.9842];
const BASE_MAP_URL = "http://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}";
const BASE_MAP_ATTRIBUTION = 'Tiles &copy; Google';

L.Icon.Default.mergeOptions({
    iconUrl: customMarkerImage,
    shadowUrl: markerShadow,
});

function createMaskGeoJson(features) {
    // 1. Create a massive bounding box covering the world [longitude, latitude]
    const worldRing = [
        [-360, 90], [-360, -90], [360, -90], [360, 90], [-360, 90]
    ];

    const rings = [];

    features.forEach(feature => {
        if (feature.geometry.type === "Polygon") {
            rings.push(...feature.geometry.coordinates);
        } else if (feature.geometry.type === "MultiPolygon") {
            feature.geometry.coordinates.forEach(polygon => {
                rings.push(...polygon);
            });
        }
    });

    return {
        type: "Feature",
        properties: {},
        geometry: {
            type: "Polygon",
            coordinates: [worldRing, ...rings]
        }
    };
}

function MapRightClick({ onRightClick }) {
    useMapEvents({
        contextmenu(e) {
            onRightClick(e.latlng);
        }
    });

    return null;
}

// Child component to handle programmatic map updates natively in Leaflet
function MapUpdater({ centre, bounds }) {
    const map = useMap();
    
    useEffect(() => {
        if (bounds) {
            map.setMaxBounds(null); 
            
            map.flyToBounds(bounds, { duration: 1.5 });
            
            map.once('moveend', () => {
                const leafletBounds = L.latLngBounds(bounds);
                map.setMaxBounds(leafletBounds);
                map.setMinZoom(12);
            });
        } else if (centre) {
            map.setView(centre, map.getZoom());
        }
    }, [centre, bounds, map]);

    return null;
}

function POIPopupContent({ poi, setSelectedPoiId, setSideMenuType }) {
    const map = useMap();
    
    return (
        <div>
            <strong>{poi.title}</strong>
            <button
                type="button"
                onClick={() => {
                    setSelectedPoiId(poi.id);
                    setSideMenuType("POIDetails");
                    map.closePopup(); // Fecha o popup atual
                }}
            >
                Ver detalhes
            </button>
        </div>
    );
}

export default function MapViewer({ 
    showPOI, 
    ownPOIOnly, 
    setSelectedLocation, 
    setSelectedPoiId, 
    setSideMenuType, 
    municipality,
    refreshTrigger 
}) {
    const [ndvi, setNdvi] = useState(false);
    const [ndviUrl, setNdviUrl] = useState("");
    const [bounds, setBounds] = useState(null);
    const [centre, setCentre] = useState(null);
    const [pois, setPois] = useState([]);
    const [clickedPos, setClickedPos] = useState(null);
    const [geoJsonData, setGeoJsonData] = useState(null);
    const [tilesLoading, setTilesLoading] = useState(false);

    useEffect(() => {
        let ignore = false;
        const controller = new AbortController();

        const fetchPOIs = async () => {
            try {
                const userId = localStorage.getItem("userId");
                const url = ownPOIOnly ? `http://localhost:3000/poi?userId=${userId}` : "http://localhost:3000/poi";
                const res = await fetch(url, { signal: controller.signal });
                
                const data = await res.json();

                if (!ignore && data.success) {
                    setPois(data.poi);
                }
            } catch (err) {
                if (err.name !== "AbortError") console.error(err);
            }
        };

        if (showPOI) {
            fetchPOIs();
        } else {
            setPois([]);
        }

        return () => {
            ignore = true;
            controller.abort();
        };

    }, [showPOI, ownPOIOnly, refreshTrigger]);

    useEffect(() => {
        let ignore = false;

        setGeoJsonData(null); // Limpa a borda anterior imediatamente ao trocar de município
        setNdvi(false);       // Turns off the VCI layer when the location changes
        setNdviUrl("");       // Clears the previous GEE tile URL
        fetch("/borders.geojson")
            .then((result) => result.json())
            .then((data) => {
                if (!ignore) {
                    const areaMunicipio = data.features.filter(
                        (f) => f.properties.municipio === municipality
                    );
                    
                    if (areaMunicipio.length > 0) {
                        const features = L.geoJSON(areaMunicipio);
                        const calculatedBounds = features.getBounds();
                        const calculatedCenter = calculatedBounds.getCenter();
                        
                        setBounds([
                            [calculatedBounds.getSouthWest().lat, calculatedBounds.getSouthWest().lng],
                            [calculatedBounds.getNorthEast().lat, calculatedBounds.getNorthEast().lng]
                        ]);
                        setCentre([calculatedCenter.lat, calculatedCenter.lng]);
                        
                        const maskedFeature = createMaskGeoJson(areaMunicipio);
                        setGeoJsonData(maskedFeature);
                    }
                }
            })
            .catch(console.error);

        return () => { ignore = true; };
    }, [municipality]);

    useEffect(() => {
        let ignore = false;
        const controller = new AbortController();

        if (ndvi && !ndviUrl) {
            fetch(`http://localhost:3000/mapid`, { signal: controller.signal })
                .then((res) => res.json())
                .then((data) => {
                    if (!ignore) {
                    setNdviUrl(data.url);
                    }
                })
                .catch((err) => {
                    if (err.name !== 'AbortError') {
                        console.error(err);
                    }
                });
        }

        return () => { 
            ignore = true; 
            controller.abort(); 
        };
    }, [ndvi, ndviUrl]);

    return (
        <MapContainer
            center={INITIAL_CENTRE}
            zoom={6} 
            minZoom={6}
            maxZoom={18}          
            style={{ height: "100%", width: "100%" }}
        >
            <MapUpdater centre={centre} bounds={bounds} />
                
            <TileLayer
                url={BASE_MAP_URL}
                attribution={BASE_MAP_ATTRIBUTION}
                zIndex={0} 
            />
            {ndvi && ndviUrl && (
                <TileLayer
                    key={ndviUrl}
                    url={ndviUrl}
                    tms={false}
                    attribution='&copy; Google Earth Engine, LusoAlerta'
                    transparent={true} 
                    opacity={0.7}      
                    zIndex={10}
                    maxNativeZoom={13}
                    updateWhenIdle={true}
                    keepBuffer={2}
                    eventHandlers={{
                        loading: () => setTilesLoading(true),
                        load: () => setTilesLoading(false)
                    }}
                />
            )}
            {geoJsonData && (
                <GeoJSON 
                    key={municipality}
                    data={geoJsonData} 
                    style={{
                        color: "#ff7800",    
                        weight: 3,           
                        fillColor: "#000000",
                        fillOpacity: 0.6     
                    }}
                />
            )}
            <MapControl 
                onToggle={() => setNdvi((s) => !s)} 
                isActive={ndvi}
                isLoading={ndvi && (!ndviUrl || tilesLoading)} // It is loading ONLY if ON, and missing URL or downloading tiles
            />
            
            {pois.map((poi, index) => (
                <Marker key={index} position={[poi.latitude, poi.longitude]}>
                    <Popup>
                        <POIPopupContent 
                            poi={poi} 
                            setSelectedPoiId={setSelectedPoiId} 
                            setSideMenuType={setSideMenuType} 
                        />
                    </Popup>
                </Marker>
            ))}

            <MapRightClick onRightClick={setClickedPos} />

            {clickedPos && (
                <Popup position={clickedPos} onClose={() => setClickedPos(null)}>
                    <div>
                        <button onClick={() => {
                            setSelectedLocation(clickedPos);
                            setSideMenuType("createPOI");
                            setClickedPos(null);
                        }}>
                            Criar Ponto de Interesse
                        </button>
                    </div>
                </Popup>
            )}
        </MapContainer>
    );
}