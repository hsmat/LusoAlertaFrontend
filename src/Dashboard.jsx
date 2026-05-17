import SideMenu from './SideMenu.jsx';
import MapViewer from './MapViewer.jsx';
import CreatePOISideMenu from './CreatePOISideMenu.jsx';
import './Dashboard.css';
import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import POISideMenu from './POISideMenu.jsx';

export default function Dashboard() {
    const [showPOI, setShowPOI] = useState(false);
    const [ownPOIOnly, setOwnPOIOnly] = useState(false);
    const [municipality, setMunicipality] = useState(null);
    const [municipalityArea, setMunicipalityArea] = useState(null);
    const [sideMenuType, setSideMenuType] = useState("default");
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [selectedPOIId, setSelectedPOIId] = useState(null);
    const [poiUpdateCounter, setPoiUpdateCounter] = useState(0);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    if (!localStorage.getItem("userId")) {
        return <Navigate to="/login" />;
    }

    // Automatically slide open the mobile sidebar if the user clicks a map pin
    useEffect(() => {
        if (sideMenuType !== "default") {
            setIsMobileMenuOpen(true);
        }
    }, [sideMenuType]);

    const handlePoiChange = () => {
        setPoiUpdateCounter(prev => prev + 1);
        setSideMenuType("default");
        setSelectedPOIId(null);
        setIsMobileMenuOpen(false); 
    };

    return (
        <div className="container">
            {/* Dark Mobile Overlay (Clicking it closes the menu) */}
            <div 
                className={`mobile-overlay ${isMobileMenuOpen ? "active" : ""}`} 
                onClick={() => setIsMobileMenuOpen(false)}
            ></div>
            
            <div className={`sidebar ${isMobileMenuOpen ? "open" : ""}`}>
                <button className="mobile-close-btn" onClick={() => setIsMobileMenuOpen(false)}>
                    &times;
                </button>
                
                {sideMenuType === "default" && (
                    <SideMenu 
                        showPOI={showPOI}
                        setShowPOI={setShowPOI}
                        ownPOIOnly={ownPOIOnly}
                        setOwnPOIOnly={setOwnPOIOnly}
                        municipality={municipality}
                        setMunicipality={setMunicipality}
                        municipalityArea={municipalityArea}
                    />
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
                <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                </button>

                <MapViewer
                    showPOI={showPOI}
                    ownPOIOnly={ownPOIOnly}
                    setSelectedLocation={setSelectedLocation}
                    setSelectedPoiId={setSelectedPOIId}
                    setSideMenuType={setSideMenuType}
                    municipality={municipality}
                    setMunicipalityArea={setMunicipalityArea}
                    refreshTrigger={poiUpdateCounter}
                />
            </div>
        </div>
    );
}