// ═══════════════════════════════════════════════════════════
//  NΞXUS — Firestore User Service  (src/firebase/userService.js)
//  Todas as operações de leitura/escrita do perfil e XP
// ═══════════════════════════════════════════════════════════
import {
  doc, getDoc, setDoc, updateDoc, increment,
  collection, addDoc, query, orderBy, limit,
  getDocs, serverTimestamp, onSnapshot,
} from "firebase/firestore";
import { db } from "./config";
import {
  checkNewBadges, getRank, getLevel,
  xpForLevel, XP_ACTIONS,
} from "../xp/xpEngine";

// ──────────────────────────────────────────────
//  ESTRUTURA DO DOCUMENTO /users/{uid}
// ──────────────────────────────────────────────
//  {
//    uid, displayName, email, photoURL, bio,
//    createdAt, lastLoginAt, lastLoginDate (YYYY-MM-DD),
//    totalXP, level, rankId,
//    loginStreak, longestStreak,
//    totalLogins, profileComplete,
//    missionsCompleted, workoutsLogged,
//    transactionsLogged, goalsReached,
//    healthStreak, healthLastDate,
//    badges: ["badge_id", ...],
//    settings: { color, notifications }
//  }

// ──────────────────────────────────────────────
//  CRIAR / BUSCAR PERFIL
// ──────────────────────────────────────────────

/** Cria perfil se não existir; atualiza campos básicos se existir */
export async function upsertUserProfile(firebaseUser) {
  const ref  = doc(db, "users", firebaseUser.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    // Primeiro acesso — cria perfil completo
    const profile = {
      uid:            firebaseUser.uid,
      displayName:    firebaseUser.displayName || "OPERADOR",
      email:          firebaseUser.email || "",
      photoURL:       firebaseUser.photoURL || "",
      bio:            "",
      createdAt:      serverTimestamp(),
      lastLoginAt:    serverTimestamp(),
      lastLoginDate:  todayString(),
      totalXP:        0,
      level:          1,
      rankId:         "recruit",
      loginStreak:    1,
      longestStreak:  1,
      totalLogins:    1,
      onboardingDone:  false,   // ← false = precisa escolher codinome
      profileComplete: false,
      missionsCompleted:  0,
      workoutsLogged:     0,
      transactionsLogged: 0,
      goalsReached:       0,
      healthStreak:       0,
      healthLastDate:     "",
      badges:         [],
      settings:       { color: "#3b82f6", notifications: true },
    };
    await setDoc(ref, profile);

    // XP de boas-vindas
    await addXP(firebaseUser.uid, "FIRST_LOGIN", profile);
    return await getDoc(ref).then((s) => s.data());
  }

  // Login subsequente — atualiza streak e login
  const data = snap.data();
  await handleDailyLogin(firebaseUser.uid, data);
  return await getDoc(ref).then((s) => s.data());
}

/** Busca perfil do usuário */
export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

/** Atualiza campos do perfil (displayName, bio, photoURL, settings) */
export async function updateUserProfile(uid, fields) {
  const ref = doc(db, "users", uid);

  // Se está salvando o displayName pela primeira vez (onboarding), marca como feito
  const updates = { ...fields };
  if (fields.displayName && fields.onboardingDone !== false) {
    updates.onboardingDone = true;
  }

  await updateDoc(ref, updates);

  // Verifica se perfil está completo (tem nome + bio)
  const snap = await getDoc(ref);
  const data = snap.data();
  if (!data.profileComplete && data.displayName && data.bio) {
    await updateDoc(ref, { profileComplete: true });
    await addXP(uid, "PROFILE_COMPLETE", data);
  }
}

// ──────────────────────────────────────────────
//  LOGIN DIÁRIO + STREAK
// ──────────────────────────────────────────────
async function handleDailyLogin(uid, currentData) {
  const today     = todayString();
  const lastLogin = currentData.lastLoginDate || "";

  if (lastLogin === today) {
    // Já logou hoje — só atualiza timestamp
    await updateDoc(doc(db, "users", uid), { lastLoginAt: serverTimestamp() });
    return;
  }

  const yesterday  = yesterdayString();
  const newStreak  = lastLogin === yesterday
    ? (currentData.loginStreak || 0) + 1
    : 1;
  const longest    = Math.max(newStreak, currentData.longestStreak || 0);

  await updateDoc(doc(db, "users", uid), {
    lastLoginAt:   serverTimestamp(),
    lastLoginDate: today,
    loginStreak:   newStreak,
    longestStreak: longest,
    totalLogins:   increment(1),
  });

  // XP diário
  await addXP(uid, "DAILY_LOGIN", { ...currentData, loginStreak: newStreak });

  // Milestones de streak
  if (newStreak === 7)  await addXP(uid, "STREAK_7",  currentData);
  if (newStreak === 30) await addXP(uid, "STREAK_30", currentData);
}

// ──────────────────────────────────────────────
//  XP ENGINE
// ──────────────────────────────────────────────

/**
 * Adiciona XP ao usuário e verifica level-up, rank-up e badges
 * @param {string}  uid       - UID do Firebase
 * @param {string}  actionKey - Chave em XP_ACTIONS
 * @param {object}  userData  - Dados atuais do usuário (opcional, evita leitura extra)
 * @returns {{ xpGained, newLevel, newRank, newBadges, levelUp, rankUp }}
 */
export async function addXP(uid, actionKey, userData = null) {
  const action = XP_ACTIONS[actionKey];
  if (!action) return null;

  const ref = doc(db, "users", uid);

  // Busca dados atuais se não foram passados
  if (!userData) {
    const snap = await getDoc(ref);
    userData = snap.data();
  }

  const prevXP    = userData.totalXP  || 0;
  const prevLevel = userData.level    || 1;
  const prevRank  = userData.rankId   || "recruit";

  const newTotalXP = prevXP + action.xp;
  const newLevel   = getLevel(newTotalXP);
  const newRank    = getRank(newTotalXP);

  // Atualiza XP, level e rank
  await updateDoc(ref, {
    totalXP: increment(action.xp),
    level:   newLevel,
    rankId:  newRank.id,
  });

  // Log da transação de XP
  await addDoc(collection(db, "users", uid, "xpLog"), {
    action:    actionKey,
    xp:        action.xp,
    label:     action.label,
    icon:      action.icon,
    timestamp: serverTimestamp(),
  });

  // Verifica badges
  const updatedStats = {
    ...userData,
    totalXP:  newTotalXP,
    level:    newLevel,
    rankId:   newRank.id,
  };
  const newBadges = checkNewBadges(updatedStats, userData.badges || []);
  if (newBadges.length > 0) {
    const badgeIds  = newBadges.map((b) => b.id);
    const bonusXP   = newBadges.reduce((sum, b) => sum + (b.xpReward || 0), 0);

    await updateDoc(ref, {
      badges:  [...(userData.badges || []), ...badgeIds],
      totalXP: increment(bonusXP),
    });

    // Log de cada badge
    for (const badge of newBadges) {
      await addDoc(collection(db, "users", uid, "badgeLog"), {
        badgeId:   badge.id,
        name:      badge.name,
        icon:      badge.icon,
        xpReward:  badge.xpReward,
        timestamp: serverTimestamp(),
      });
    }
  }

  return {
    xpGained:   action.xp,
    newLevel,
    newRank:    newRank.id,
    newBadges,
    levelUp:    newLevel > prevLevel,
    rankUp:     newRank.id !== prevRank,
  };
}

// ──────────────────────────────────────────────
//  CONTADORES DE AÇÕES (chamados pelos módulos)
// ──────────────────────────────────────────────

export async function logMissionCompleted(uid) {
  await updateDoc(doc(db, "users", uid), { missionsCompleted: increment(1) });
  return addXP(uid, "MISSION_COMPLETED");
}

export async function logWorkout(uid) {
  await updateDoc(doc(db, "users", uid), { workoutsLogged: increment(1) });
  return addXP(uid, "WORKOUT_LOG");
}

export async function logTransaction(uid) {
  await updateDoc(doc(db, "users", uid), { transactionsLogged: increment(1) });
  return addXP(uid, "TRANSACTION_LOG");
}

export async function logGoalReached(uid) {
  await updateDoc(doc(db, "users", uid), { goalsReached: increment(1) });
  return addXP(uid, "GOAL_REACHED");
}

export async function logDietEntry(uid)       { return addXP(uid, "DIET_LOG"); }
export async function logSleepEntry(uid)      { return addXP(uid, "SLEEP_LOG"); }
export async function logHydrationEntry(uid)  { return addXP(uid, "HYDRATION_LOG"); }
export async function logMeasuresEntry(uid)   { return addXP(uid, "MEASURES_LOG"); }
export async function logSupplementEntry(uid) { return addXP(uid, "SUPPLEMENT_LOG"); }
export async function logMissionCreated(uid)  { return addXP(uid, "MISSION_CREATED"); }

// ──────────────────────────────────────────────
//  LEADERBOARD
// ──────────────────────────────────────────────

/** Top N usuários por XP */
export async function getLeaderboard(n = 20) {
  const q = query(
    collection(db, "users"),
    orderBy("totalXP", "desc"),
    limit(n)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d, i) => ({ rank: i + 1, ...d.data() }));
}

/** Listener em tempo real do leaderboard */
export function subscribeLeaderboard(n = 20, callback) {
  const q = query(
    collection(db, "users"),
    orderBy("totalXP", "desc"),
    limit(n)
  );
  return onSnapshot(q, (snap) => {
    const data = snap.docs.map((d, i) => ({ rank: i + 1, ...d.data() }));
    callback(data);
  });
}

/** Listener em tempo real do perfil */
export function subscribeUserProfile(uid, callback) {
  return onSnapshot(doc(db, "users", uid), (snap) => {
    if (snap.exists()) callback(snap.data());
  });
}

/** Busca histórico de XP do usuário */
export async function getXPHistory(uid, n = 30) {
  const q = query(
    collection(db, "users", uid, "xpLog"),
    orderBy("timestamp", "desc"),
    limit(n)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data());
}

// ──────────────────────────────────────────────
//  HELPERS
// ──────────────────────────────────────────────
function todayString() {
  return new Date().toISOString().split("T")[0]; // "2025-03-04"
}
function yesterdayString() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}