import SideMenu from './SideMenu.jsx';
import MapViewer from './MapViewer.jsx';
import CreatePOISideMenu from './CreatePOISideMenu.jsx';
import './Dashboard.css';
import { Navigate } from "react-router-dom";
import { useState } from "react";
import POISideMenu from './POISideMenu.jsx';

export default function Dashboard() {
    const [showPOI, setShowPOI] = useState(false);
    const [ownPOIOnly, setOwnPOIOnly] = useState(false);
    const [municipality, setMunicipality] = useState(null);
    const [sideMenuType, setSideMenuType] = useState("default");
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [selectedPOIId, setSelectedPOIId] = useState(null);
    const [poiUpdateCounter, setPoiUpdateCounter] = useState(0);

    if (!localStorage.getItem("userId")) {
        return <Navigate to="/login" />;
    }

    const handlePoiChange = () => {
        setPoiUpdateCounter(prev => prev + 1);
        setSideMenuType("default");
        setSelectedPOIId(null);
    };

    return (
        <div className="container">
            
            <div className="sidebar">
                {sideMenuType === "default" && (
                    <div className="sidebar">
                        <SideMenu 
                            showPOI={showPOI}
                            setShowPOI={setShowPOI}
                            ownPOIOnly={ownPOIOnly}
                            setOwnPOIOnly={setOwnPOIOnly}
                            municipality={municipality}
                            setMunicipality={setMunicipality}
                        />
                    </div>
                )}

                {sideMenuType === "createPOI" && (
                    <CreatePOISideMenu
                        location={selectedLocation}
                        onPoiCreated={handlePoiChange}
                        onGoBack={() => setSideMenuType("default")}
                    />
                )}

                {sideMenuType === "POIDetails" && (
                    <POISideMenu
                        poiId={selectedPOIId}
                        onPoiUpdated={handlePoiChange}
                        onGoBack={() => {
                            setSideMenuType("default");
                            setSelectedPOIId(null);
                        }}
                    />
                )}
            </div>
            <div className="content">
                <MapViewer
                    showPOI={showPOI}
                    ownPOIOnly={ownPOIOnly}
                    setSelectedLocation={setSelectedLocation}
                    setSelectedPoiId={setSelectedPOIId}
                    setSideMenuType={setSideMenuType}
                    municipality={municipality}
                    refreshTrigger={poiUpdateCounter}
                />
            </div>
        </div>
    );
}