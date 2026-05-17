import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
    
export default function CreatePOISideMenu({ location, onGoBack, onPoiCreated }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isPublic, setIsPublic] = useState(false);
    
    const [risk, setRisk] = useState("A carregar...");
    const [riskDate, setRiskDate] = useState(null);
    const [freguesiaInfo, setFreguesiaInfo] = useState(null);

    useEffect(() => {
        let ignore = false;
        
        if (location) {
            setRisk("A carregar...");
            setFreguesiaInfo(null);
            fetch(`http://localhost:3000/pixel-risk?lat=${location.lat}&lng=${location.lng}`)
                .then(res => res.json())
                .then(data => {
                    if (!ignore && data.success) {
                        setRisk(data.vci);
                        setRiskDate(new Date().toLocaleString());
                        if (data.freguesia && data.municipio) {
                            setFreguesiaInfo(`${data.freguesia}, ${data.municipio}`);
                        }
                    } else if (!ignore) {
                        setRisk("Zona urbana ou sem dados");
                    }
                })
                .catch(() => {
                    if (!ignore) setRisk("Erro");
                });
        }

        return () => { ignore = true; };
    }, [location]);

    const createPOI = async (e) => {
        e.preventDefault();

        try {
            const userId = localStorage.getItem("userId");

            const res = await fetch("http://localhost:3000/poi", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    latitude: location.lat,
                    longitude: location.lng,
                    description: description,
                    title: title,
                    isPublic: isPublic,
                    creator: userId
                }),
            });

            const data = await res.json();

            if (data.success) {
                onPoiCreated();
            }

        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div>
            <h2>Criar Ponto de Interesse</h2>
            <form onSubmit={createPOI}>
                <input
                    type="text"
                    placeholder="Título"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <br />
                <textarea
                    placeholder="Descrição"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <input
                    type="checkbox"
                    id="isPublic"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                />
                <label htmlFor="isPublic">Público</label>
                
                <div className="stats-box">
                    {freguesiaInfo && <p><strong>Freguesia:</strong> {freguesiaInfo}</p>}
                    <p><strong>Risco no Ponto:</strong> {risk}</p>
                    {riskDate && <p><strong>Cálculo VCI:</strong> {riskDate}</p>}
                </div>
                
                <br />
                <button type="submit" disabled={risk === "A carregar..."}>Criar</button>
                <button type="button" onClick={onGoBack}>
                    Voltar
                </button>
            </form>
        </div>
    );
}