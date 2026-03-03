import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useNexus } from "../../context/NexusContext.jsx";
import { readModulesLocal, writeModulesLocal } from "../../services/modulesStorage.js";
import TaskCard from "../../components/Taskcard/TaskCard.jsx";
import Calendar from "../../components/Calendar/Calendar.jsx";
import NewTaskModal from "../../components/NewTask/NewTaskModal.jsx";
import ModulesEditorModal from "../../components/Modules/ModulesEditorModal.jsx";
import TaskModal from "../../components/TaskModal/TaskModal.jsx";
import "./MissionsStations.css";

// ── Constants ──────────────────────────────────────────────────────────────
const TaskStatus = {
  TODO:        "TODO",
  IN_PROGRESS: "IN_PROGRESS",
  DONE:        "DONE",
};

const COLUMNS = [
  { id: TaskStatus.TODO,        title: "A FAZER"       },
  { id: TaskStatus.IN_PROGRESS, title: "PROCESSAMENTO" },
  { id: TaskStatus.DONE,        title: "CONCLUÍDO"     },
];

const PRIORITY_XP = {
  normal:    10,
  important: 20,
  priority:  30,
  urgent:    45,
};

const MISSIONS_STATION_META = { id: "missions", name: "MISSÕES", color: "#a855f7" };

const DEFAULT_TASKS = [];

const DEFAULT_MODULE = { id: "CASA", name: "CASA", color: "#7c3aed" };

// Número de semanas/meses a gerar para frente
const RECURRENCE_WEEKS_AHEAD  = 8;
const RECURRENCE_MONTHS_AHEAD = 6;

// ── Helpers ────────────────────────────────────────────────────────────────
function formatDatePT(dateStr) {
  try {
    return new Date(dateStr + "T12:00:00").toLocaleDateString("pt-BR", {
      day: "2-digit", month: "long", year: "numeric",
    });
  } catch { return ""; }
}

function safeUUID() {
  try { return crypto?.randomUUID?.() || `t_${Date.now()}_${Math.random()}`; }
  catch { return `t_${Date.now()}_${Math.random()}`; }
}

function xpForLevel(level) { return level * 50; }

function calcLevel(totalXp) {
  let level = 1;
  let remaining = totalXp;
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level++;
  }
  return { level, currentXp: remaining, neededXp: xpForLevel(level) };
}

// ── Recurrence generation ──────────────────────────────────────────────────
// Dado um template de task, gera as cópias nas datas corretas.
// Retorna array de tasks prontas (sem o template original — o próprio template
// vira a primeira ocorrência).
function generateRecurringTasks(template) {
  const { recurrence, date: startDate } = template;
  if (!recurrence || recurrence.type === "none") return [template];

  const start = new Date(startDate + "T12:00:00");
  const copies = [];

  // Primeira ocorrência é o próprio template
  copies.push({ ...template });

  if (recurrence.type === "weekly") {
    // Gera RECURRENCE_WEEKS_AHEAD semanas a partir da data original
    for (let w = 1; w <= RECURRENCE_WEEKS_AHEAD; w++) {
      const next = new Date(start);
      next.setDate(start.getDate() + w * 7);
      const dateStr = next.toISOString().split("T")[0];
      copies.push({
        ...template,
        id:   safeUUID(),
        date: dateStr,
        status: TaskStatus.TODO,
      });
    }
  } else if (recurrence.type === "monthly") {
    // Gera RECURRENCE_MONTHS_AHEAD meses a partir da data original
    for (let m = 1; m <= RECURRENCE_MONTHS_AHEAD; m++) {
      const next = new Date(start);
      next.setMonth(start.getMonth() + m);
      // Garante que não pulou para o mês seguinte (ex: 31 jan → 28 fev)
      if (next.getMonth() !== ((start.getMonth() + m) % 12)) {
        next.setDate(0); // último dia do mês anterior
      }
      const dateStr = next.toISOString().split("T")[0];
      copies.push({
        ...template,
        id:   safeUUID(),
        date: dateStr,
        status: TaskStatus.TODO,
      });
    }
  }

  return copies;
}

// ── useStorage ────────────────────────────────────────────────────────────
function useStorage(key, init) {
  const [val, setVal] = useState(() => {
    try {
      const s = localStorage.getItem(key);
      return s ? JSON.parse(s) : init;
    } catch { return init; }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(val)); }
    catch {}
  }, [key, val]);
  return [val, setVal];
}

// ══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ══════════════════════════════════════════════════════════════════════════
export default function MissionsStation() {
  const { currentProfile, xp: totalXp } = useNexus();
  const profileId = currentProfile?.id || "default";

  useEffect(() => {
    document.body.classList.add("is-missions-screen");
    return () => document.body.classList.remove("is-missions-screen");
  }, []);

  const navigate = useNavigate();
  const location = useLocation();

  const goHub = useCallback(() => {
    const from = location.state?.from;
    navigate(from || "/stations", { replace: true });
  }, [navigate, location.state]);

  // ── Módulos ──────────────────────────────────────────────────────────────
  const [modules, setModules] = useState(() => readModulesLocal(profileId) ?? []);

  const normalizedModules = useMemo(() => {
    if (Array.isArray(modules) && modules.length > 0) return modules;
    return [DEFAULT_MODULE];
  }, [modules]);

  const [activeModuleId, setActiveModuleId] = useState(
    () => readModulesLocal(profileId)?.[0]?.id || DEFAULT_MODULE.id
  );

  useEffect(() => {
    if (!normalizedModules.some(m => m.id === activeModuleId)) {
      setActiveModuleId(normalizedModules[0]?.id || DEFAULT_MODULE.id);
    }
  }, [normalizedModules, activeModuleId]);

  const currentModuleMeta = useMemo(
    () => normalizedModules.find(x => x.id === activeModuleId) || DEFAULT_MODULE,
    [normalizedModules, activeModuleId]
  );

  const [modulesOpen, setModulesOpen] = useState(false);

  // ── Tasks ────────────────────────────────────────────────────────────────
  const storageKey = `nexus_tasks_${profileId}`;
  const [tasks, setTasks] = useStorage(storageKey, DEFAULT_TASKS);

  // ── UI state ─────────────────────────────────────────────────────────────
  const [selectedDate, setSelectedDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [openTask,  setOpenTask]  = useState(null);

  // ── XP / Level ───────────────────────────────────────────────────────────
  const { level, currentXp, neededXp } = useMemo(
    () => calcLevel(totalXp || 0),
    [totalXp]
  );
  const xpPct = Math.min((currentXp / neededXp) * 100, 100);

  // ── Task handlers ─────────────────────────────────────────────────────────
  const moveTask = useCallback((id, newStatus) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
  }, [setTasks]);

  const deleteTask = useCallback((id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    setOpenTask(cur => cur?.id === id ? null : cur);
  }, [setTasks]);

  const handleSaveNewTask = useCallback((data) => {
    const priority = data.priority || "normal";
    const template = {
      id:          safeUUID(),
      title:       data.title,
      description: data.description || "",
      status:      TaskStatus.TODO,
      priority,
      xp:          PRIORITY_XP[priority] ?? 10,
      icon:        data.icon || "💠",
      time:        data.time || undefined,
      borderColor: data.borderColor || currentModuleMeta.color,
      objectives:  Array.isArray(data.objectives) ? data.objectives : [],
      subtasks:    [],
      comments:    [],
      date:        data.date || selectedDate,
      recurrence:  data.recurrence || { type: "none" },
      moduleId:    activeModuleId,
    };

    // Gera cópias se for recorrente
    const toInsert = generateRecurringTasks(template);
    setTasks(prev => [...toInsert, ...prev]);
    setIsNewOpen(false);
  }, [activeModuleId, currentModuleMeta.color, selectedDate, setTasks]);

  // ── Filtered tasks — mostra apenas as do dia selecionado + módulo ativo ──
  const tasksForModule = useMemo(() => {
    return (tasks || []).filter(t =>
      (t.moduleId === activeModuleId ||
       (!t.moduleId && activeModuleId === DEFAULT_MODULE.id)) &&
      t.date === selectedDate
    );
  }, [tasks, activeModuleId, selectedDate]);

  const tasksByStatus = useMemo(() => {
    const map = {
      [TaskStatus.TODO]:        [],
      [TaskStatus.IN_PROGRESS]: [],
      [TaskStatus.DONE]:        [],
    };
    tasksForModule.forEach(t => {
      if (map[t.status]) map[t.status].push(t);
    });
    return map;
  }, [tasksForModule]);

  // ── Profile ───────────────────────────────────────────────────────────────
  const operatorName = currentProfile?.name || "OPERADOR";
  const avatar       = currentProfile?.avatar;
  const isAvatarImg  = typeof avatar === "string" &&
    (avatar.startsWith("data:") || avatar.startsWith("http"));

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="ms-root">

      {/* ── Sidebar ── */}
      <aside className="ms-sidebar">
        <div className="ms-sidebar-top">
          <button type="button" className="ms-back-hub tech-font" onClick={goHub}>← HUB</button>
        </div>

        <div className="ms-side-label tech-font">
          <span>MÓDULOS</span>
          <button
            type="button"
            className="ms-gear"
            title="Editar módulos"
            onClick={() => setModulesOpen(true)}
          >⚙</button>
        </div>

        <div className="ms-side-stations">
          {normalizedModules.map(m => (
            <button
              key={m.id}
              type="button"
              className={`ms-side-station tech-font${activeModuleId === m.id ? " is-active" : ""}`}
              style={activeModuleId === m.id
                ? { borderColor: m.color, color: m.color, background: `color-mix(in srgb, ${m.color} 12%, transparent)` }
                : undefined
              }
              onClick={() => setActiveModuleId(m.id)}
            >
              {m.name}
            </button>
          ))}
        </div>

        {/* Profile card */}
        <div className="ms-profile" style={{ "--profile-color": currentModuleMeta.color }}>
          <div className="ms-profile-left">
            <div className="ms-avatar">
              {isAvatarImg
                ? <img src={avatar} alt="avatar" />
                : <span>{typeof avatar === "string" ? avatar : "👤"}</span>
              }
            </div>
            <div className="ms-profile-meta">
              <div className="ms-profile-name">{operatorName}</div>
              <div className="ms-profile-sub">
                <span>LV {level}</span>
                <span className="ms-xp">{currentXp} / {neededXp} XP</span>
              </div>
              <div className="ms-xpbar">
                <div className="ms-xpbar-fill" style={{ width: `${xpPct}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="ms-calendar">
          <Calendar
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            accentColor={currentModuleMeta.color}
          />
        </div>

        <div className="ms-station-tag tech-font">
          <span>MISSIONS</span>
          <span className="ms-station-dot" style={{ color: currentModuleMeta.color }}>●</span>
          <span>STATION</span>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="ms-main">
        <header className="ms-header" style={{ "--mod-color": currentModuleMeta.color }}>
          <div className="ms-header-left">
            <div className="ms-logo">NΞXUS</div>
            <div className="ms-header-divider" />
            <div className="ms-header-meta">
              <div className="ms-date data-font">{formatDatePT(selectedDate)}</div>
              <div className="ms-header-module tech-font">
                MÓDULO:{" "}
                <span style={{ color: currentModuleMeta.color }}>{currentModuleMeta.name}</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            className="ms-new-mission tech-font"
            style={{ "--mod-color": currentModuleMeta.color }}
            onClick={() => setIsNewOpen(true)}
          >
            + NOVA MISSÃO
          </button>
        </header>

        <section className="ms-board">
          {COLUMNS.map(col => (
            <div key={col.id} className="ms-col">
              <div className="ms-col-head">
                <span className="ms-col-title tech-font">{col.title}</span>
                <span className="ms-col-count data-font">{tasksByStatus[col.id].length}</span>
              </div>
              <div className="ms-col-list">
                {tasksByStatus[col.id].length === 0
                  ? <div className="ms-col-empty tech-font">NENHUMA MISSÃO</div>
                  : tasksByStatus[col.id].map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onOpen={setOpenTask}
                        onMove={moveTask}
                        onDelete={deleteTask}
                        TaskStatus={TaskStatus}
                      />
                    ))
                }
              </div>
            </div>
          ))}
        </section>
      </main>

      {/* ── Modals ── */}
      {isNewOpen && (
        <NewTaskModal
          currentModule={{
            id:    MISSIONS_STATION_META.id,
            name:  MISSIONS_STATION_META.name,
            color: currentModuleMeta.color,
          }}
          selectedDate={selectedDate}
          onClose={() => setIsNewOpen(false)}
          onSave={handleSaveNewTask}
        />
      )}

      {modulesOpen && (
        <ModulesEditorModal
          modules={normalizedModules}
          onClose={() => setModulesOpen(false)}
          onSave={(nextModules) => {
            const safe = Array.isArray(nextModules) ? nextModules : [];
            setModules(safe);
            writeModulesLocal(profileId, safe);
            if (!safe.some(m => m.id === activeModuleId)) {
              setActiveModuleId(safe[0]?.id || DEFAULT_MODULE.id);
            }
            setModulesOpen(false);
          }}
        />
      )}

      {openTask && (
        <TaskModal
          task={openTask}
          onClose={() => setOpenTask(null)}
          onSave={(updated) => {
            setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
            setOpenTask(updated);
          }}
          onDelete={deleteTask}
        />
      )}
    </div>
  );
}