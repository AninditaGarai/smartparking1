import { useMemo, useState } from "react";
import "./ScheduleLayoutPrototype.css";

const NAV = ["Schedule", "Patients", "Programs", "Reports", "Laboratory"];
const TIMES = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];
const DAYS = ["Mon 8", "Tue 9", "Wed 10", "Thu 11", "Fri 12", "Sat 13", "Sun 14"];

const APPOINTMENTS = {
  "10:00-Wed 10": { id: "A1", type: "urgent", title: "Urgent Call", patient: "A. Khan", icon: "phone", status: "scheduled" },
  "11:00-Tue 9": { id: "A2", type: "new", title: "New Patient", patient: "L. James", icon: "user", status: "checked-in" },
  "12:00-Thu 11": { id: "A3", type: "followup", title: "Follow-up", patient: "R. Silva", icon: "repeat", status: "scheduled" },
  "14:00-Fri 12": { id: "A4", type: "lab", title: "Lab Review", patient: "M. Chen", icon: "flask", status: "in-progress" },
};

function getTypeColor(type) {
  if (type === "new") return "#2e9e64";
  if (type === "followup") return "#7c56e8";
  if (type === "urgent") return "#d54545";
  return "#b97811";
}

export default function ScheduleLayoutPrototype() {
  const [section, setSection] = useState("Schedule");
  const [view, setView] = useState("month");
  const [weekOffset, setWeekOffset] = useState(0);
  const [selected, setSelected] = useState(null);

  const analytics = useMemo(() => {
    const totalSlots = TIMES.length * DAYS.length;
    const filled = Object.keys(APPOINTMENTS).length;
    const occupancy = Math.round((filled / totalSlots) * 100);

    const byType = ["new", "followup", "urgent", "lab"].map((type) => {
      const count = Object.values(APPOINTMENTS).filter((item) => item.type === type).length;
      return { type, count };
    });

    return { occupancy, byType, totalSlots, filled };
  }, []);

  return (
    <div className="schedule-prototype">
      <aside className="schedule-sidebar" aria-label="Primary Navigation">
        <div className="schedule-brand">MediFlow</div>
        <nav className="schedule-nav">
          {NAV.map((item) => (
            <button
              key={item}
              className={item === section ? "active" : ""}
              aria-current={item === section ? "page" : undefined}
              onClick={() => setSection(item)}
            >
              {item}
            </button>
          ))}
        </nav>
      </aside>

      <main className="schedule-main">
        <header className="schedule-header">
          <div>
            <h2 style={{ margin: 0 }}>Schedule</h2>
            <div style={{ color: "#5f7185", fontSize: 13 }}>January 2024 • Week {weekOffset + 2}</div>
          </div>

          <div className="schedule-actions">
            <div className="schedule-toggle" role="tablist" aria-label="Schedule view mode">
              <button role="tab" aria-selected={view === "week"} className={view === "week" ? "active" : ""} onClick={() => setView("week")}>Week</button>
              <button role="tab" aria-selected={view === "month"} className={view === "month" ? "active" : ""} onClick={() => setView("month")}>Month</button>
            </div>
            <button aria-label="Previous range" onClick={() => setWeekOffset((v) => v - 1)}>Prev</button>
            <button aria-label="Next range" onClick={() => setWeekOffset((v) => v + 1)}>Next</button>
          </div>
        </header>

        <div className="schedule-legend" aria-label="Appointment legend">
          <span className="schedule-chip"><span className="schedule-dot" style={{ background: "#2e9e64" }} /> New Patient</span>
          <span className="schedule-chip"><span className="schedule-dot" style={{ background: "#7c56e8" }} /> Follow-up</span>
          <span className="schedule-chip"><span className="schedule-dot" style={{ background: "#d54545" }} /> Urgent</span>
          <span className="schedule-chip"><span className="schedule-dot" style={{ background: "#b97811" }} /> Laboratory</span>
        </div>

        <section className="schedule-grid-shell">
          <article className="schedule-grid-card">
            <div className="schedule-grid" role="grid" aria-label="Month schedule grid">
              <div className="schedule-day-head" aria-hidden="true" />
              {DAYS.map((day) => (
                <div key={day} className={`schedule-day-head ${day.startsWith("Wed") ? "today" : ""}`}>{day}</div>
              ))}

              {TIMES.map((time) => (
                <div key={time} style={{ display: "contents" }}>
                  <div key={`${time}-label`} className="schedule-time-cell">{time}</div>
                  {DAYS.map((day) => {
                    const key = `${time}-${day}`;
                    const appt = APPOINTMENTS[key];
                    const isNow = day.startsWith("Wed") && time === "10:00";
                    return (
                      <div key={key} className="schedule-slot" role="gridcell" aria-label={`${day} ${time}`}>
                        {appt ? (
                          <button
                            className={`schedule-appointment ${appt.type}`}
                            onClick={() => setSelected({ ...appt, day, time, mode: "appointment" })}
                            aria-label={`${appt.title} for ${appt.patient} at ${time} on ${day}`}
                          >
                            <div style={{ fontSize: 12, fontWeight: 700 }}>{appt.title}</div>
                            <div style={{ fontSize: 11 }}>{appt.patient}</div>
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelected({ mode: "slot", day, time })}
                            aria-label={`Create appointment at ${time} on ${day}`}
                          />
                        )}
                        {isNow && <div className="schedule-now-line" aria-hidden="true" />}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </article>

          <aside className="schedule-drawer" aria-live="polite">
            {!selected && (
              <>
                <h3>Details</h3>
                <div className="label">Select an appointment or empty slot from the grid.</div>
              </>
            )}

            {selected?.mode === "appointment" && (
              <>
                <h3>{selected.title}</h3>
                <div><span className="label">Patient</span><div className="value">{selected.patient}</div></div>
                <div><span className="label">When</span><div className="value">{selected.day} at {selected.time}</div></div>
                <div><span className="label">Type</span><div className="value" style={{ color: getTypeColor(selected.type) }}>{selected.type}</div></div>
                <div><span className="label">Status</span><div className="value">{selected.status}</div></div>
                <div className="actions">
                  <button className="primary">Open Record</button>
                  <button>Reschedule</button>
                </div>
              </>
            )}

            {selected?.mode === "slot" && (
              <>
                <h3>Create Appointment</h3>
                <div><span className="label">Selected slot</span><div className="value">{selected.day} at {selected.time}</div></div>
                <div><span className="label">Hint</span><div className="value">Month view is planning-first. Editing can continue in Week/Day detail.</div></div>
                <div className="actions">
                  <button className="primary">Start Booking</button>
                  <button onClick={() => setSelected(null)}>Clear</button>
                </div>
              </>
            )}
          </aside>
        </section>

        {section === "Schedule" && (
          <section className="schedule-analytics" aria-label="Schedule analytics">
            <h3 style={{ marginTop: 0 }}>Density Analytics</h3>
            <div style={{ fontSize: 13, color: "#5f7185", marginBottom: 10 }}>
              Occupancy {analytics.filled}/{analytics.totalSlots} slots ({analytics.occupancy}%)
            </div>

            <div className="chart-row">
              <div className="chart-item">
                <span>Overall Occupancy</span>
                <div className="chart-track"><div className="chart-fill" style={{ width: `${analytics.occupancy}%`, background: "#2376ff" }} /></div>
                <span>{analytics.occupancy}%</span>
              </div>
              {analytics.byType.map((item) => {
                const pct = Math.round((item.count / Math.max(analytics.filled, 1)) * 100);
                return (
                  <div className="chart-item" key={item.type}>
                    <span>{item.type}</span>
                    <div className="chart-track"><div className="chart-fill" style={{ width: `${pct}%`, background: getTypeColor(item.type) }} /></div>
                    <span>{pct}%</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
