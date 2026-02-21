import { useNavigate } from "react-router-dom";
import Operator from '../components/Operator';
import { useNexus } from "../context/NexusContext";

export default function MissionsStation() {
    const navigate = useNavigate();
    const [operator, setOperator] = useNexus();
    
    function CompleteMission() {
        setOperator((prev) => {
            if (!prev) return prev;

            const newXp = prev.xp + 10;
            
            return newXp >= 100
                ? {...prev, xp: 0, level: prev.level + 1}
                : {...prev, xp: newXp};
        })
    }
    if (!operator) return null;

  return (
    <div>
        <button onClick={() => navigate("/stations")} style={{ marginBottom: 12 }}>
            Back to Stations
        </button>
        <h2>Missions Station</h2>
        <Operator
            name={operator.name}
            level={operator.level}
            xp={operator.xp}
            onCompleteMission={CompleteMission}
        />
    </div>
  );
}