// ═══════════════════════════════════════════════════════════
//  NΞXUS — useXP hook  (src/hooks/useXP.js)
//  Use em qualquer módulo para dar XP e mostrar o toast
//
//  Exemplo:
//    const { award } = useXP();
//    await award("WORKOUT_LOG");       // treino registrado
//    await award("MISSION_COMPLETED"); // missão completa
// ═══════════════════════════════════════════════════════════
import { useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { XP_ACTIONS, getRank } from "../xp/xpEngine";
import * as userService from "../firebase/userService";

export function useXP() {
  const { firebaseUser, profile, showXPToast } = useAuth();

  /**
   * Dá XP para o usuário atual e exibe o toast.
   * @param {string} actionKey  - Chave em XP_ACTIONS
   * @returns {Promise<object>} - resultado do addXP
   */
  const award = useCallback(async (actionKey) => {
    if (!firebaseUser) return null;

    const result = await userService.addXP(
      firebaseUser.uid,
      actionKey,
      profile
    );
    if (!result) return null;

    const action  = XP_ACTIONS[actionKey];
    const newRank = getRank(result.newLevel
      ? (profile?.totalXP || 0) + (action?.xp || 0)
      : (profile?.totalXP || 0) + (action?.xp || 0)
    );

    showXPToast({
      xp:        action?.xp   || 0,
      label:     action?.label || actionKey,
      icon:      action?.icon  || "⚡",
      levelUp:   result.levelUp,
      rankUp:    result.rankUp,
      newLevel:  result.newLevel,
      rankTitle: newRank?.title,
    });

    return result;
  }, [firebaseUser, profile, showXPToast]);

  return { award };
}