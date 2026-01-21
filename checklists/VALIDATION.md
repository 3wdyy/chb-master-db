# Validation Checklist

> **CRITICAL**: Read this AFTER completing implementation.
> Do not declare done until ALL criteria pass.

---

## Pre-Submission Checklist

Before presenting your work, verify each item:

### ✅ Phase 1: Foundation

- [ ] Mode toggle renders in header (C-Overview / M-Depth)
- [ ] Clicking "C-Overview" sets `state.dashboardMode = 'C-OVERVIEW'`
- [ ] Clicking "M-Depth" sets `state.dashboardMode = 'M-DEPTH'`
- [ ] Tab navigation changes based on mode
- [ ] C-Overview shows tabs: Scorecard, Markets, Trends
- [ ] M-Depth shows placeholder message
- [ ] Existing file upload still works
- [ ] **MC mode completely removed** — no MUSE/MC toggle exists
- [ ] **Markets extracted dynamically from data** — no hardcoded market list
- [ ] Dropdowns populate from actual data values

### ✅ Phase 2: Executive Scorecard Tab

- [ ] Hero cards display 4 KPIs: SLS_TTL, MBR_TTL, PCT_XBP, SLS_PEN
- [ ] Hero card values formatted correctly (e.g., "$125.4M", "456.7K", "23.4%")
- [ ] Hero card badges show correct variance
- [ ] Badge colors: green (positive), red (negative), gray (neutral)
- [ ] Comparison toggle exists: vs LY, vs Target, vs R12M
- [ ] Changing comparison updates all badges and values
- [ ] Insights panel renders with auto-generated insights
- [ ] Insights sorted by severity: critical → warning → positive
- [ ] Maximum 5 insights displayed
- [ ] Insights panel can be collapsed/expanded
- [ ] KPI table displays all 12 KPIs
- [ ] KPI table columns: KPI, YTD, Target, vs Target, LYTD, vs LY
- [ ] Table row colors based on vs_Target status
- [ ] Month filter dropdown works
- [ ] Market filter dropdown works (if implemented)

### ✅ Phase 3: Market Performance Tab

- [ ] KPI selector dropdown renders
- [ ] Market comparison bars render for each market (excluding "All Markets")
- [ ] Bars sorted by value descending
- [ ] Bar widths proportional (largest = 100%)
- [ ] Badges show variance with correct color
- [ ] Performance heatmap renders
- [ ] Heatmap rows: SLS_TTL, MBR_TTL, PCT_XBP, PCT_RDM
- [ ] Heatmap columns: UAE, KSA, Kuwait, Bahrain
- [ ] Cell colors: green (≥0%), yellow (-5% to 0%), red (<-5%)
- [ ] Tooltip shows details on hover

### ✅ Phase 4: Trends Tab

- [ ] KPI selector dropdown renders
- [ ] Market selector dropdown renders
- [ ] Monthly trend chart renders as SVG
- [ ] Three lines visible: Current Year, Last Year, Target
- [ ] Current year line: solid, blue
- [ ] Last year line: dashed, gray
- [ ] Target line: dotted, navy
- [ ] X-axis shows months (Jan-Dec)
- [ ] Y-axis shows values with appropriate scale
- [ ] Interactive dots on current year line
- [ ] Tooltip shows all three values on hover
- [ ] Legend explains line colors
- [ ] YTD cumulative chart renders (if implemented)

---

## Edge Case Testing

### Null/Missing Data

- [ ] Missing target values display "—" (not "null" or error)
- [ ] Zero values display correctly (not "—")
- [ ] Empty data array shows appropriate message
- [ ] Single market data still renders correctly

### Division Safety

- [ ] No division by zero errors in console
- [ ] Variance calculations handle null denominators
- [ ] `safeDiv()` function used for all divisions

### Format Correctness

- [ ] Currency values: "$125.4M", "$52.3K", "$287"
- [ ] Member counts: "456.7K", "1.2M"
- [ ] Percentages: "23.4%", "0.5%"
- [ ] Variance: "▲ +12.3%", "▼ -5.2%", "▲ +2.1pp"

---

## Code Quality

### Pattern Compliance

- [ ] CSS uses variables from DESIGN_TOKENS.css
- [ ] No hardcoded colors (check: no `#` in CSS except variables)
- [ ] Function names match patterns in CODE_PATTERNS.js
- [ ] State object structure matches specification
- [ ] IIFE wrapper used (no global variables)
- [ ] **No hardcoded dimension arrays** (no `const MARKETS = [...]`, `const BRANDS = [...]`)
- [ ] **`getUniqueDimensionValues()` utility exists and is used**
- [ ] All dropdowns populated from data, not hardcoded lists

### No Forbidden Elements

- [ ] No React/Vue/Angular imports
- [ ] No D3.js or Chart.js
- [ ] No jQuery
- [ ] No ES modules (no `import`/`export`)
- [ ] No localStorage/sessionStorage
- [ ] No external API calls

### Error Handling

- [ ] No uncaught errors in console during normal use
- [ ] File upload errors show user-friendly message
- [ ] Parse errors don't crash the app

---

## Browser Testing

- [ ] Chrome: renders correctly
- [ ] Firefox: renders correctly
- [ ] Safari: renders correctly (if available)
- [ ] No console errors in any browser

---

## Performance

- [ ] Initial render < 1 second (with data loaded)
- [ ] Tab switch < 200ms
- [ ] Filter change < 200ms
- [ ] No visible lag on interactions

---

## Final Verification

After all above pass:

1. **Load sample data** (metrics_main.csv)
2. **Navigate all tabs** — each should render without error
3. **Change all filters** — verify data updates correctly
4. **Toggle comparison mode** — verify badges update
5. **Check insights** — verify they reflect actual data
6. **Hover over chart** — verify tooltip appears
7. **Open browser console** — verify no errors

---

## Sign-Off

When ready to submit:

```
✅ VALIDATION COMPLETE

Phases completed: [1] [2] [3] [4]
Edge cases tested: Yes / No
Code quality verified: Yes / No
Browser tested: Chrome / Firefox / Safari

Known limitations:
- [List any features not implemented]
- [List any known issues]

Ready for review: Yes / No
```
