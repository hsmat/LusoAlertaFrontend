import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState } from "react";
import MapControl from "./MapControl";

const bounds = [ //cordenadas da area do porto
  [40.55547653836869, -9.00023981916341], 
  [41.55184466961709, -7.68380938985860] 
];


export default function MapViewer() {
    const [ndvi, setSatellite] = useState(false);

    return (
        <MapContainer
        center={[41.1, -8.7]}
        zoom={9} 
        minZoom={9}
        maxZoom={12}          
        style={{ height: "500px", width: "100%" }}
        maxBounds={bounds}
        maxBoundsViscosity={1.0}
        >
        <TileLayer
            url={
            ndvi
                ? "http://localhost:3000/tiles/ndvi/{z}/{x}/{y}"
                : "http://localhost:3000/tiles/color/{z}/{x}/{y}"
            }
            
            
            tileSize={256}
            tms={true} 
            attribution="&copy; My Local Tiles"
        />
        <MapControl onToggle={() => setSatellite((s) => !s)} />
        </MapContainer>
    );
}