import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState, useEffect } from "react";
import MapControl from "./MapControl";

const bounds = [ //cordenadas da area do porto
  [40.555476, -9.000239], // South-West corner
  [41.551844, -7.683809]  // North-East corner
];


export default function MapViewer() {
    const [ndvi, setNdvi] = useState(false);
    const [ndviUrl, setNdviUrl] = useState("");

    useEffect(() => {
        // Fetch the Earth Engine tile URL only when NDVI is toggled on
        if (ndvi && !ndviUrl) {
            fetch("http://localhost:3000/mapid")
                .then((res) => res.json())
                .then((data) => {
                    setNdviUrl(data.url);
                })
                .catch(console.error);
        }
    }, [ndvi, ndviUrl]);

    //google satellite as an alternative base map
    const baseMapUrl = "http://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}";
    const baseMapAttribution = 'Tiles &copy; Google';

    // Use arcgis as a reliable base map.
    // const baseMapUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
    // const baseMapAttribution = 'Tiles &copy; Esri';
    

    // Switch between the base map and the fetched NDVI layer URL
    const tileUrl = ndvi ? ndviUrl : baseMapUrl;

    return (
        <MapContainer
        center={[40.1598, -7.9842]}
        zoom={16} 
        minZoom={9}
        maxZoom={18}          
        style={{ height: "500px", width: "100%" }}
        maxBounds={bounds}
        maxBoundsViscosity={1.0}
        >
        {/* Only render if we have a valid URL to avoid broken image requests */}
        {tileUrl && (
            <TileLayer
                key={tileUrl}
                url={tileUrl}
                tms={false} // Both OSM and Earth Engine tiles use standard XYZ (tms=false)
                attribution={ndvi ? '&copy; Google Earth Engine, LusoAlerta' : baseMapAttribution}
            />
        )}
        <MapControl onToggle={() => setNdvi((s) => !s)} />
        </MapContainer>
    );
}