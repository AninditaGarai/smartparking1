export default function ScheduleHeader({ view, setView, weekOffset, setWeekOffset }) {
  return (
    <header className="sch-header">
      <div>
        <h3 className="sch-title">Parking Operations Schedule</h3>
        <div className="sch-subtitle">Weekly occupancy planner · Week {weekOffset + 2}</div>
      </div>
      <div className="sch-row">
        <div className="sch-toggle" role="tablist" aria-label="Schedule view mode">
          <button role="tab" aria-selected={view === "week"} className={view === "week" ? "active" : ""} onClick={() => setView("week")}>Week</button>
          <button role="tab" aria-selected={view === "month"} className={view === "month" ? "active" : ""} onClick={() => setView("month")}>Month</button>
        </div>
        <button onClick={() => setWeekOffset((v) => v - 1)} aria-label="Previous week">Prev</button>
        <button onClick={() => setWeekOffset((v) => v + 1)} aria-label="Next week">Next</button>
      </div>
    </header>
  );
}
