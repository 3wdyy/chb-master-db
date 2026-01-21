# Architecture Specification

## Technology Stack

| Layer | Technology | Constraint |
|-------|------------|------------|
| Structure | HTML5 | Semantic markup |
| Styling | CSS3 | No preprocessors, use CSS variables |
| Logic | Vanilla JavaScript ES6+ | No frameworks (React, Vue, etc.) |
| Excel Parsing | SheetJS 0.18.5 | Already included in reference |
| Charts | SVG | Hand-coded, no chart libraries |

## Forbidden Technologies

```
❌ React, Vue, Angular, Svelte
❌ D3.js, Chart.js, Highcharts
❌ jQuery
❌ Tailwind, Bootstrap
❌ ES Modules (use IIFE pattern)
❌ localStorage, sessionStorage (not supported)
❌ External APIs (except file upload)
```

## State Management

### State Object Structure

```javascript
const state = {
    // === DASHBOARD MODE (NEW) ===
    dashboardMode: 'C-OVERVIEW',     // 'C-OVERVIEW' | 'M-DEPTH'
    comparisonMode: 'LYTD',          // 'LYTD' | 'Target' | 'LMR12M'
    activeTab: 'scorecard',          // 'scorecard' | 'markets' | 'trends'
    insightsPanelExpanded: true,
    
    // === DATA MODE (EXISTING - preserve) ===
    mode: 'MUSE',                    // 'MUSE' | 'MC'
    dataLoaded: false,
    
    // === MUSE DATA (EXISTING - preserve) ===
    museData: null,                  // Parsed metrics_main data
    museTrendData: null,             // Parsed metrics_trend data (NEW)
    
    // === FILTERS (EXISTING - preserve) ===
    selectedMonth: null,             // e.g., '12 - Dec'
    selectedMarket: 'All Markets',
    selectedKPI: 'SLS_TTL',
    
    // === MC DATA (EXISTING - preserve) ===
    mcData: null
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

// ❌ WRONG: Direct DOM manipulation without state
function setDashboardMode(mode) {
    document.querySelector('.tab').classList.add('active');
}
```

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
│                    ┌──────────────┴──────────────┐                          │
│                    ▼                              ▼                          │
│           ┌──────────────┐              ┌──────────────┐                    │
│           │  MUSE Mode   │              │   MC Mode    │                    │
│           └──────────────┘              └──────────────┘                    │
│                    │                              │                          │
│                    ▼                              ▼                          │
│           state.museData = data         state.mcData = data                 │
│           state.dataLoaded = true       state.dataLoaded = true             │
│                    │                              │                          │
│                    └──────────────┬──────────────┘                          │
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

## File Organization

All code lives in a single HTML file, organized in this order:

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
    <!-- Body is empty; render() populates it -->
    
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
    <script>
    (function() {
        'use strict';
        
        // ========================================
        // 1. CONSTANTS
        // ========================================
        const KPI_CONFIG = { /* ... */ };
        const INSIGHT_RULES = [ /* ... */ ];
        
        // ========================================
        // 2. STATE
        // ========================================
        const state = { /* ... */ };
        
        // ========================================
        // 3. UTILITY FUNCTIONS
        // ========================================
        function formatValue(value, format) { /* ... */ }
        function formatChange(value, format) { /* ... */ }
        function safeDiv(a, b, fallback = 0) { /* ... */ }
        
        // ========================================
        // 4. DATA FUNCTIONS
        // ========================================
        function parseCSV(text) { /* ... */ }
        function parseExcel(workbook) { /* ... */ }
        function filterData(data, filters) { /* ... */ }
        
        // ========================================
        // 5. INSIGHT ENGINE
        // ========================================
        function generateInsights(data) { /* ... */ }
        
        // ========================================
        // 6. CHART FUNCTIONS
        // ========================================
        function renderTrendChart(container, data) { /* ... */ }
        function renderHeatmap(container, data) { /* ... */ }
        
        // ========================================
        // 7. RENDER FUNCTIONS
        // ========================================
        function render() { /* ... */ }
        function renderHeader() { /* ... */ }
        function renderFilters() { /* ... */ }
        function renderScorecard() { /* ... */ }
        function renderMarkets() { /* ... */ }
        function renderTrends() { /* ... */ }
        
        // ========================================
        // 8. EVENT HANDLERS
        // ========================================
        function handleFileUpload(e) { /* ... */ }
        function handleModeToggle(mode) { /* ... */ }
        function handleTabClick(tab) { /* ... */ }
        
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

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Single file vs modules | Single HTML | Simpler deployment, no build step |
| State management | Plain object + render() | Matches existing pattern |
| Charts | Hand-coded SVG | No external dependencies |
| CSS approach | Variables + BEM-lite | Matches existing codebase |
| Data loading | File upload only (P1) | Google Sheets is P2 |

## Error Handling Pattern

```javascript
// ✅ CORRECT: Defensive coding
function getVariance(row, mode) {
    if (!row) return null;
    
    switch (mode) {
        case 'LYTD':
            return row.vs_LYTD ?? null;
        case 'Target':
            return row.vs_Target ?? null;
        case 'LMR12M':
            return row.vs_LMR12M ?? null;
        default:
            return null;
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

## Browser Support

| Browser | Minimum Version |
|---------|-----------------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

**Not supported**: Internet Explorer (any version)
