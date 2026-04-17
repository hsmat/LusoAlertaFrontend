import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import MapControl from "./MapControl";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Constants defined outside the component so they aren't recreated on every render
const INITIAL_BOUNDS = [[40.555476, -9.000239], [41.551844, -7.683809]];
const INITIAL_CENTRE = [40.1598, -7.9842];
const MUNICIPIO_NAME = "Oliveira do Hospital";
const BASE_MAP_URL = "http://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}";
const BASE_MAP_ATTRIBUTION = 'Tiles &copy; Google';

L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

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

export default function MapViewer({ showPOI, ownPOIOnly, setSelectedLocation, setSideMenuType }) {
    const [ndvi, setNdvi] = useState(false);
    const [ndviUrl, setNdviUrl] = useState("");
    const [bounds, setBounds] = useState(INITIAL_BOUNDS);
    const [centre, setCentre] = useState(INITIAL_CENTRE);
    const [pois, setPois] = useState([]);
    const [clickedPos, setClickedPos] = useState(null);

    useEffect(() => {
        const fetchPOIs = async () => {
            try {
                const userId = localStorage.getItem("userId");
                const url = ownPOIOnly ? `http://localhost:3000/poi?userId=${userId}` : "http://localhost:3000/poi";
                const res = await fetch(url);
                
                const data = await res.json();

                if (data.success) {
                    setPois(data.poi);
                }
            } catch (err) {
                //erro?
            }
        };

        if (showPOI) {
            fetchPOIs();
        } else {
            setPois([]);
        }

    }, [showPOI, ownPOIOnly]);

    useEffect(() => {
        let ignore = false;

        fetch("/borders.geojson")
            .then((result) => result.json())
            .then((data) => {
                if (!ignore) {
                    const areaMunicipio = data.features.find(
                        (f) => f.properties.municipio === MUNICIPIO_NAME
                    );
                    
                    if (areaMunicipio) {
                    const feature = L.geoJSON(areaMunicipio);
                    const calculatedBounds = feature.getBounds();
                    const calculatedCenter = calculatedBounds.getCenter();
                    
                    setBounds([
                        [calculatedBounds.getSouthWest().lat, calculatedBounds.getSouthWest().lng],
                        [calculatedBounds.getNorthEast().lat, calculatedBounds.getNorthEast().lng]
                    ]);
                    setCentre([calculatedCenter.lat, calculatedCenter.lng]);
                    }
                }
            })
            .catch(console.error);

        return () => {
            ignore = true;
        };
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

        return () => {
            ignore = true;
        };
    }, [ndvi, ndviUrl]);

    const tileUrl = ndvi ? ndviUrl : BASE_MAP_URL;
    const attribution = ndvi ? '&copy; Google Earth Engine, LusoAlerta' : BASE_MAP_ATTRIBUTION;

    return (
        <MapContainer
            center={INITIAL_CENTRE}
            zoom={16} 
            minZoom={9}
            maxZoom={17}          
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
            <MapControl onToggle={() => setNdvi((s) => !s)} />
            
            {pois.map((poi, index) => (
                <Marker key={index} position={[poi.latitude, poi.longitude]}>
                    <Popup>{poi.description}</Popup>
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