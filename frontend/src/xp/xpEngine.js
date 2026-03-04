// ═══════════════════════════════════════════════════════════
//  NΞXUS — XP Engine  (src/xp/xpEngine.js)
//  Sistema completo de experiência, ranks e badges
// ═══════════════════════════════════════════════════════════

// ──────────────────────────────────────────────
//  TABELA DE RANKS
//  id, título, xp mínimo, cor, ícone, descrição
// ──────────────────────────────────────────────
export const RANKS = [
  {
    id:       "recruit",
    title:    "RECRUTA",
    minXP:    0,
    color:    "#6b7280",
    glow:     "rgba(107,114,128,0.35)",
    icon:     "⬡",
    roman:    "I",
    desc:     "Operador recém-ativado. O sistema aguarda sua ação.",
  },
  {
    id:       "operative",
    title:    "OPERATIVO",
    minXP:    500,
    color:    "#3b82f6",
    glow:     "rgba(59,130,246,0.40)",
    icon:     "◈",
    roman:    "II",
    desc:     "Familiarizado com os protocolos básicos da rede.",
  },
  {
    id:       "specialist",
    title:    "ESPECIALISTA",
    minXP:    1500,
    color:    "#8b5cf6",
    glow:     "rgba(139,92,246,0.45)",
    icon:     "⬟",
    roman:    "III",
    desc:     "Domínio avançado dos módulos operacionais.",
  },
  {
    id:       "commander",
    title:    "COMANDANTE",
    minXP:    3500,
    color:    "#f59e0b",
    glow:     "rgba(245,158,11,0.45)",
    icon:     "✦",
    roman:    "IV",
    desc:     "Liderança comprovada em múltiplas frentes.",
  },
  {
    id:       "elite",
    title:    "ELITE",
    minXP:    7500,
    color:    "#ef4444",
    glow:     "rgba(239,68,68,0.45)",
    icon:     "⬠",
    roman:    "V",
    desc:     "Capacidade operacional máxima atingida.",
  },
  {
    id:       "phantom",
    title:    "FANTASMA",
    minXP:    15000,
    color:    "#06b6d4",
    glow:     "rgba(6,182,212,0.45)",
    icon:     "◉",
    roman:    "VI",
    desc:     "Presença que transcende o sistema.",
  },
  {
    id:       "legend",
    title:    "LENDÁRIO",
    minXP:    30000,
    color:    "#fbbf24",
    glow:     "rgba(251,191,36,0.55)",
    icon:     "★",
    roman:    "VII",
    desc:     "Além da classificação conhecida.",
  },
];

// ──────────────────────────────────────────────
//  TABELA DE XP POR AÇÃO
// ──────────────────────────────────────────────
export const XP_ACTIONS = {
  // ── Missões
  MISSION_CREATED:    { xp: 10,  label: "Missão criada",      icon: "💠" },
  MISSION_COMPLETED:  { xp: 50,  label: "Missão concluída",   icon: "✅" },
  MISSION_STREAK_7:   { xp: 100, label: "7 dias seguidos",    icon: "🔥" },

  // ── Saúde
  DIET_LOG:           { xp: 15,  label: "Dieta registrada",   icon: "🥗" },
  WORKOUT_LOG:        { xp: 25,  label: "Treino registrado",  icon: "⚡" },
  SLEEP_LOG:          { xp: 15,  label: "Sono registrado",    icon: "🌙" },
  HYDRATION_LOG:      { xp: 5,   label: "Hidratação OK",      icon: "💧" },
  MEASURES_LOG:       { xp: 20,  label: "Medidas registradas",icon: "📏" },
  SUPPLEMENT_LOG:     { xp: 10,  label: "Suplemento tomado",  icon: "💊" },

  // ── Finanças
  TRANSACTION_LOG:    { xp: 10,  label: "Transação registrada",icon: "💰" },
  GOAL_REACHED:       { xp: 75,  label: "Meta financeira!",   icon: "🎯" },
  BUDGET_WEEK_OK:     { xp: 30,  label: "Semana no orçamento",icon: "📊" },

  // ── Perfil / Sistema
  PROFILE_COMPLETE:   { xp: 50,  label: "Perfil completo",    icon: "👤" },
  FIRST_LOGIN:        { xp: 25,  label: "Primeiro acesso",    icon: "🚀" },
  DAILY_LOGIN:        { xp: 5,   label: "Login diário",       icon: "📅" },
  STREAK_7:           { xp: 50,  label: "7 dias ativo",       icon: "🔥" },
  STREAK_30:          { xp: 200, label: "30 dias ativo",      icon: "💎" },
};

// ──────────────────────────────────────────────
//  BADGES
// ──────────────────────────────────────────────
export const BADGES = [
  // Primeiros passos
  {
    id:        "first_blood",
    name:      "PRIMEIRO ACESSO",
    desc:      "Conectou ao NΞXUS pela primeira vez.",
    icon:      "🚀",
    color:     "#3b82f6",
    condition: (stats) => stats.totalLogins >= 1,
    xpReward:  25,
  },
  {
    id:        "profile_complete",
    name:      "IDENTIDADE FORJADA",
    desc:      "Completou o perfil de operador.",
    icon:      "🪪",
    color:     "#8b5cf6",
    condition: (stats) => stats.profileComplete,
    xpReward:  50,
  },

  // Missões
  {
    id:        "first_mission",
    name:      "PRIMEIRA MISSÃO",
    desc:      "Completou sua primeira missão.",
    icon:      "💠",
    color:     "#3b82f6",
    condition: (stats) => stats.missionsCompleted >= 1,
    xpReward:  30,
  },
  {
    id:        "mission_10",
    name:      "OPERATIVO ATIVO",
    desc:      "10 missões concluídas.",
    icon:      "⚡",
    color:     "#3b82f6",
    condition: (stats) => stats.missionsCompleted >= 10,
    xpReward:  100,
  },
  {
    id:        "mission_50",
    name:      "VETERANO DE CAMPO",
    desc:      "50 missões no histórico.",
    icon:      "🎖️",
    color:     "#f59e0b",
    condition: (stats) => stats.missionsCompleted >= 50,
    xpReward:  300,
  },

  // Saúde
  {
    id:        "health_week",
    name:      "CORPO EM PROTOCOLO",
    desc:      "7 dias registrando saúde.",
    icon:      "🧬",
    color:     "#10b981",
    condition: (stats) => stats.healthStreak >= 7,
    xpReward:  75,
  },
  {
    id:        "workout_10",
    name:      "MÁQUINA DE GUERRA",
    desc:      "10 treinos registrados.",
    icon:      "💪",
    color:     "#ef4444",
    condition: (stats) => stats.workoutsLogged >= 10,
    xpReward:  100,
  },

  // Finanças
  {
    id:        "first_finance",
    name:      "CONTROLE INICIADO",
    desc:      "Primeira transação financeira.",
    icon:      "💰",
    color:     "#10b981",
    condition: (stats) => stats.transactionsLogged >= 1,
    xpReward:  20,
  },
  {
    id:        "goal_reached",
    name:      "META ATINGIDA",
    desc:      "Alcançou uma meta financeira.",
    icon:      "🎯",
    color:     "#10b981",
    condition: (stats) => stats.goalsReached >= 1,
    xpReward:  100,
  },

  // Streaks
  {
    id:        "streak_7",
    name:      "SEQUÊNCIA NEURAL",
    desc:      "7 dias consecutivos no sistema.",
    icon:      "🔥",
    color:     "#f59e0b",
    condition: (stats) => stats.loginStreak >= 7,
    xpReward:  50,
  },
  {
    id:        "streak_30",
    name:      "PRESENÇA CONSTANTE",
    desc:      "30 dias consecutivos.",
    icon:      "💎",
    color:     "#06b6d4",
    condition: (stats) => stats.loginStreak >= 30,
    xpReward:  200,
  },
  {
    id:        "streak_100",
    name:      "MODO FANTASMA",
    desc:      "100 dias sem falhar.",
    icon:      "👻",
    color:     "#06b6d4",
    condition: (stats) => stats.loginStreak >= 100,
    xpReward:  500,
  },

  // Rank milestones
  {
    id:        "reach_operative",
    name:      "OPERATIVO",
    desc:      "Atingiu o rank Operativo.",
    icon:      "◈",
    color:     "#3b82f6",
    condition: (stats) => stats.totalXP >= 500,
    xpReward:  0,
  },
  {
    id:        "reach_elite",
    name:      "STATUS ELITE",
    desc:      "Atingiu o rank Elite.",
    icon:      "⬠",
    color:     "#ef4444",
    condition: (stats) => stats.totalXP >= 7500,
    xpReward:  0,
  },
  {
    id:        "reach_legend",
    name:      "LENDÁRIO",
    desc:      "O topo da hierarquia NΞXUS.",
    icon:      "★",
    color:     "#fbbf24",
    condition: (stats) => stats.totalXP >= 30000,
    xpReward:  0,
  },
];

// ──────────────────────────────────────────────
//  FUNÇÕES UTILITÁRIAS
// ──────────────────────────────────────────────

/** Retorna o rank atual baseado no XP total */
export function getRank(totalXP) {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (totalXP >= RANKS[i].minXP) return RANKS[i];
  }
  return RANKS[0];
}

/** Retorna o próximo rank (ou null se for o máximo) */
export function getNextRank(totalXP) {
  const current = getRank(totalXP);
  const idx = RANKS.findIndex((r) => r.id === current.id);
  return idx < RANKS.length - 1 ? RANKS[idx + 1] : null;
}

/** Progresso (0–1) para o próximo rank */
export function getRankProgress(totalXP) {
  const current  = getRank(totalXP);
  const next     = getNextRank(totalXP);
  if (!next) return 1;
  const range    = next.minXP - current.minXP;
  const progress = totalXP   - current.minXP;
  return Math.min(progress / range, 1);
}

/** XP necessário para o próximo rank */
export function xpToNextRank(totalXP) {
  const next = getNextRank(totalXP);
  if (!next) return 0;
  return Math.max(next.minXP - totalXP, 0);
}

/** Verifica quais badges novos o usuário desbloqueou */
export function checkNewBadges(stats, alreadyUnlocked = []) {
  return BADGES.filter(
    (b) => !alreadyUnlocked.includes(b.id) && b.condition(stats)
  );
}

/** XP total necessário para o nível N */
export function xpForLevel(level) {
  // Fórmula: 100 * level^1.5  (cresce mas não explode)
  return Math.floor(100 * Math.pow(level, 1.5));
}

/** Calcula o nível (1–999) a partir do XP total */
export function getLevel(totalXP) {
  let level = 1;
  let accumulated = 0;
  while (true) {
    const needed = xpForLevel(level);
    if (accumulated + needed > totalXP) break;
    accumulated += needed;
    level++;
    if (level >= 999) break;
  }
  return level;
}

/** Progresso (0–1) dentro do nível atual */
export function getLevelProgress(totalXP) {
  const level       = getLevel(totalXP);
  const needed      = xpForLevel(level);
  let   accumulated = 0;
  for (let l = 1; l < level; l++) accumulated += xpForLevel(l);
  const inLevel = totalXP - accumulated;
  return Math.min(inLevel / needed, 1);
}

/** XP restante para o próximo nível */
export function xpToNextLevel(totalXP) {
  const level       = getLevel(totalXP);
  const needed      = xpForLevel(level);
  let   accumulated = 0;
  for (let l = 1; l < level; l++) accumulated += xpForLevel(l);
  return needed - (totalXP - accumulated);
}