export default function Operator({name, level, xp, onCompleteMission}) {
    return (
        <div>
            <h2>Operador: {name}</h2>
            <p>Nível: {level}</p>
            <p>XP: {xp}</p>
            <div style={{
                width: "200px",
                height: "10px",
                backgroundColor: "#333",
                borderRadius: "5px",
                overflow: "hidden",
                marginBottom: "12px",
                }}>
                    <div style={{
                    width: `${xp}%`,
                    height: "100%",
                    backgroundColor: "#00ff88",
                    transition: "width 0.3s ease"
                    }}>
                    </div>  
            </div>

            <button onClick={onCompleteMission}>
                Completar missão (+10xp)
            </button>
        </div>
    );
}