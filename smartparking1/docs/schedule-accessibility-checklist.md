# Schedule UI Accessibility Checklist

## 1. Global and Landmarks

- [ ] Page has one `h1` that matches current schedule context.
- [ ] Regions use landmarks: `nav`, `header`, `main`, `aside`.
- [ ] Skip-to-content link is available and visible on focus.
- [ ] Focus order follows visual order.

## 2. Sidebar Navigation

- [ ] Active item has `aria-current="page"`.
- [ ] All items are reachable by keyboard.
- [ ] Icon-only collapsed mode still has accessible names.
- [ ] Hit areas are at least 44 px.

## 3. Header, View Toggle, Date Navigation

- [ ] Toggle uses `role="tablist"` or segmented control semantics.
- [ ] Previous/next month buttons have explicit labels.
- [ ] Current period announcement is read by screen readers.
- [ ] Keyboard shortcut help is discoverable.

## 4. Calendar Grid

- [ ] Grid uses semantic roles (`grid`, `row`, `gridcell`) when interactive.
- [ ] Arrow key navigation moves between cells predictably.
- [ ] Enter/Space opens selected appointment or slot.
- [ ] Selected day and selected appointment are programmatically exposed (`aria-selected`).
- [ ] Today is identified with text and semantics, not only color.

## 5. Appointment Cards

- [ ] Card communicates type using icon + text + color.
- [ ] Color contrast for text/icons meets WCAG AA.
- [ ] Truncated content has accessible full text (`title` or sr-only text).
- [ ] Locked/private cards expose status to assistive tech.

## 6. Empty Slots and Create Flow

- [ ] Empty slots have clear affordance and label (for example, "Create appointment at 10:30").
- [ ] Touch target size is at least 44 px.
- [ ] Confirmation feedback appears in accessible live region.

## 7. Detail Drawer / Modal

- [ ] Drawer has `aria-labelledby` and `aria-describedby`.
- [ ] Focus is trapped while open and restored on close.
- [ ] Escape key closes drawer unless unsaved edits require confirmation.
- [ ] Error messages are tied to fields with `aria-describedby`.

## 8. Now Indicator and Time Context

- [ ] Current time indicator has non-color cue (label or icon).
- [ ] Screen reader can announce current day/time context.
- [ ] Time zone is visible and machine-readable.

## 9. Dense Month View Safeguards

- [ ] Month view is read-optimized; editing actions are deferred to detail views.
- [ ] Hover-only affordances also work with keyboard and touch.
- [ ] Zoom at 200% keeps controls usable with no content loss.

## 10. Validation and QA

- [ ] Run automated audits (axe, Lighthouse).
- [ ] Manual keyboard-only pass for all critical workflows.
- [ ] Test with screen reader (NVDA/JAWS/VoiceOver).
- [ ] Verify contrast under custom themes/high contrast mode.
- [ ] Test touch interaction on small screens.

## State Mapping Matrix

| UI Element | Idle | Hover/Focus | Selected | Disabled | Error |
|---|---|---|---|---|---|
| Sidebar item | Exposed name | Focus ring | `aria-current` | n/a | n/a |
| View toggle | Label + state | Focus ring | `aria-selected` | `aria-disabled` | n/a |
| Grid cell | Day/time label | Focus ring | `aria-selected` | n/a | n/a |
| Appointment card | Type + time + status | Focus ring + readable tooltip | `aria-selected` | `aria-disabled` if locked editing | Inline error region in drawer |
| Drawer action button | Name and intent | Focus ring | Pressed state where relevant | Disabled while saving | Error announced in live region |
