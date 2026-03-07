

## Plan: Start/End Location Inputs + Timeline Fix + Brutalist UI Overhaul

### 1. Search Bar — Start & End Locations

Replace the single "Search destination" input with two fields: **Starting Location** and **Ending Location**. Both fields sit stacked vertically with a route connector line between them. The "from" field defaults to "Current Location" with a GPS icon. Submitting both triggers the route card.

**File:** `src/components/SearchBar.tsx`
- Two inputs: `from` (default "Current Location") and `to` (destination)
- A vertical dot-line connector between them visually
- Submit only when `to` is filled

**File:** `src/pages/Index.tsx`
- Update `handleSearch` to accept `{ from: string, to: string }`

### 2. Timeline — Crime Shifts, Not Disappears

Currently `timeDecay` filters out events outside the viewed time window. Instead, the timeline should **redistribute** incidents to match the time-of-day crime pattern for the selected hour — not remove them.

**File:** `src/data/safetyData.ts`
- Remove the strict `age < 0` / `age > 24h` filter from the MapView consumption
- Add a `getTimeAdjustedRisk(point, viewHour)` function: instead of hiding points, scale their `risk` by the `crimeMultiplier` for the viewed hour vs. their original hour
- This means scrubbing to 8 AM still shows incidents but at much lower intensity, while scrubbing to 1 AM shows them at peak intensity

**File:** `src/components/MapView.tsx`
- When building `heatData`, use `getTimeAdjustedRisk` instead of pure `timeDecay` filtering
- All points remain visible, their intensity shifts with the slider

### 3. Brutalist UI Overhaul

Transform every component from the current soft/rounded "glass" style to a raw, brutalist aesthetic: **square edges, thick borders, larger fonts, no rounded corners, no blur, high contrast**.

**File:** `src/index.css`
- Set `--radius: 0` 
- Replace `.glass` class: remove `backdrop-filter`, `border-radius`. Use solid `background: hsl(0 0% 5%)`, thick `border: 2px solid hsl(0 0% 20%)`
- Increase base font sizes
- Remove glow animations / soft shadows

**File:** `tailwind.config.ts`
- Set all `borderRadius` values to `0`

**Files:** All components (`Header`, `SearchBar`, `RouteCard`, `ReportModal`, `AlertToast`, `SafetyLegend`, `TimelineSlider`)
- Replace all `rounded-*` classes with `rounded-none`
- Replace `glass` usage (it will already be square from CSS but ensure consistency)
- Increase text sizes: `text-xs` → `text-sm`, `text-sm` → `text-base`, `text-base` → `text-lg`, `text-lg` → `text-2xl`
- Use `font-bold` / `uppercase` / `tracking-wider` more aggressively
- Thicker borders: `border` → `border-2`
- Remove soft transitions and spring animations — use sharp, instant transitions

