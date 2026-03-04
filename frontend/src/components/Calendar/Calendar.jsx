import { useEffect, useMemo, useState } from "react";
import "./Calendar.css";

const DOW = [
  { label: "D", key: "dow-0" },
  { label: "S", key: "dow-1" },
  { label: "T", key: "dow-2" },
  { label: "Q", key: "dow-3" },
  { label: "Q", key: "dow-4" },
  { label: "S", key: "dow-5" },
  { label: "S", key: "dow-6" },
];

/**
 * Props:
 *   selectedDate    "YYYY-MM-DD"
 *   onDateChange    (dateStr) => void
 *   accentColor     string
 *   activeDates     Set<string>  – dias com missões → ponto colorido
 *   onViewChange    (year, month) => void  – ao trocar mês
 *   isPopover       bool
 *   onClosePopover  () => void
 */
export default function Calendar({
  selectedDate,
  onDateChange,
  accentColor,
  activeDates,
  onViewChange,
  isPopover = false,
  onClosePopover,
}) {
  const safeSelected = selectedDate || new Date().toISOString().split("T")[0];
  const today = new Date().toISOString().split("T")[0];

  const [viewDate, setViewDate] = useState(
    () => new Date(safeSelected + "T12:00:00")
  );

  useEffect(() => {
    if (!selectedDate) return;
    const next = new Date(selectedDate + "T12:00:00");
    if (
      next.getMonth()    !== viewDate.getMonth() ||
      next.getFullYear() !== viewDate.getFullYear()
    ) {
      setViewDate(next);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const changeView = (d) => {
    setViewDate(d);
    onViewChange?.(d.getFullYear(), d.getMonth());
  };

  const handlePrevMonth = () =>
    changeView(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const handleNextMonth = () =>
    changeView(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  const monthName = useMemo(() =>
    viewDate.toLocaleDateString("pt-BR", { month: "short", year: "numeric" }).toUpperCase(),
    [viewDate]
  );

  const calendarDays = useMemo(() => {
    const year  = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDow    = new Date(year, month, 1).getDay();
    const arr = [];
    for (let i = 0; i < startDow; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(d);
    return arr;
  }, [viewDate]);

  const handleSelect = (dateStr) => {
    onDateChange(dateStr);
    onClosePopover?.();
  };

  return (
    <div className={`calendar-root${isPopover ? " is-popover" : ""}`}>
      <div className="calendar-header">
        <button type="button" className="calendar-nav" onClick={handlePrevMonth} aria-label="Mês anterior">◀</button>
        <span className="calendar-month tech-font">{monthName}</span>
        <button type="button" className="calendar-nav" onClick={handleNextMonth} aria-label="Próximo mês">▶</button>
      </div>

      <div className="calendar-grid">
        {DOW.map(d => (
          <div key={d.key} className="calendar-dow data-font">{d.label}</div>
        ))}
        {calendarDays.map((d, i) => {
          if (d === null) return <div key={`empty-${i}`} className="calendar-empty" />;

          const y  = viewDate.getFullYear();
          const mo = String(viewDate.getMonth() + 1).padStart(2, "0");
          const da = String(d).padStart(2, "0");
          const dateStr    = `${y}-${mo}-${da}`;
          const isSelected = safeSelected === dateStr;
          const isToday    = today === dateStr;
          const hasTask    = activeDates?.has(dateStr) ?? false;

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => handleSelect(dateStr)}
              className={[
                "calendar-day",
                isSelected          ? "is-selected" : "",
                isToday && !isSelected ? "is-today" : "",
                hasTask && !isSelected ? "has-task"  : "",
              ].filter(Boolean).join(" ")}
              style={isSelected ? {
                backgroundColor: accentColor,
                boxShadow: `0 0 10px ${accentColor}88`,
              } : undefined}
              aria-label={`Selecionar ${dateStr}`}
              aria-pressed={isSelected}
            >
              {d}
              {hasTask && !isSelected && (
                <span className="calendar-dot" style={{ backgroundColor: accentColor }} />
              )}
            </button>
          );
        })}
      </div>

      {isPopover && (
        <button type="button" className="calendar-today tech-font" onClick={() => handleSelect(today)}>
          HOJE
        </button>
      )}
    </div>
  );
}