import { useState } from "react";
import { useNavigate } from "react-router-dom";
    
export default function CreatePOISideMenu({ location, onGoBack }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isPublic, setIsPublic] = useState(false);

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
                onGoBack();
                //atualizar poi no mapa
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
                <br />
                <button type="submit">Criar</button>
                <button type="button" onClick={onGoBack}>
                    Voltar
                </button>
            </form>
        </div>
    );
}