# Anti-Patterns

> **PURPOSE**: Explicit examples of what NOT to do.
> These patterns cause bugs, reduce quality, or break functionality.

---

## ❌ DO NOT: Hardcode Dimension Values

**This is the #1 mistake. Brands, markets, channels must come from data.**

**Wrong:**
```javascript
const MARKETS = ['All Markets', 'UAE', 'Saudi Arabia', 'Kuwait', 'Bahrain'];
const BRANDS = ['Level Shoes', 'Faces', 'Swarovski', 'Maison', 'Aigner'];
const CHANNELS = ['INSTORE', 'ECOMMERCE'];

// Then using these arrays to render dropdowns or bars
markets.forEach(market => { ... });
```

**Right:**
```javascript
// Extract from actual data at runtime
function getUniqueDimensionValues(data, dimension) {
    return [...new Set(data.map(row => row[dimension]))]
        .filter(v => v !== null && v !== undefined && v !== '')
        .sort();
}

// Usage
const markets = getUniqueDimensionValues(state.museData, 'Market');
const brands = getUniqueDimensionValues(state.dimensionalData, 'Brand');

// Now the dashboard works with ANY data file
```

**Why this matters**: The dashboard must work regardless of which markets or brands exist in the uploaded file. New markets or brands should appear automatically.

---

## ❌ DO NOT: Keep MC Mode Code

**The existing Dashboard.html has ~47 lines of MC mode code. Remove ALL of it.**

**What to remove:**
```javascript
// DELETE these patterns from Dashboard.html:

mode: 'MUSE',                    // Remove from state object
mcData: null,                    // Remove from state object
if (state.mode === 'MC') {...}   // Remove entire conditional blocks
MC_KPI_CONFIG                    // Remove entire config object
renderModeSelector()             // Remove function entirely
handleModeToggle()               // Remove or repurpose for C-Overview/M-Depth
```

**State object transformation:**
```javascript
// ❌ OLD (Dashboard.html)
const state = {
    mode: 'MUSE',
    mcData: null,
    museData: null,
    // ...
};

// ✅ NEW (your implementation)
const state = {
    dashboardMode: 'C-OVERVIEW',  // New: view mode toggle
    comparisonMode: 'LYTD',       // New: comparison toggle
    museData: null,                // Keep: MUSE data only
    // ... (no MC references)
};
```

**Why this matters**: MC mode adds complexity, conditionals, and a second data path that isn't used. Removing it simplifies the codebase and reduces bugs.

---

## ❌ DO NOT: Rebuild from Scratch

**Wrong:**
```html
<!DOCTYPE html>
<html>
<head>
    <title>My New Dashboard</title>
    <!-- Starting completely fresh -->
</head>
```

**Right:**
```html
<!-- Extend the existing Dashboard.html -->
<!-- Add new functions alongside existing ones -->
<!-- Preserve all existing functionality -->
```

---

## ❌ DO NOT: Use Hardcoded Colors

**Wrong:**
```css
.hero-card {
    background: #ffffff;
    color: #1B365D;
    border: 1px solid #E2E8F0;
}
```

**Right:**
```css
.hero-card {
    background: var(--white);
    color: var(--text-dark);
    border: 1px solid var(--border-light);
}
```

---

## ❌ DO NOT: Skip Null Checks

**Wrong:**
```javascript
function formatValue(value, format) {
    return '$' + value.toFixed(2);  // Crashes on null
}
```

**Right:**
```javascript
function formatValue(value, format) {
    if (value === null || value === undefined || Number.isNaN(value)) {
        return '—';
    }
    return '$' + value.toFixed(2);
}
```

---

## ❌ DO NOT: Use Unsafe Division

**Wrong:**
```javascript
const average = total / count;  // Division by zero if count=0
const pct = part / whole * 100;
```

**Right:**
```javascript
const average = safeDiv(total, count, 0);
const pct = safeDiv(part, whole, 0) * 100;

function safeDiv(numerator, denominator, fallback = 0) {
    if (!denominator || denominator === 0) return fallback;
    return numerator / denominator;
}
```

---

## ❌ DO NOT: Use External Libraries

**Wrong:**
```html
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="https://d3js.org/d3.v7.min.js"></script>
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
```

**Right:**
```html
<!-- Only SheetJS is allowed (already included) -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
<!-- Build charts with vanilla SVG -->
```

---

## ❌ DO NOT: Use React/Vue Syntax

**Wrong:**
```javascript
function HeroCard({ kpi, value, variance }) {
    return (
        <div className="hero-card">
            <span>{value}</span>
        </div>
    );
}
```

**Right:**
```javascript
function renderHeroCard(kpi, value, variance) {
    return `
        <div class="hero-card">
            <span>${value}</span>
        </div>
    `;
}
```

---

## ❌ DO NOT: Use ES Modules

**Wrong:**
```javascript
import { formatValue } from './utils.js';
export function render() { }
```

**Right:**
```javascript
(function() {
    'use strict';
    
    function formatValue() { }
    function render() { }
    
    // Everything inside IIFE, no exports
})();
```

---

## ❌ DO NOT: Use localStorage

**Wrong:**
```javascript
localStorage.setItem('selectedMonth', month);
const saved = localStorage.getItem('selectedMonth');
```

**Right:**
```javascript
// Use state object only
state.selectedMonth = month;
render();
```

---

## ❌ DO NOT: Directly Manipulate DOM

**Wrong:**
```javascript
function handleTabClick(tab) {
    document.querySelector('.tab.active').classList.remove('active');
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    document.querySelector('.content').innerHTML = renderContent(tab);
}
```

**Right:**
```javascript
function handleTabClick(tab) {
    state.activeTab = tab;
    render();  // Re-render entire UI from state
}
```

---

## ❌ DO NOT: Invent New Naming Conventions

**Wrong:**
```javascript
const appState = {
    currentMode: 'overview',
    activeView: 'scorecard',
    selectedPeriod: 'december'
};

function updateCurrentMode(newMode) { }
function switchView(viewName) { }
```

**Right:**
```javascript
const state = {
    dashboardMode: 'C-OVERVIEW',
    activeTab: 'scorecard',
    selectedMonth: '12 - Dec'
};

function handleModeToggle(mode) { }
function handleTabClick(tab) { }
```

---

## ❌ DO NOT: Create Separate Files

**Wrong:**
```
dashboard/
├── index.html
├── styles.css
├── utils.js
├── charts.js
├── components/
│   ├── HeroCard.js
│   └── Table.js
```

**Right:**
```
dashboard/
└── Dashboard.html  (single file with everything)
```

---

## ❌ DO NOT: Add Unrequested Features

**Wrong:**
```javascript
// "I also added a dark mode toggle since it would be nice"
function toggleDarkMode() { }

// "I added print functionality"
function handlePrint() { }

// "I made it auto-refresh every 30 seconds"
setInterval(refresh, 30000);
```

**Right:**
```javascript
// Only implement what is specified in C_OVERVIEW.md
// If you think a feature would help, ASK first
```

---

## ❌ DO NOT: Skip the Planning Phase

**Wrong:**
```
User: "Build the scorecard tab"
AI: "Here's the complete code for the scorecard tab:
     [500 lines of code]"
```

**Right:**
```
User: "Build the scorecard tab"
AI: "Here's my implementation plan for the scorecard tab:

     1. I'll add these functions:
        - renderScorecard()
        - renderHeroCards()
        - renderInsightsPanel()
        - renderKPITable()
     
     2. I'll modify these existing functions:
        - render() - add case for 'scorecard' tab
        - attachEventListeners() - add comparison toggle handler
     
     3. I'll add these CSS classes:
        - .hero-cards, .hero-card, .hero-card-label, etc.
     
     Questions:
     - Should the insights panel be collapsible?
     - Should table rows be clickable?
     
     Does this plan look correct?"
```

---

## ❌ DO NOT: Ignore Existing Functionality

**Wrong:**
```javascript
function render() {
    // Completely rewrote render, removed MUSE/MC toggle
    document.body.innerHTML = renderNewDashboard();
}
```

**Right:**
```javascript
function render() {
    // Preserve existing functionality (but REMOVE MC mode code)
    document.body.innerHTML = `
        ${renderHeader()}
        ${renderFilters()}
        ${renderContent()}        <!-- Add new tabs here -->
    `;
}
```

---

## ❌ DO NOT: Use Magic Numbers

**Wrong:**
```javascript
if (variance > 0.02) return 'positive';
if (variance < -0.05) return 'negative';
const barWidth = value / 125000000 * 100;
```

**Right:**
```javascript
const THRESHOLDS = {
    POSITIVE: 0.02,
    NEGATIVE: -0.05
};

if (variance > THRESHOLDS.POSITIVE) return 'positive';
if (variance < THRESHOLDS.NEGATIVE) return 'negative';

const maxValue = Math.max(...values);
const barWidth = (value / maxValue) * 100;
```

---

## ❌ DO NOT: Output Incomplete Code

**Wrong:**
```javascript
function renderTrendChart(data) {
    // TODO: implement SVG chart
    return '<div>Chart goes here</div>';
}
```

**Right:**
```javascript
function renderTrendChart(data) {
    const points = calculateChartPoints(data);
    const { yMin, yMax } = calculateYAxisRange(points);
    
    return `
        <svg class="trend-chart" viewBox="0 0 800 400">
            ${renderChartGrid(yMin, yMax)}
            ${renderChartAxes(yMin, yMax)}
            ${renderChartLines(points, yMin, yMax)}
            ${renderChartDots(points, yMin, yMax)}
            ${renderChartLegend()}
        </svg>
    `;
}
```

---

## Summary

| Anti-Pattern | Why It's Bad |
|--------------|--------------|
| Rebuild from scratch | Loses existing functionality |
| Hardcoded colors | Inconsistent with design system |
| Skip null checks | Runtime crashes |
| Unsafe division | Division by zero errors |
| External libraries | Adds dependencies, changes architecture |
| React/Vue syntax | Won't work in vanilla JS |
| ES modules | Not supported in single-file architecture |
| localStorage | Not supported in artifacts environment |
| Direct DOM manipulation | Breaks state-based rendering |
| New naming conventions | Inconsistent with existing code |
| Separate files | Adds complexity, not needed for P1 |
| Unrequested features | Scope creep, maintenance burden |
| Skip planning | Lower quality, more bugs |
| Ignore existing | Breaks backward compatibility |
| Magic numbers | Hard to maintain |
| Incomplete code | Not production ready |
