import { useNavigate } from "react-router-dom";
import { useNexus } from "../context/NexusContext";


export default function LoginScreen() {
    const navigate = useNavigate();
    const {login} = useNexus();

    function handleLogin() {
        login({name: "João", level: 1, xp: 0});
        navigate("/stations");
    }


    return(
        <div style={{ padding: 24 }}>
            <h1>Nexus OS</h1>
            <p>Selecione um operador para inicar.</p>
            <button onClick={handleLogin}>Entrar como João</button>
        </div>
    );
}