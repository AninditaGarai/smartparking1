function LabelValue({ label, value }) {
  return (
    <div>
      <div className="sch-lv-label">{label}</div>
      <div className="sch-lv-value">{value}</div>
    </div>
  );
}

export default function ScheduleDetailDrawer({ selected, clearSelection, onOpenBooking }) {
  return (
    <aside className="sch-drawer" aria-live="polite">
      {!selected && (
        <>
          <h4 className="sch-drawer-title">Details</h4>
          <div className="sch-muted">Select any appointment or empty slot to inspect details.</div>
        </>
      )}

      {selected?.mode === "appointment" && (
        <>
          <h4 className="sch-drawer-title">{selected.slotName}</h4>
          <LabelValue label="Patient" value={selected.patientName} />
          <LabelValue label="Vehicle" value={selected.vehicleNo} />
          <LabelValue label="When" value={`${selected.dayLabel} ${selected.timeLabel}`} />
          <LabelValue label="Status" value={selected.status} />
          <div className="sch-row">
            <button className="primary" onClick={onOpenBooking}>Open Booking</button>
            <button onClick={clearSelection}>Clear</button>
          </div>
        </>
      )}

      {selected?.mode === "slot" && (
        <>
          <h4 className="sch-drawer-title">Empty Slot</h4>
          <LabelValue label="Time" value={`${selected.day} ${selected.time}`} />
          <div className="sch-muted">Use month view for planning. Create or edit in detailed booking flow.</div>
          <div className="sch-row">
            <button className="primary">Start Booking</button>
            <button onClick={clearSelection}>Clear</button>
          </div>
        </>
      )}
    </aside>
  );
}
