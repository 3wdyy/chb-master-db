# Architecture Specification

## Technology Stack

| Layer | Technology | Constraint |
|-------|------------|------------|
| Structure | HTML5 | Semantic markup |
| Styling | CSS3 | No preprocessors, use CSS variables only |
| Logic | Vanilla JavaScript ES6+ | No frameworks |
| Excel Parsing | SheetJS 0.18.5 | Already included in Dashboard.html |
| Charts | SVG | Hand-coded, no chart libraries |

## Forbidden Technologies

```
❌ React, Vue, Angular, Svelte
❌ D3.js, Chart.js, Highcharts
❌ jQuery
❌ Tailwind, Bootstrap
❌ ES Modules (use IIFE pattern)
❌ localStorage, sessionStorage (not supported in artifacts)
❌ External APIs (except file upload)
❌ MC mode — this is MUSE-only
```

---

## State Management

### State Object Structure

```javascript
const state = {
    // === DASHBOARD MODE ===
    dashboardMode: 'C-OVERVIEW',     // 'C-OVERVIEW' | 'M-DEPTH'
    comparisonMode: 'LYTD',          // 'LYTD' | 'Target' | 'LMR12M'
    activeTab: 'scorecard',          // P1: 'scorecard' | 'markets' | 'trends'
    insightsPanelExpanded: true,
    
    // === DATA STATE ===
    dataLoaded: false,
    museData: null,                  // Parsed metrics_main data
    museTrendData: null,             // Parsed metrics_trend data
    
    // === FILTERS ===
    selectedMonth: null,             // e.g., '12 - Dec'
    selectedMarket: 'All Markets',   // Extracted from data, not hardcoded
    selectedKPI: 'SLS_TTL',
    
    // === P2 ADDITIONS (when implementing M-Depth) ===
    // drillPath: [],
    // explorerKPI: 'SLS_TTL',
    // selectedBrand: null,
    // dimensionalData: null,
    // crossbrandData: null
};
```

### State Update Pattern

```javascript
// ✅ CORRECT: Update state then re-render
function setDashboardMode(mode) {
    state.dashboardMode = mode;
    state.activeTab = mode === 'C-OVERVIEW' ? 'scorecard' : 'explorer';
    render();
}

// ✅ CORRECT: Filters update state and trigger re-render
function handleMonthChange(month) {
    state.selectedMonth = month;
    render();
}

// ❌ WRONG: Direct DOM manipulation without state
function setDashboardMode(mode) {
    document.querySelector('.tab').classList.add('active');  // BAD
}
```

---

## Application Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FILE UPLOAD                                    │
│                                   │                                         │
│                                   ▼                                         │
│                          ┌───────────────┐                                  │
│                          │  parseData()  │                                  │
│                          └───────────────┘                                  │
│                                   │                                         │
│                                   ▼                                         │
│                    state.museData = parsed data                             │
│                    state.selectedMonth = getLatestMonth(data)               │
│                    state.dataLoaded = true                                  │
│                                   │                                         │
│                                   ▼                                         │
│                          ┌───────────────┐                                  │
│                          │    render()   │                                  │
│                          └───────────────┘                                  │
│                                   │                                         │
│              ┌────────────────────┼────────────────────┐                    │
│              ▼                    ▼                    ▼                    │
│    ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐          │
│    │  renderHeader()  │ │  renderFilters() │ │  renderContent() │          │
│    └──────────────────┘ └──────────────────┘ └──────────────────┘          │
│                                                        │                    │
│                           ┌────────────────────────────┤                    │
│                           │ Based on state.activeTab   │                    │
│              ┌────────────┴────────────┬───────────────┴────────┐          │
│              ▼                         ▼                        ▼          │
│    ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐   │
│    │ renderScorecard()│    │ renderMarkets()  │    │  renderTrends()  │   │
│    └──────────────────┘    └──────────────────┘    └──────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## File Organization

All code lives in a **single HTML file**, organized in this order:

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        /* ========================================
           1. CSS VARIABLES (from DESIGN_TOKENS.css)
           2. BASE STYLES (existing)
           3. COMPONENT STYLES (existing + new)
           ======================================== */
    </style>
</head>
<body>
    <!-- Body starts empty; render() populates it -->
    
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
    <script>
    (function() {
        'use strict';
        
        // ========================================
        // 1. CONSTANTS (KPI_CONFIG, etc.)
        // ========================================
        
        // ========================================
        // 2. STATE
        // ========================================
        
        // ========================================
        // 3. UTILITY FUNCTIONS
        //    formatValue(), formatChange(), safeDiv()
        //    getUniqueDimensionValues() ← CRITICAL
        // ========================================
        
        // ========================================
        // 4. DATA FUNCTIONS
        //    parseCSV(), filterData(), getKPIRow()
        // ========================================
        
        // ========================================
        // 5. INSIGHT ENGINE
        //    INSIGHT_RULES[], generateInsights()
        // ========================================
        
        // ========================================
        // 6. CHART FUNCTIONS
        //    renderTrendChart(), renderHeatmap()
        // ========================================
        
        // ========================================
        // 7. RENDER FUNCTIONS
        //    render(), renderHeader(), renderFilters()
        //    renderScorecard(), renderMarkets(), renderTrends()
        // ========================================
        
        // ========================================
        // 8. EVENT HANDLERS
        //    handleFileUpload(), handleModeToggle()
        //    handleTabClick(), handleMonthChange()
        // ========================================
        
        // ========================================
        // 9. INITIALIZATION
        // ========================================
        document.addEventListener('DOMContentLoaded', init);
        function init() { render(); }
        
    })();
    </script>
</body>
</html>
```

---

## Dynamic Dimension Extraction (Critical Pattern)

**All dimension values must be extracted from data at runtime.**

```javascript
// ✅ CORRECT: Extract from data
function getUniqueDimensionValues(data, dimension) {
    return [...new Set(data.map(row => row[dimension]))]
        .filter(v => v !== null && v !== undefined && v !== '')
        .sort();
}

// Usage
const markets = getUniqueDimensionValues(state.museData, 'Market');
const brands = getUniqueDimensionValues(state.dimensionalData, 'Brand');

// ❌ WRONG: Hardcoded lists
const MARKETS = ['All Markets', 'UAE', 'Saudi Arabia', ...];
```

---

## Error Handling Pattern

```javascript
// ✅ CORRECT: Defensive coding
function getVariance(row, mode) {
    if (!row) return null;
    
    switch (mode) {
        case 'LYTD': return row.vs_LYTD ?? null;
        case 'Target': return row.vs_Target ?? null;
        case 'LMR12M': return row.vs_LMR12M ?? null;
        default: return null;
    }
}

// ✅ CORRECT: Null-safe formatting
function formatValue(value, format) {
    if (value === null || value === undefined || Number.isNaN(value)) {
        return '—';
    }
    // ... formatting logic
}

// ✅ CORRECT: Safe division
function safeDiv(numerator, denominator, fallback = 0) {
    if (!denominator || denominator === 0 || Number.isNaN(denominator)) {
        return fallback;
    }
    return numerator / denominator;
}
```

---

## Browser Support

| Browser | Minimum Version |
|---------|-----------------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

**Not supported**: Internet Explorer (any version)

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Initial render (with data) | < 1 second |
| Tab switch | < 200ms |
| Filter change | < 200ms |
| Insight generation | < 100ms |

---

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Single file vs modules | Single HTML | Simpler deployment, no build step |
| State management | Plain object + render() | Matches existing pattern |
| Charts | Hand-coded SVG | No external dependencies |
| CSS approach | Variables + BEM-lite | Matches existing codebase |
| Data loading | File upload (P1) | Google Sheets is P2 enhancement |
| Data mode | MUSE only | Remove all MC mode code |
| Dimensions | Dynamic extraction | Never hardcode markets/brands |
