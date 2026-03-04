// ═══════════════════════════════════════════════════════════
// NΞXUS — Motor de Recorrência
//
// Uma task é salva UMA vez. Nunca duplicada no storage.
// taskOccursOnDate() decide se ela aparece em um dia.
//
// Tipos:
//   "none"    → só na data exata de criação
//   "weekly"  → toda semana no mesmo dia da semana da data de criação
//   "monthly" → todo mês no mesmo dia do mês
//   "yearly"  → todo ano na mesma data (mês + dia)
//
// Regra universal: nunca aparece ANTES de task.date.
// ═══════════════════════════════════════════════════════════

export function taskOccursOnDate(task, dateStr) {
  const start = task?.date;
  if (!start || dateStr < start) return false;

  const type = task?.recurrence?.type ?? "none";

  switch (type) {
    case "none":
      return dateStr === start;

    case "weekly": {
      const a = new Date(start   + "T12:00:00");
      const b = new Date(dateStr + "T12:00:00");
      return b.getDay() === a.getDay();
    }

    case "monthly": {
      const a = new Date(start   + "T12:00:00");
      const b = new Date(dateStr + "T12:00:00");
      return b.getDate() === a.getDate();
    }

    case "yearly": {
      const a = new Date(start   + "T12:00:00");
      const b = new Date(dateStr + "T12:00:00");
      return b.getMonth() === a.getMonth() && b.getDate() === a.getDate();
    }

    default:
      return dateStr === start;
  }
}

// Retorna Set<YYYY-MM-DD> com dias do array que têm ao menos 1 task
export function getActiveDates(tasks, dateStrings) {
  const active = new Set();
  for (const ds of dateStrings) {
    for (const task of tasks) {
      if (taskOccursOnDate(task, ds)) {
        active.add(ds);
        break;
      }
    }
  }
  return active;
}

// Todos os dias de um mês como "YYYY-MM-DD"
export function getDatesOfMonth(year, month) {
  const days = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: days }, (_, i) => {
    const mo = String(month + 1).padStart(2, "0");
    const da = String(i + 1).padStart(2, "0");
    return `${year}-${mo}-${da}`;
  });
}

// Label humano da regra (usado no TaskCard/badge)
const DOW_PT = ["domingo","segunda","terça","quarta","quinta","sexta","sábado"];
const MON_PT = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];

export function recurrenceLabel(task) {
  const type  = task?.recurrence?.type ?? "none";
  const start = task?.date;
  if (!start || type === "none") return null;
  const d = new Date(start + "T12:00:00");
  switch (type) {
    case "weekly":  return `toda ${DOW_PT[d.getDay()]}`;
    case "monthly": return `todo dia ${d.getDate()}`;
    case "yearly":  return `${d.getDate()}/${MON_PT[d.getMonth()]} anual`;
    default:        return null;
  }
}