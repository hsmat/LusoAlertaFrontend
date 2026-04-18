import './App.css'
import 'leaflet/dist/leaflet.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginForm from "./LoginForm.jsx";
import Dashboard from "./Dashboard.jsx";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginForm />} />
                <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;