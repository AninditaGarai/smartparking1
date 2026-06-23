import { useEffect, useState } from "react";
import ScheduleAnalytics from "./ScheduleAnalytics";
import ScheduleDetailDrawer from "./ScheduleDetailDrawer";
import ScheduleGrid from "./ScheduleGrid";
import ScheduleHeader from "./ScheduleHeader";
import "./ScheduleBoard.css";

export default function AdminScheduleBoard({ api, showNotice, onNavigateBooking }) {
  const [view, setView] = useState("month");
  const [weekOffset, setWeekOffset] = useState(0);
  const [appointments, setAppointments] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [selected, setSelected] = useState(null);

  const loadData = async () => {
    try {
      const [scheduleData, analyticsData] = await Promise.all([
        api(`/admin/schedule?weekOffset=${weekOffset}`),
        api("/admin/analytics"),
      ]);
      setAppointments(scheduleData.appointments || []);
      setAnalytics(analyticsData);
    } catch (error) {
      showNotice(error.message);
    }
  };

  const openBookingRecord = async () => {
    if (!selected?.id) return;
    if (onNavigateBooking) {
      onNavigateBooking(selected.id);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekOffset]);

  return (
    <section className="sch-shell">
      <ScheduleHeader view={view} setView={setView} weekOffset={weekOffset} setWeekOffset={setWeekOffset} />

      <div className="sch-grid-shell">
        <ScheduleGrid appointments={appointments} onSelect={setSelected} />
        <ScheduleDetailDrawer
          selected={selected}
          clearSelection={() => setSelected(null)}
          onOpenBooking={openBookingRecord}
        />
      </div>

      <ScheduleAnalytics analytics={analytics} />
    </section>
  );
}
