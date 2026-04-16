import { useNavigate } from "react-router-dom";

export default function SideMenu({ showPOI, setShowPOI, ownPOIOnly, setOwnPOIOnly }) {
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.removeItem('userId');
        navigate("/login");
    };

    return (
        <div className="side-menu">
            <p>Bem vindo, utilizador {localStorage.getItem('userId')}!</p>
            <button onClick={handleLogout} className="logout-btn">
                Logout
            </button>
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
        </div>
    );
}