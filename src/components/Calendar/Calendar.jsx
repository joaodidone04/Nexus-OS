import React, { useMemo, useState } from "react";

export default function Calendar({
  selectedDate,
  onDateChange,
  accentColor,
  isPopover = false,
  onClosePopover,
}) {
  const safeSelected = selectedDate || new Date().toISOString().split("T")[0];

  const [viewDate, setViewDate] = useState(new Date(safeSelected + "T12:00:00"));

  const handlePrevMonth = () =>
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));

  const handleNextMonth = () =>
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  const monthName = useMemo(() => {
    return viewDate
      .toLocaleDateString("pt-BR", { month: "short", year: "numeric" })
      .toUpperCase();
  }, [viewDate]);

  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();

    // getDay: 0 (Dom) ... 6 (Sáb)
    const start = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();

    const arr = [];
    for (let i = 0; i < start; i++) arr.push(null);
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
    <div className={`calendar-root ${isPopover ? "is-popover" : ""}`}>
      <div className="calendar-header">
        <button type="button" className="calendar-nav" onClick={handlePrevMonth} aria-label="Mês anterior">
          ◀
        </button>

        <span className="calendar-month tech-font">{monthName}</span>

        <button type="button" className="calendar-nav" onClick={handleNextMonth} aria-label="Próximo mês">
          ▶
        </button>
      </div>

      <div className="calendar-grid">
        {["D", "S", "T", "Q", "Q", "S", "S"].map((d) => (
          <div key={d} className="calendar-dow data-font">
            {d}
          </div>
        ))}

        {calendarDays.map((d, i) => {
          if (d === null) return <div key={`empty-${i}`} className="calendar-empty" />;

          const dateStr = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          const isSelected = safeSelected === dateStr;

          return (
            <button
              key={i}
              type="button"
              onClick={() => handleSelect(dateStr)}
              className={`calendar-day ${isSelected ? "is-selected" : ""}`}
              style={
                isSelected
                  ? {
                      backgroundColor: accentColor,
                      boxShadow: `0 0 10px ${accentColor}88`,
                    }
                  : undefined
              }
              aria-label={`Selecionar ${dateStr}`}
            >
              {d}
            </button>
          );
        })}
      </div>

      {isPopover ? (
        <button type="button" className="calendar-today tech-font" onClick={handleToday}>
          HOJE
        </button>
      ) : null}
    </div>
  );
}