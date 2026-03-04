// ═══════════════════════════════════════════════════════════
//  NΞXUS — XPToast  (src/xp/XPToast.jsx)
//  Componente global que mostra notificações de XP/Level/Rank
//  Coloque uma vez no App.jsx, abaixo do <Outlet />
// ═══════════════════════════════════════════════════════════
import { useAuth } from "../context/AuthContext";
import "../auth/LoginScreen.css"; // reutiliza as classes nx-xp-*

export default function XPToast() {
  const { xpToast } = useAuth();
  if (!xpToast) return null;

  const isLevelUp = xpToast.levelUp;
  const isRankUp  = xpToast.rankUp;

  let toastClass = "nx-xp-toast";
  if (isRankUp)  toastClass += " nx-xp-toast--rankup";
  else if (isLevelUp) toastClass += " nx-xp-toast--levelup";

  return (
    <div className="nx-xp-toasts">
      <div className={toastClass}>
        <div className="nx-xp-toast-icon">{xpToast.icon || "⚡"}</div>
        <div className="nx-xp-toast-body">
          <span className="nx-xp-toast-label">
            {isRankUp
              ? `RANK UP → ${xpToast.rankTitle}`
              : isLevelUp
              ? `LEVEL UP → LV ${xpToast.newLevel}`
              : xpToast.label}
          </span>
          <span className="nx-xp-toast-xp">+{xpToast.xp} XP</span>
        </div>
      </div>
    </div>
  );
}