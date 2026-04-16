import { useState, useEffect } from "react";
import { MapContainer, TileLayer, useMap, GeoJSON } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import MapControl from "./MapControl";

// Constants defined outside the component so they aren't recreated on every render
const INITIAL_BOUNDS = [[40.555476, -9.000239], [41.551844, -7.683809]];
const INITIAL_CENTRE = [40.1598, -7.9842];
const MUNICIPIO_NAME = "Oliveira do Hospital";
const BASE_MAP_URL = "http://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}";
const BASE_MAP_ATTRIBUTION = 'Tiles &copy; Google';

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

// Child component to handle programmatic map updates natively in Leaflet
function MapUpdater({ centre, bounds }) {
    const map = useMap();
    
    useEffect(() => {
        if (bounds) {
            map.setMaxBounds(bounds);
            // Smoothly zooms and pans the map to perfectly fit the new municipality bounds
            map.fitBounds(bounds); 
        }
        if (centre) {
            map.setView(centre, map.getZoom());
        }
    }, [centre, bounds, map]);

    return null;
}

export default function MapViewer() {
    const [ndvi, setNdvi] = useState(false);
    const [ndviUrl, setNdviUrl] = useState("");
    const [bounds, setBounds] = useState(INITIAL_BOUNDS);
    const [centre, setCentre] = useState(INITIAL_CENTRE);
    const [geoJsonData, setGeoJsonData] = useState(null);

    useEffect(() => {
        let ignore = false;

        fetch("/borders.geojson")
            .then((result) => result.json())
            .then((data) => {
                if (!ignore) {
                    const areaMunicipio = data.features.filter(
                        (f) => f.properties.municipio === MUNICIPIO_NAME
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
                        
                        // NEW: Generate and save the inverted mask instead of the raw feature
                        const maskedFeature = createMaskGeoJson(areaMunicipio);
                        setGeoJsonData(maskedFeature);
                    }
                }
            })
            .catch(console.error);

        return () => { ignore = true; };
    }, []);

    useEffect(() => {
        let ignore = false;

        if (ndvi && !ndviUrl) {
            fetch("http://localhost:3000/mapid")
                .then((res) => res.json())
                .then((data) => {
                    if (!ignore) {
                    setNdviUrl(data.url);
                    }
                })
                .catch(console.error);
        }

        return () => { ignore = true; };
    }, [ndvi, ndviUrl]);

    const tileUrl = ndvi ? ndviUrl : BASE_MAP_URL;
    const attribution = ndvi ? '&copy; Google Earth Engine, LusoAlerta' : BASE_MAP_ATTRIBUTION;

    return (
        <MapContainer
            center={INITIAL_CENTRE}
            zoom={16} 
            minZoom={10}
            maxZoom={18}          
            style={{ height: "500px", width: "100%" }}
            maxBounds={INITIAL_BOUNDS}
            maxBoundsViscosity={1.0}
        >
        <MapUpdater centre={centre} bounds={bounds} />
            
        {tileUrl && (
            <TileLayer
                key={tileUrl}
                url={tileUrl}
                tms={false}
                attribution={attribution}
            />
        )}

            {geoJsonData && (
                <GeoJSON 
                    data={geoJsonData} 
                    style={{
                        color: "#ff7800",    
                        weight: 3,           
                        fillColor: "#000000",
                        fillOpacity: 0.6     
                    }}
                />
            )}

        <MapControl onToggle={() => setNdvi((s) => !s)} />
        </MapContainer>
    );
}