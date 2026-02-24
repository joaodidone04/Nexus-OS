import React, { useEffect, useMemo, useState } from "react";
import { useNexus } from "../../context/NexusContext.jsx";
import TaskCard from "../../components/TaskCard.jsx";
import Calendar from "../../components/Calendar/Calendar.jsx";
import NewTaskModal from "../../components/NewTaskModal.jsx";
import ModulesEditorModal from "../../components/ModulesEditorModal.jsx";

import { readModulesLocal, writeModulesLocal } from "../../services/modulesStorage.js";

const TaskStatus = {
  TODO: "TODO",
  IN_PROGRESS: "IN_PROGRESS",
  DONE: "DONE",
};

const DEFAULT_TASKS = [
  {
    id: "t1",
    title: "Estruturar MVP Missões",
    description:
      "Definir colunas, card, persistência local e fluxo de mover tarefas entre status.",
    status: TaskStatus.TODO,
    priority: "priority",
    xp: 20,
    icon: "💠",
    time: "HOJE",
    borderColor: "#3b82f6",
    objectives: [
      { id: "o1", text: "Board 3 colunas" },
      { id: "o2", text: "Persistência local" },
    ],
    date: new Date().toISOString().split("T")[0],
    recurrence: { type: "none" },
    moduleId: "CASA",
  },
];

function formatDatePT(dateStr) {
  try {
    const d = new Date(dateStr + "T12:00:00");
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

const PRIORITY_XP = {
  normal: 10,
  important: 20,
  priority: 30,
  urgent: 45,
};

function safeUUID() {
  try {
    return crypto?.randomUUID?.() || `t_${Date.now()}`;
  } catch {
    return `t_${Date.now()}`;
  }
}

export default function MissionsStation() {
  const { currentProfile } = useNexus();
  const profileId = currentProfile?.id || "default";

  // ✅ ESCONDE TOPBAR GLOBAL SOMENTE NESSA TELA
  useEffect(() => {
    document.body.classList.add("is-missions-screen");
    return () => document.body.classList.remove("is-missions-screen");
  }, []);

  const goHub = () => {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    try {
      window.location.assign("/hub");
    } catch {
      window.location.assign("/");
    }
  };

  const [modules, setModules] = useState(() => readModulesLocal(profileId) ?? []);
  const [activeModuleId, setActiveModuleId] = useState(() => {
    const list = readModulesLocal(profileId) ?? [];
    return list?.[0]?.id || "CASA";
  });

  const [modulesOpen, setModulesOpen] = useState(false);

  const storageKey = useMemo(() => `nexus_tasks_${profileId}`, [profileId]);
  const [tasks, setTasks] = useState([]);

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [isNewOpen, setIsNewOpen] = useState(false);

  const normalizedModules = useMemo(() => {
    if (Array.isArray(modules) && modules.length > 0) return modules;
    return [{ id: "CASA", name: "CASA", color: "#7c3aed" }];
  }, [modules]);

  useEffect(() => {
    if (!normalizedModules.some((m) => m.id === activeModuleId)) {
      setActiveModuleId(normalizedModules[0]?.id || "CASA");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizedModules]);

  const currentModuleMeta = useMemo(() => {
    const m = normalizedModules.find((x) => x.id === activeModuleId);
    return m || { id: "CASA", name: "CASA", color: "#7c3aed" };
  }, [normalizedModules, activeModuleId]);

  const currentStation = useMemo(
    () => ({ id: "missions", name: "MISSÕES", color: "#a855f7" }),
    []
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setTasks(JSON.parse(raw));
      else setTasks(DEFAULT_TASKS);
    } catch {
      setTasks(DEFAULT_TASKS);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!Array.isArray(tasks)) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(tasks));
    } catch {}
  }, [tasks, storageKey]);

  useEffect(() => {
    const list = readModulesLocal(profileId) ?? [];
    setModules(list);
    setActiveModuleId(list?.[0]?.id || "CASA");
  }, [profileId]);

  const moveTask = (id, newStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );
  };

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSaveNewTask = (data) => {
    const id = safeUUID();
    const priority = data.priority || "normal";

    const newTask = {
      id,
      title: data.title,
      description: data.description || "",
      status: TaskStatus.TODO,
      priority,
      xp: PRIORITY_XP[priority] ?? 10,
      icon: data.icon || "💠",
      time: data.time || undefined,
      borderColor: data.borderColor || currentStation.color,
      objectives: Array.isArray(data.objectives) ? data.objectives : [],
      date: data.date || selectedDate,
      recurrence: data.recurrence || { type: "none" },
      moduleId: activeModuleId,
    };

    setTasks((prev) => [newTask, ...prev]);
    setIsNewOpen(false);
  };

  const columns = useMemo(
    () => [
      { id: TaskStatus.TODO, title: "A FAZER" },
      { id: TaskStatus.IN_PROGRESS, title: "PROCESSAMENTO" },
      { id: TaskStatus.DONE, title: "CONCLUÍDO" },
    ],
    []
  );

  const tasksForModule = useMemo(() => {
    return (tasks || []).filter((t) => !t.moduleId || t.moduleId === activeModuleId);
  }, [tasks, activeModuleId]);

  const byStatus = (status) => tasksForModule.filter((t) => t.status === status);

  const operatorName = currentProfile?.name || "OPERADOR";
  const headerDate = formatDatePT(selectedDate);

  const avatar = currentProfile?.avatar;
  const isAvatarImg =
    typeof avatar === "string" &&
    (avatar.startsWith("data:") || avatar.startsWith("http"));

  const openProfileSettings = () => {
    console.log("Profile settings: TODO");
  };

  return (
    <div className="ms-root">
      <aside className="ms-sidebar glass-premium">
        <div className="ms-sidebar-top">
          <button type="button" className="ms-back-hub" onClick={goHub}>
            ← HUB
          </button>
        </div>

        <div className="ms-side-title tech-font">
          MÓDULOS
          <button
            type="button"
            className="ms-gear"
            title="Editar módulos"
            onClick={() => setModulesOpen(true)}
            style={{ marginLeft: 10 }}
          >
            ⚙
          </button>
        </div>

        <div className="ms-side-stations">
          {normalizedModules.map((m) => (
            <button
              key={m.id}
              className={`ms-side-station ${activeModuleId === m.id ? "is-active" : ""}`}
              onClick={() => setActiveModuleId(m.id)}
              type="button"
              style={
                activeModuleId === m.id
                  ? { borderColor: m.color, boxShadow: `0 0 18px ${m.color}22` }
                  : undefined
              }
            >
              {m.name}
            </button>
          ))}
        </div>

        <div className="ms-profile glass-premium">
          <div className="ms-profile-left">
            <div className="ms-avatar">
              {isAvatarImg ? (
                <img src={avatar} alt="avatar" />
              ) : (
                <span>{typeof avatar === "string" ? avatar : "👤"}</span>
              )}
            </div>

            <div className="ms-profile-meta">
              <div className="ms-profile-name">{operatorName}</div>
              <div className="ms-profile-sub data-font">
                <span>LV 1</span>
                <span className="ms-xp">24 XP</span>
              </div>
              <div className="ms-xpbar">
                <div className="ms-xpbar-fill" style={{ width: "35%" }} />
              </div>
            </div>
          </div>

          <button
            className="ms-gear"
            type="button"
            title="Configurações"
            onClick={openProfileSettings}
          >
            ⚙
          </button>
        </div>

        <div className="ms-calendar glass-premium">
          <Calendar
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            accentColor={currentModuleMeta.color}
          />
        </div>
      </aside>

      <main className="ms-main glass-premium">
        <header className="ms-header">
          <div className="ms-header-left">
            <div className="ms-header-kicker tech-font">MAINFRAME INTERFACE</div>

            <div className="ms-header-title-row">
              <div className="ms-logo brand-font">NΞXUS</div>
              <div className="ms-date data-font">{headerDate}</div>
            </div>

            <div className="ms-header-kicker tech-font" style={{ marginTop: 6, opacity: 0.7 }}>
              MÓDULO ATIVO:{" "}
              <span style={{ color: currentModuleMeta.color }}>
                {currentModuleMeta.name}
              </span>
            </div>
          </div>

          <div className="ms-header-right">
            <button
              type="button"
              className="ms-new-mission"
              onClick={() => setIsNewOpen(true)}
              style={{ borderColor: currentModuleMeta.color }}
            >
              NOVA MISSÃO
            </button>
          </div>
        </header>

        <section className="ms-board">
          {columns.map((col) => (
            <div key={col.id} className="ms-col glass-premium">
              <div className="ms-col-head">
                <div className="ms-col-title tech-font">{col.title}</div>
                <div className="ms-col-count data-font">{byStatus(col.id).length}</div>
              </div>

              <div className="ms-col-list">
                {byStatus(col.id).map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onMove={moveTask}
                    onDelete={deleteTask}
                    TaskStatus={TaskStatus}
                  />
                ))}
              </div>
            </div>
          ))}
        </section>
      </main>

      {isNewOpen && (
        <NewTaskModal
          currentModule={{
            id: currentStation.id,
            name: currentStation.name,
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
            const safeNext = Array.isArray(nextModules) ? nextModules : [];
            setModules(safeNext);
            writeModulesLocal(profileId, safeNext);

            if (!safeNext.some((m) => m.id === activeModuleId)) {
              setActiveModuleId(safeNext?.[0]?.id || "CASA");
            }

            setModulesOpen(false);
          }}
        />
      )}
    </div>
  );
}