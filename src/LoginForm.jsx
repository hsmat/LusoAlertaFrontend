import { useState } from "react";
import { useNavigate } from "react-router-dom";
    
export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();
    
    if (localStorage.getItem("userId")) {
        return <Navigate to="/dashboard" />;
    }

    const authenticate = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:3000/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("userId", data.userId);
                navigate("/dashboard");
            } else {
                setMessage(data.message);
            }

        } catch (error) {
            setMessage("Internal server error" + error.message);
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={authenticate}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <br />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <br />
                <button type="submit">Login</button>
            </form>

            <p>{message}</p>
        </div>
    );
}