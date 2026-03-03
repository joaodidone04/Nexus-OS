import { useEffect, useMemo, useState } from "react";
import "./Calendar.css";

// FIX: dias-da-semana com índice para evitar key duplicada (D, S, T, Q, Q, S, S)
const DOW = [
  { label: "D", key: "dow-0" },
  { label: "S", key: "dow-1" },
  { label: "T", key: "dow-2" },
  { label: "Q", key: "dow-3" },
  { label: "Q", key: "dow-4" },
  { label: "S", key: "dow-5" },
  { label: "S", key: "dow-6" },
];

export default function Calendar({
  selectedDate,
  onDateChange,
  accentColor,
  isPopover = false,
  onClosePopover,
}) {
  const safeSelected = selectedDate || new Date().toISOString().split("T")[0];

  const [viewDate, setViewDate] = useState(
    () => new Date(safeSelected + "T12:00:00")
  );

  // FIX: sincroniza viewDate quando selectedDate muda externamente
  // (ex: pai seta selectedDate programaticamente)
  useEffect(() => {
    if (!selectedDate) return;
    const next = new Date(selectedDate + "T12:00:00");
    // Só atualiza se o mês/ano for diferente do atual — evita reset ao clicar no mesmo mês
    if (
      next.getMonth()    !== viewDate.getMonth() ||
      next.getFullYear() !== viewDate.getFullYear()
    ) {
      setViewDate(next);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const handlePrevMonth = () =>
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));

  const handleNextMonth = () =>
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  const monthName = useMemo(() =>
    viewDate
      .toLocaleDateString("pt-BR", { month: "short", year: "numeric" })
      .toUpperCase(),
    [viewDate]
  );

  const calendarDays = useMemo(() => {
    const year  = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDow    = new Date(year, month, 1).getDay(); // 0 = Dom

    const arr = [];
    for (let i = 0; i < startDow; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(d);
    return arr;
  }, [viewDate]);

  const handleSelect = (dateStr) => {
    onDateChange(dateStr);
    if (typeof onClosePopover === "function") onClosePopover();
  };

  const handleToday = () => {
    const today = new Date().toISOString().split("T")[0];
    onDateChange(today);
    if (typeof onClosePopover === "function") onClosePopover();
  };

  return (
    <div className={`calendar-root${isPopover ? " is-popover" : ""}`}>
      <div className="calendar-header">
        <button
          type="button"
          className="calendar-nav"
          onClick={handlePrevMonth}
          aria-label="Mês anterior"
        >◀</button>

        <span className="calendar-month tech-font">{monthName}</span>

        <button
          type="button"
          className="calendar-nav"
          onClick={handleNextMonth}
          aria-label="Próximo mês"
        >▶</button>
      </div>

      <div className="calendar-grid">
        {/* FIX: chaves únicas por índice — evita React key warning */}
        {DOW.map((d) => (
          <div key={d.key} className="calendar-dow data-font">{d.label}</div>
        ))}

        {calendarDays.map((d, i) => {
          if (d === null) return <div key={`empty-${i}`} className="calendar-empty" />;

          const y  = viewDate.getFullYear();
          const mo = String(viewDate.getMonth() + 1).padStart(2, "0");
          const da = String(d).padStart(2, "0");
          const dateStr   = `${y}-${mo}-${da}`;
          const isSelected = safeSelected === dateStr;

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => handleSelect(dateStr)}
              className={`calendar-day${isSelected ? " is-selected" : ""}`}
              style={isSelected ? {
                backgroundColor: accentColor,
                boxShadow: `0 0 10px ${accentColor}88`,
              } : undefined}
              aria-label={`Selecionar ${dateStr}`}
              aria-pressed={isSelected}
            >
              {d}
            </button>
          );
        })}
      </div>

      {isPopover && (
        <button type="button" className="calendar-today tech-font" onClick={handleToday}>
          HOJE
        </button>
      )}
    </div>
  );
}