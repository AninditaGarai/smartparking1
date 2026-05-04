# Schedule UI: Component-Level Wireframe Spec (React)

## Goal
Define a scalable schedule experience where Month view supports planning density while Day/Week views support safe execution and editing.

## Component Tree

- `SchedulePage`
- `ScheduleSidebar`
- `ScheduleHeader`
- `ViewModeToggle`
- `DateNavigator`
- `ScheduleFilters`
- `ScheduleGrid`
- `WeekColumn`
- `DayColumn`
- `TimeRail`
- `AppointmentCard`
- `EmptySlotCell`
- `NowIndicator`
- `DetailDrawer`
- `AppointmentPreview`
- `AppointmentActions`
- `CreateAppointmentModal`
- `LegendPanel`
- `LoadMeter`

## Primary Layout Regions

1. Left rail (persistent)
- Width: 240 px desktop, collapsible to icon rail.
- Content: `Schedule`, `Patients`, `Programs`, `Reports`, `Laboratory`.
- Keyboard: roving tab index with arrow support.

2. Top header (sticky)
- Contains page title, `ViewModeToggle`, `DateNavigator`, and quick actions.
- Sticky behavior with subtle shadow when content scrolls.

3. Main content
- Month planning grid by default for high-level density.
- Optional switch to Week/Day detail views.

4. Right detail drawer
- Opens when user clicks an appointment or empty slot.
- Contains summary, participant, status, notes, and action buttons.

## Core Props Contracts

### `SchedulePage`
- `initialView: "month" | "week" | "day"`
- `initialDate: Date`

### `ScheduleGrid`
- `viewMode: "month" | "week" | "day"`
- `weeks: WeekModel[]`
- `appointments: AppointmentModel[]`
- `onSlotSelect(slot)`
- `onAppointmentSelect(appointment)`

### `AppointmentCard`
- `appointment: AppointmentModel`
- `dense: boolean`
- `isSelected: boolean`
- `onClick()`

### `DetailDrawer`
- `open: boolean`
- `mode: "appointment" | "create"`
- `appointment?: AppointmentModel`
- `slot?: SlotModel`
- `onClose()`
- `onSave(payload)`
- `onDelete(id)`

## Data Models

```ts
export type AppointmentType = "new" | "followup" | "urgent" | "lab";

export interface AppointmentModel {
  id: string;
  patientName: string;
  type: AppointmentType;
  startISO: string;
  endISO: string;
  providerId: string;
  location: string;
  locked: boolean;
  source: "manual" | "call" | "system";
  status: "scheduled" | "checked-in" | "in-progress" | "completed" | "cancelled";
}

export interface SlotModel {
  dayISO: string;
  startISO: string;
  endISO: string;
  providerId: string;
}

export interface WeekModel {
  weekIndex: number;
  days: { dayISO: string; label: string }[];
}
```

## Visual Encoding Rules

- Type colors:
  - New: green token
  - Follow-up: violet token
  - Urgent: red token
  - Lab: amber token
- Every color token must include paired icon and text label in details.
- Dense cards show icon + short code; full cards show title + time + icon.

## Interaction States

1. `idle`
- No selection; drawer closed.

2. `slot-selected`
- Empty slot selected; drawer open in create mode.

3. `appointment-selected`
- Appointment selected; drawer open in details mode.

4. `editing`
- Inputs active in drawer, unsaved changes banner visible.

5. `saving` / `error`
- Buttons disabled while saving, inline message region for errors.

## Responsive Behavior

- Desktop: 3-column shell (sidebar + grid + drawer overlay/docked).
- Tablet: collapsible sidebar, drawer as slide-over.
- Mobile: one panel at a time with segmented control for Grid/Details.

## Performance Notes

- Use virtualization for day/week slot lists.
- Keep month view card content minimal.
- Precompute occupancy matrix for fast paint.

## Implementation Sequence

1. Build skeleton layout and static regions.
2. Add view toggle and date navigation state.
3. Render month grid with empty cells.
4. Add appointment cards with click selection.
5. Add detail drawer and create/edit flows.
6. Add keyboard and screen-reader support.
7. Add analytics overlays and density heatmap.
