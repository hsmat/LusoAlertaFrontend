import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

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

export default function MapViewer({ showPOI, ownPOIOnly, setSelectedLocation, setSideMenuType }) {
    const [pois, setPois] = useState([]);
    const [clickedPos, setClickedPos] = useState(null);
    const center = [38.7169, -9.1399];

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

    return (
        <MapContainer
            center={center}
            zoom={13}
            style={{ height: "100vh", width: "100%" }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
            />

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