import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useNexus } from "../../context/NexusContext.jsx";
import { readModulesLocal, writeModulesLocal } from "../../services/modulesStorage.js";
import { taskOccursOnDate, getActiveDates, getDatesOfMonth } from "../../services/Recurrence.js";
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

const PRIORITY_XP = { normal: 10, important: 20, priority: 30, urgent: 45 };

const MISSIONS_STATION_META = { id: "missions", name: "MISSÕES", color: "#a855f7" };
const DEFAULT_MODULE = { id: "CASA", name: "CASA", color: "#7c3aed" };

// ── Helpers ────────────────────────────────────────────────────────────────
function formatDatePT(dateStr) {
  try {
    return new Date(dateStr + "T12:00:00").toLocaleDateString("pt-BR", {
      weekday: "long", day: "2-digit", month: "long", year: "numeric",
    });
  } catch { return ""; }
}

function safeUUID() {
  try { return crypto.randomUUID(); }
  catch { return `t_${Date.now()}_${Math.random().toString(36).slice(2)}`; }
}

function xpForLevel(l) { return l * 50; }
function calcLevel(totalXp) {
  let level = 1, rem = totalXp;
  while (rem >= xpForLevel(level)) { rem -= xpForLevel(level); level++; }
  return { level, currentXp: rem, neededXp: xpForLevel(level) };
}

function useStorage(key, init) {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : init; }
    catch { return init; }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
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
    navigate(location.state?.from || "/stations", { replace: true });
  }, [navigate, location.state]);

  // ── Módulos ──────────────────────────────────────────────────────────────
  const [modules, setModules] = useState(() => readModulesLocal(profileId) ?? []);
  const normalizedModules = useMemo(
    () => (Array.isArray(modules) && modules.length > 0 ? modules : [DEFAULT_MODULE]),
    [modules]
  );
  const [activeModuleId, setActiveModuleId] = useState(
    () => readModulesLocal(profileId)?.[0]?.id || DEFAULT_MODULE.id
  );
  useEffect(() => {
    if (!normalizedModules.some(m => m.id === activeModuleId))
      setActiveModuleId(normalizedModules[0]?.id || DEFAULT_MODULE.id);
  }, [normalizedModules, activeModuleId]);
  const currentModuleMeta = useMemo(
    () => normalizedModules.find(x => x.id === activeModuleId) || DEFAULT_MODULE,
    [normalizedModules, activeModuleId]
  );
  const [modulesOpen, setModulesOpen] = useState(false);

  // ── Tasks ────────────────────────────────────────────────────────────────
  const storageKey = `nexus_tasks_${profileId}`;
  const [tasks, setTasks] = useStorage(storageKey, []);

  // ── UI state ─────────────────────────────────────────────────────────────
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [openTask,  setOpenTask]  = useState(null);

  // Mês visível no calendário (para calcular activeDates)
  const [calYear,  setCalYear]  = useState(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());

  // ── XP / Level ───────────────────────────────────────────────────────────
  const { level, currentXp, neededXp } = useMemo(() => calcLevel(totalXp || 0), [totalXp]);
  const xpPct = Math.min((currentXp / neededXp) * 100, 100);

  // ── Tasks do módulo ativo ─────────────────────────────────────────────────
  const moduleTasks = useMemo(() =>
    (tasks || []).filter(t =>
      t.moduleId === activeModuleId ||
      (!t.moduleId && activeModuleId === DEFAULT_MODULE.id)
    ),
    [tasks, activeModuleId]
  );

  // Tasks que ocorrem no dia selecionado via motor de recorrência
  const tasksForDay = useMemo(() =>
    moduleTasks.filter(t => taskOccursOnDate(t, selectedDate)),
    [moduleTasks, selectedDate]
  );

  // Dias do mês visível com ao menos uma task → pontos no calendário
  const activeDates = useMemo(() => {
    const dates = getDatesOfMonth(calYear, calMonth);
    return getActiveDates(moduleTasks, dates);
  }, [moduleTasks, calYear, calMonth]);

  // Board por status
  const tasksByStatus = useMemo(() => {
    const map = {
      [TaskStatus.TODO]:        [],
      [TaskStatus.IN_PROGRESS]: [],
      [TaskStatus.DONE]:        [],
    };
    tasksForDay.forEach(t => { if (map[t.status]) map[t.status].push(t); });
    return map;
  }, [tasksForDay]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const moveTask = useCallback((id, newStatus) =>
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t)),
    [setTasks]
  );

  const deleteTask = useCallback((id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    setOpenTask(cur => cur?.id === id ? null : cur);
  }, [setTasks]);

  const handleSaveNewTask = useCallback((data) => {
    const priority = data.priority || "normal";
    setTasks(prev => [{
      id:          safeUUID(),
      title:       data.title,
      description: data.description || "",
      status:      TaskStatus.TODO,
      priority,
      xp:          PRIORITY_XP[priority] ?? 10,
      icon:        data.icon || "💠",
      time:        data.time ?? undefined,
      borderColor: data.borderColor || currentModuleMeta.color,
      objectives:  data.objectives || [],
      subtasks:    [],
      comments:    [],
      date:        data.date || selectedDate,
      recurrence:  data.recurrence || { type: "none" },
      moduleId:    activeModuleId,
    }, ...prev]);
    setIsNewOpen(false);
  }, [activeModuleId, currentModuleMeta.color, selectedDate, setTasks]);

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
          <button type="button" className="ms-gear" onClick={() => setModulesOpen(true)}>⚙</button>
        </div>

        <div className="ms-side-stations">
          {normalizedModules.map(m => (
            <button
              key={m.id}
              type="button"
              className={`ms-side-station tech-font${activeModuleId === m.id ? " is-active" : ""}`}
              style={activeModuleId === m.id ? {
                borderColor: m.color,
                color: m.color,
                background: `color-mix(in srgb, ${m.color} 12%, transparent)`,
              } : undefined}
              onClick={() => setActiveModuleId(m.id)}
            >{m.name}</button>
          ))}
        </div>

        <div className="ms-profile" style={{ "--profile-color": currentModuleMeta.color }}>
          <div className="ms-profile-left">
            <div className="ms-avatar">
              {isAvatarImg
                ? <img src={avatar} alt="avatar" />
                : <span>{typeof avatar === "string" ? avatar : "👤"}</span>}
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
            activeDates={activeDates}
            onViewChange={(y, mo) => { setCalYear(y); setCalMonth(mo); }}
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
                MÓDULO: <span style={{ color: currentModuleMeta.color }}>{currentModuleMeta.name}</span>
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
            if (!safe.some(m => m.id === activeModuleId))
              setActiveModuleId(safe[0]?.id || DEFAULT_MODULE.id);
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