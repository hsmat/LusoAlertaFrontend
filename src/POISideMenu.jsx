import { useEffect, useState } from "react";

export default function POISideMenu({ poiId, onGoBack, onPoiUpdated }) {
        const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isPublic, setIsPublic] = useState(false);
    const [isOwner, setIsOwner] = useState(false);

    useEffect(() => {
        let ignore = false;
        const controller = new AbortController();

        const fetchPOI = async () => {
            try {
                const res = await fetch(`http://localhost:3000/poi?poiId=${poiId}`, { signal: controller.signal });
                const data = await res.json();
                
                if (!ignore && data.success && data.poi.length > 0) {
                    const poi = data.poi[0];
                    setTitle(poi.title);
                    setDescription(poi.description);
                    setIsPublic(poi.public === 1);
                    
                    const loggedUserId = localStorage.getItem("userId");
                    if (String(poi.creator) === String(loggedUserId)) {
                        setIsOwner(true);
                    }
                }
            } catch (err) {
                if (err.name !== "AbortError") {
                    console.error("Erro ao carregar detalhes do POI:", err);
                }
            }
        };

        if (poiId) {
            fetchPOI();
        }

        return () => {
            ignore = true;
            controller.abort();
        };
    }, [poiId]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`http://localhost:3000/poi/${poiId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title,
                    description,
                    isPublic
                }),
            });
            const data = await res.json();
            if (data.success) {
                onPoiUpdated();
            }
        } catch (err) {
            console.error("Erro ao atualizar POI:", err);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Tem a certeza que quer apagar este Ponto de Interesse?")) {
            return;
        }

        try {
            const res = await fetch(`http://localhost:3000/poi/${poiId}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (data.success) {
                onPoiUpdated(); // Atualiza o mapa e fecha o menu
            } else {
                console.error("Erro ao apagar POI:", data.message);
            }
        } catch (err) {
            console.error("Erro ao apagar POI:", err);
        }
    };

    return (
        <div>
            <h2>Ver Ponto de Interesse</h2>
            <form onSubmit={handleUpdate}>
                <input
                    type="text"
                    placeholder="Título"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={!isOwner}
                />
                <br />
                <textarea
                    placeholder="Descrição"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={!isOwner}
                />
                <input
                    type="checkbox"
                    id="isPublic"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    disabled={!isOwner}
                />
                <label htmlFor="isPublic">Público</label>
                <br />
                {isOwner && <button type="submit">Guardar</button>}
                {isOwner && <button type="button" onClick={handleDelete} style={{ marginBottom: '10px', backgroundColor: 'red', color: 'white' }}>Apagar</button>}
                <button type="button" onClick={onGoBack}>
                    Voltar
                </button>
            </form>
        </div>
    );
}
