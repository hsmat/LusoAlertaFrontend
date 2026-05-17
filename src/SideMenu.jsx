import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SideMenu({ showPOI, setShowPOI, ownPOIOnly, setOwnPOIOnly, municipality, setMunicipality, municipalityArea }) {
    const [municipalities, setMunicipalities] = useState([]);
    const [municipalityStats, setMunicipalityStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(false);
    const navigate = useNavigate();
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        const fetchMunicipalities = async () => {
            try {
                const res = await fetch(`http://localhost:3000/municipality?userId=${userId}`);
                const data = await res.json();
                
                if (data.success) {
                    setMunicipalities(data.municipalities);
                    
                    // Automatically select the first municipality if none is currently selected
                    if (data.municipalities.length > 0) {
                        setMunicipality(prev => prev || data.municipalities[0].name);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch municipalities:", error);
            }
        };

        if (userId) {
            fetchMunicipalities();
        }
    }, [userId, setMunicipality]); // Removed 'municipality' to prevent re-fetching on dropdown change

    useEffect(() => {
        const fetchStats = async () => {
            if (!municipality) return;
            setStatsLoading(true);
            try {
                const res = await fetch(`http://localhost:3000/municipality/stats?name=${encodeURIComponent(municipality)}`);
                const data = await res.json();
                if (data.success) {
                    setMunicipalityStats(data.stats);
                } else {
                    setMunicipalityStats(null);
                }
            } catch (error) {
                console.error("Failed to fetch municipality stats:", error);
                setMunicipalityStats(null);
            } finally {
                setStatsLoading(false);
            }
        };

        fetchStats();
    }, [municipality]);

    const handleLogout = () => {
        localStorage.removeItem('userId');
        navigate("/");
    };

    return (
        <div className="side-menu">
            <p>Bem vindo, utilizador {userId}!</p>
            <label>
                <input
                    type="checkbox"
                    checked={showPOI}
                    onChange={(e) => setShowPOI(e.target.checked)}
                />
                Mostrar Pontos de Interesse
            </label>
            <label>
                <input
                    type="checkbox"
                    checked={ownPOIOnly}
                    onChange={(e) => setOwnPOIOnly(e.target.checked)}
                />
                Apenas os meus
            </label>
            
            <select 
                className="custom-select"
                value={municipality || ""} 
                onChange={(e) => setMunicipality(e.target.value)}
            >
                {municipalities.map((m, index) => (
                    <option key={index} value={m.name}>
                        {m.name}
                    </option>
                ))}
            </select>

            <div className="stats-box">
                <h4>Estatísticas de Risco</h4>
                {statsLoading ? (
                    <p>A carregar estatísticas do Earth Engine...</p>
                ) : municipalityStats ? (
                    <div>
                        <p><strong>Área do Município:</strong> {municipalityArea ? municipalityArea.toFixed(2) + " ha" : "N/A"}</p>
                        <p><strong>Risco Médio do Município:</strong> {municipalityStats.meanVci}</p>
                    </div>
                ) : (
                    <p>Sem dados disponíveis.</p>
                )}
            </div>

            <button onClick={handleLogout} className="logout-btn" style={{ marginTop: '15px' }}>
                Logout
            </button>
        </div>
    );
}