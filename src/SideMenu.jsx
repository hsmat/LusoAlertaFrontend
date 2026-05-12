import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SideMenu({ showPOI, setShowPOI, ownPOIOnly, setOwnPOIOnly, municipality, setMunicipality }) {
    const [municipalities, setMunicipalities] = useState([]);
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

            <button onClick={handleLogout} className="logout-btn">
                Logout
            </button>
        </div>
    );
}