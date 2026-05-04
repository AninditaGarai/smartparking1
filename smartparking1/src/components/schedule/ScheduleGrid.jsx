const TIMES = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function normalizeDay(dayLabel) {
  return (dayLabel || "").split(" ")[0];
}

export default function ScheduleGrid({ appointments, onSelect }) {
  const byCell = new Map();
  for (const appt of appointments) {
    byCell.set(`${appt.timeLabel}-${normalizeDay(appt.dayLabel)}`, appt);
  }

  return (
    <section className="sch-grid-card">
      <div className="sch-grid" role="grid" aria-label="Admin schedule grid">
        <div className="sch-head" />
        {DAYS.map((day) => (
          <div key={day} className={`sch-head ${day === "Wed" ? "today" : ""}`}>{day}</div>
        ))}

        {TIMES.map((time) => (
          <div key={time} style={{ display: "contents" }}>
            <div className="sch-time">{time}</div>
            {DAYS.map((day) => {
              const key = `${time}-${day}`;
              const appt = byCell.get(key);
              return (
                <div className="sch-slot" key={key} role="gridcell" aria-label={`${day} ${time}`}>
                  {appt ? (
                    <button className={`sch-appt ${appt.type || "new"}`} onClick={() => onSelect({ ...appt, mode: "appointment" })}>
                      <div className="sch-appt-title">{appt.slotName}</div>
                      <div className="sch-appt-sub">{appt.patientName}</div>
                    </button>
                  ) : (
                    <button className="sch-empty" onClick={() => onSelect({ mode: "slot", day, time })} aria-label={`Create appointment at ${time} on ${day}`} />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
