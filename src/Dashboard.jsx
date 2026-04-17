import SideMenu from './SideMenu.jsx';
import MapViewer from './MapViewer.jsx';
import CreatePOISideMenu from './CreatePOISideMenu.jsx';
import './Dashboard.css';
import { Navigate } from "react-router-dom";
import { useState } from "react";

export default function Dashboard() {
    const [showPOI, setShowPOI] = useState(false);
    const [ownPOIOnly, setOwnPOIOnly] = useState(false);
    const [sideMenuType, setSideMenuType] = useState("default");
    const [selectedLocation, setSelectedLocation] = useState(null);

    if (!localStorage.getItem("userId")) {
        return <Navigate to="/login" />;
    }

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
                        />
                    </div>
                )}

                {sideMenuType === "createPOI" && (
                    <CreatePOISideMenu
                        location={selectedLocation}
                        onGoBack={() => setSideMenuType("default")}
                    />
                )}
            </div>
            <div className="content">
                <MapViewer
                    showPOI={showPOI}
                    ownPOIOnly={ownPOIOnly}
                    setSelectedLocation={setSelectedLocation}
                    setSideMenuType={setSideMenuType}
                />
            </div>
        </div>
    );
}