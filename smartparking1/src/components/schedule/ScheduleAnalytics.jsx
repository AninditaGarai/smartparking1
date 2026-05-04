function Bar({ label, value, color }) {
  return (
    <div className="sch-chart-item">
      <span>{label}</span>
      <div className="sch-track"><div className="sch-fill" style={{ width: `${value}%`, background: color }} /></div>
      <span>{value}%</span>
    </div>
  );
}

export default function ScheduleAnalytics({ analytics }) {
  if (!analytics) {
    return <section className="sch-analytics">Loading analytics...</section>;
  }

  const totalType = Object.values(analytics.byType || {}).reduce((a, b) => a + b, 0) || 1;
  const typeRows = [
    ["New", analytics.byType?.new || 0, "#2e9e64"],
    ["Follow-up", analytics.byType?.followup || 0, "#7c56e8"],
    ["Urgent", analytics.byType?.urgent || 0, "#d54545"],
    ["Lab", analytics.byType?.lab || 0, "#b97811"],
  ];

  return (
    <section className="sch-analytics">
      <h4 className="sch-drawer-title">Schedule Analytics</h4>
      <div className="sch-muted">
        Capacity {analytics.occupancy.totalUsed}/{analytics.occupancy.totalCapacity} used
      </div>
      <div className="sch-chart-row">
        <Bar label="Overall Occupancy" value={analytics.occupancy.occupancyPct} color="#2376ff" />
        {typeRows.map(([label, count, color]) => (
          <Bar key={label} label={label} value={Math.round((count / totalType) * 100)} color={color} />
        ))}
      </div>
    </section>
  );
}
