# C-Overview Mode Specification

## Overview

C-Overview mode serves **C-suite executives** who need:
- Answers in < 5 seconds
- Red/green status at a glance  
- Auto-generated insights
- Maximum 2 clicks to any answer

## Tab Structure

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [Scorecard]  [Markets]  [Trends]                                         │
└──────────────────────────────────────────────────────────────────────────┘
```

## Tab 1: Executive Scorecard

### Layout

```
┌──────────────────────────────────────────────────────────────────────────┐
│  FILTERS: [Month ▼] [Compare: vs LY ▼] [Market ▼]                        │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐         │
│  │ TOTAL SALES│  │  MEMBERS   │  │CROSS BRAND │  │PENETRATION │         │
│  │  $125.4M   │  │   456.7K   │  │   23.4%    │  │   18.2%    │         │
│  │  ▲ +12.3%  │  │  ▲ +8.1%   │  │  ▲ +2.1pp  │  │  ▼ -0.8pp  │         │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘         │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ 📊 KEY INSIGHTS                                                   │   │
│  │ 🔴 Saudi Arabia sales 9.2% below target                          │   │
│  │ 🟢 UAE cross-brand rate at 28.3% — all-time high                 │   │
│  │ 🟡 Kuwait engagement flat — monitor next month                   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ KPI              │ YTD      │ Target  │ vs Tgt  │ LYTD    │ vs LY │   │
│  │ ─────────────────┼──────────┼─────────┼─────────┼─────────┼────── │   │
│  │ Total Sales      │ $125.4M  │ $130M   │ -3.5%   │ $111.7M │+12.3% │   │
│  │ Members          │ 456.7K   │ 500K    │ -8.7%   │ 422.5K  │ +8.1% │   │
│  │ ...              │ ...      │ ...     │ ...     │ ...     │ ...   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### Component: Hero Cards

**Quantity**: 4 cards

**KPIs** (in order):
| Position | Key | Name | Format |
|----------|-----|------|--------|
| 1 | SLS_TTL | Total Sales | C0 (currency, no decimals) |
| 2 | MBR_TTL | Transacting Members | V0 (value, no decimals) |
| 3 | PCT_XBP | Cross Brand Plus % | P4 (percent, 4 decimals → display as XX.X%) |
| 4 | SLS_PEN | Sales Penetration | P4 |

**HTML Structure**:
```html
<div class="hero-cards">
    <div class="hero-card">
        <div class="hero-card-label">TOTAL SALES</div>
        <div class="hero-card-value">$125.4M</div>
        <div class="hero-card-badge positive">▲ +12.3% vs LY</div>
        <div class="hero-card-secondary">Target: $130M</div>
    </div>
    <!-- ... 3 more cards -->
</div>
```

**Badge Logic**:
```javascript
function getCardBadgeClass(variance, format) {
    if (variance === null || variance === undefined) return 'neutral';
    
    // Percentage point metrics (format P*)
    if (format && format.startsWith('P')) {
        if (variance > 0.005) return 'positive';   // > +0.5pp
        if (variance < -0.005) return 'negative';  // < -0.5pp
        return 'neutral';
    }
    
    // Percentage change metrics
    if (variance > 0.02) return 'positive';    // > +2%
    if (variance < -0.02) return 'negative';   // < -2%
    return 'neutral';
}
```

### Component: Insights Panel

**Data Flow**:
```
metrics_main.csv → filter(latestMonth) → INSIGHT_RULES → sort → display(top 5)
```

**HTML Structure**:
```html
<div class="insights-panel" data-expanded="true">
    <div class="insights-header">
        <span class="insights-title">📊 KEY INSIGHTS</span>
        <button class="insights-toggle">Hide</button>
    </div>
    <div class="insights-body">
        <div class="insight-row critical">
            <span class="insight-icon">🔴</span>
            <span class="insight-text">Saudi Arabia sales 9.2% below target — requires attention</span>
        </div>
        <!-- ... more insights -->
    </div>
</div>
```

**Rules**: See `patterns/INSIGHTS_ENGINE.js` for complete rule set

### Component: KPI Table

**Columns**:
| Column | Data Source | Width |
|--------|-------------|-------|
| KPI | row.KPI | 200px |
| YTD | formatValue(row.YTD, row.Format) | 120px |
| Target | formatValue(row.Target, row.Format) | 120px |
| vs Target | formatChange(row.vs_Target) | 100px |
| LYTD | formatValue(row.LYTD, row.Format) | 120px |
| vs LY | formatChange(row.vs_LYTD) | 100px |

**KPIs to Display** (in this order):
```javascript
const SCORECARD_KPIS = [
    'SLS_TTL',  // Total Sales
    'SLS_PEN',  // Sales Penetration
    'MBR_TTL',  // Transacting Members
    'MBR_NEW',  // New Members
    'MBR_RTN',  // Returning Members
    'AVG_ATF',  // Average Frequency
    'AVG_AOV',  // Average Order Value
    'PCT_RDM',  // Redeeming Members %
    'PCT_XBP',  // Cross Brand Plus %
    'PCT_NBA',  // New Brand Adopters %
    'AVG_BRD',  // Avg Brands Shopped
    'PTS_BRN'   // Points Burned Value
];
```

**Row Highlighting**:
```javascript
function getRowClass(row, comparisonMode) {
    const variance = getVariance(row, comparisonMode);
    if (variance === null) return '';
    if (variance >= 0) return 'row-positive';
    if (variance >= -0.05) return 'row-warning';
    return 'row-negative';
}
```

---

## Tab 2: Market Performance

### Layout

```
┌──────────────────────────────────────────────────────────────────────────┐
│  FILTERS: [KPI: Total Sales ▼]                                           │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  MARKET COMPARISON                                                       │
│  ──────────────────────────────────────────────────────────────────────  │
│  UAE        ████████████████████████████████  $52.3M  ▲ +15.7%           │
│  KSA        █████████████████████████         $38.1M  ▼ -5.2%            │
│  Kuwait     ████████████████                  $21.5M  ▲ +8.0%            │
│  Bahrain    █████████                         $13.5M  ▲ +112.1%          │
│                                                                          │
│  PERFORMANCE MATRIX                                                      │
│  ──────────────────────────────────────────────────────────────────────  │
│               │  UAE   │   KSA   │  Kuwait │ Bahrain │                   │
│  ─────────────┼────────┼─────────┼─────────┼─────────┤                   │
│  Sales        │   🟢   │    🔴   │   🟡    │   🟢    │                   │
│  Members      │   🟢   │    🟡   │   🟢    │   🟢    │                   │
│  Cross Brand  │   🟢   │    🔴   │   🟡    │   🟢    │                   │
│  Redemption   │   🟡   │    🟡   │   🟢    │   🔴    │                   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### Component: Market Comparison Bars

**Data Preparation**:
```javascript
function prepareMarketBars(data, kpiKey) {
    // Filter to specific KPI, exclude "All Markets"
    const markets = data
        .filter(row => row.Key === kpiKey && row.Market !== 'All Markets')
        .sort((a, b) => b.YTD - a.YTD);  // Descending by value
    
    // Calculate bar widths (largest = 100%)
    const maxValue = markets[0]?.YTD || 1;
    
    return markets.map(row => ({
        market: row.Market,
        value: row.YTD,
        variance: row.vs_LYTD,
        format: row.Format,
        barWidth: (row.YTD / maxValue) * 100
    }));
}
```

**HTML Structure**:
```html
<div class="market-bars">
    <div class="market-bar-row">
        <div class="market-bar-label">UAE</div>
        <div class="market-bar-container">
            <div class="market-bar-fill" style="width: 100%"></div>
        </div>
        <div class="market-bar-value">$52.3M</div>
        <div class="market-bar-badge positive">▲ +15.7%</div>
    </div>
    <!-- ... more rows -->
</div>
```

### Component: Performance Heatmap

**Rows** (KPIs):
```javascript
const HEATMAP_KPIS = [
    { key: 'SLS_TTL', label: 'Total Sales' },
    { key: 'MBR_TTL', label: 'Members' },
    { key: 'PCT_XBP', label: 'Cross Brand %' },
    { key: 'PCT_RDM', label: 'Redemption %' }
];
```

**Columns** (Markets):
```javascript
const HEATMAP_MARKETS = [
    'United Arab Emirates',
    'Saudi Arabia', 
    'Kuwait',
    'Bahrain'
];
```

**Cell Color Logic** (based on vs_Target):
```javascript
function getHeatmapCellClass(vsTarget) {
    if (vsTarget === null || vsTarget === undefined) return 'heatmap-neutral';
    if (vsTarget >= 0) return 'heatmap-positive';
    if (vsTarget >= -0.05) return 'heatmap-warning';
    return 'heatmap-negative';
}
```

**HTML Structure**:
```html
<table class="heatmap-table">
    <thead>
        <tr>
            <th></th>
            <th>UAE</th>
            <th>KSA</th>
            <th>Kuwait</th>
            <th>Bahrain</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td class="heatmap-row-label">Total Sales</td>
            <td class="heatmap-cell heatmap-positive" title="UAE - Total Sales&#10;YTD: $52.3M&#10;vs Target: +2.3%">
                <span class="heatmap-indicator">●</span>
            </td>
            <!-- ... more cells -->
        </tr>
        <!-- ... more rows -->
    </tbody>
</table>
```

---

## Tab 3: Trends

### Layout

```
┌──────────────────────────────────────────────────────────────────────────┐
│  FILTERS: [KPI: Total Sales ▼] [Market: All Markets ▼]                   │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  MONTHLY TREND                                                           │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │    $M                                                               │  │
│  │  14 ┤                                        ●───● 2025            │  │
│  │  12 ┤                              ●────●────●   ○───○ 2024        │  │
│  │  10 ┤                    ●────●────●             - - - Target      │  │
│  │   8 ┤          ●────●────●                                         │  │
│  │   6 ┤    ●────●                                                    │  │
│  │   4 ┤────●                                                         │  │
│  │     └────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────  │  │
│  │         Jan  Feb  Mar  Apr  May  Jun  Jul  Aug  Sep  Oct  Nov  Dec │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  YTD CUMULATIVE                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │  [Same chart structure but cumulative values]                       │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### Component: Trend Line Chart

**Data Source**: metrics_trend.csv

**Lines**:
| Line | Data | Style | Color Variable |
|------|------|-------|----------------|
| Current Year | M01_YTD...M12_YTD | Solid, 3px | --steel-blue |
| Last Year | M01_LYTD...M12_LYTD | Dashed, 2px | --text-muted |
| Target | M01_Target...M12_Target | Dotted, 2px | --navy |

**SVG Structure**:
```html
<svg class="trend-chart" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
    <!-- Background grid -->
    <g class="chart-grid">
        <line class="grid-line" x1="50" y1="50" x2="750" y2="50"/>
        <!-- ... more horizontal lines -->
    </g>
    
    <!-- Y-axis -->
    <g class="chart-y-axis">
        <text x="40" y="55" class="axis-label">$14M</text>
        <text x="40" y="105" class="axis-label">$12M</text>
        <!-- ... more labels -->
    </g>
    
    <!-- X-axis -->
    <g class="chart-x-axis">
        <text x="80" y="380" class="axis-label">Jan</text>
        <text x="140" y="380" class="axis-label">Feb</text>
        <!-- ... more labels -->
    </g>
    
    <!-- Data lines -->
    <path class="chart-line chart-line-current" 
          d="M 80,300 L 140,280 L 200,250 ..." 
          fill="none" 
          stroke="var(--steel-blue)" 
          stroke-width="3"/>
    
    <path class="chart-line chart-line-lastyear" 
          d="M 80,320 L 140,300 L 200,280 ..." 
          fill="none" 
          stroke="var(--text-muted)" 
          stroke-width="2"
          stroke-dasharray="8,4"/>
    
    <path class="chart-line chart-line-target" 
          d="M 80,310 L 140,290 L 200,270 ..." 
          fill="none" 
          stroke="var(--navy)" 
          stroke-width="2"
          stroke-dasharray="4,4"/>
    
    <!-- Interactive dots (current year only) -->
    <g class="chart-dots">
        <circle class="chart-dot" cx="80" cy="300" r="6" 
                data-month="Jan" data-value="8500000" data-ly="7800000" data-target="9000000"/>
        <!-- ... more dots -->
    </g>
    
    <!-- Legend -->
    <g class="chart-legend" transform="translate(600, 30)">
        <line x1="0" y1="0" x2="20" y2="0" stroke="var(--steel-blue)" stroke-width="3"/>
        <text x="25" y="4" class="legend-label">2025</text>
        
        <line x1="0" y1="20" x2="20" y2="20" stroke="var(--text-muted)" stroke-width="2" stroke-dasharray="8,4"/>
        <text x="25" y="24" class="legend-label">2024</text>
        
        <line x1="0" y1="40" x2="20" y2="40" stroke="var(--navy)" stroke-width="2" stroke-dasharray="4,4"/>
        <text x="25" y="44" class="legend-label">Target</text>
    </g>
</svg>
```

**Tooltip**:
```html
<div class="chart-tooltip" style="display: none;">
    <div class="tooltip-month">November</div>
    <div class="tooltip-row">
        <span class="tooltip-label">2025:</span>
        <span class="tooltip-value">$157.2M</span>
    </div>
    <div class="tooltip-row">
        <span class="tooltip-label">2024:</span>
        <span class="tooltip-value">$141.2M</span>
    </div>
    <div class="tooltip-row">
        <span class="tooltip-label">Target:</span>
        <span class="tooltip-value">$158.0M</span>
    </div>
</svg>
```

**Chart Calculation Logic**:
```javascript
function calculateChartPoints(data, kpiKey, market) {
    const row = data.find(r => r.Key === kpiKey && r.Market === market);
    if (!row) return null;
    
    const months = ['M01', 'M02', 'M03', 'M04', 'M05', 'M06', 
                    'M07', 'M08', 'M09', 'M10', 'M11', 'M12'];
    
    const values = {
        current: months.map(m => row[`${m}_YTD`]),
        lastYear: months.map(m => row[`${m}_LYTD`]),
        target: months.map(m => row[`${m}_Target`])
    };
    
    // Find Y-axis range
    const allValues = [...values.current, ...values.lastYear, ...values.target]
        .filter(v => v !== null && v !== undefined);
    const maxValue = Math.max(...allValues);
    const minValue = Math.min(...allValues);
    
    // Add padding
    const range = maxValue - minValue;
    const yMax = maxValue + range * 0.1;
    const yMin = Math.max(0, minValue - range * 0.1);
    
    return { values, yMax, yMin };
}

function valueToY(value, yMin, yMax, chartHeight) {
    const padding = 50;
    const usableHeight = chartHeight - 2 * padding;
    const ratio = (value - yMin) / (yMax - yMin);
    return padding + usableHeight * (1 - ratio);
}
```

---

## Interaction Behaviors

### Filter Changes
```javascript
function handleMonthChange(month) {
    state.selectedMonth = month;
    render();
}

function handleComparisonChange(mode) {
    state.comparisonMode = mode;  // 'LYTD' | 'Target' | 'LMR12M'
    render();
}

function handleMarketChange(market) {
    state.selectedMarket = market;
    render();
}
```

### Tab Navigation
```javascript
function handleTabClick(tabId) {
    state.activeTab = tabId;
    render();
}
```

### Insights Toggle
```javascript
function handleInsightsToggle() {
    state.insightsPanelExpanded = !state.insightsPanelExpanded;
    render();
}
```

### Chart Hover (Tooltip)
```javascript
function handleChartDotHover(event) {
    const dot = event.target;
    const tooltip = document.querySelector('.chart-tooltip');
    
    tooltip.innerHTML = `
        <div class="tooltip-month">${dot.dataset.month}</div>
        <div class="tooltip-row">
            <span class="tooltip-label">2025:</span>
            <span class="tooltip-value">${formatValue(dot.dataset.value, 'C0')}</span>
        </div>
        <div class="tooltip-row">
            <span class="tooltip-label">2024:</span>
            <span class="tooltip-value">${formatValue(dot.dataset.ly, 'C0')}</span>
        </div>
        <div class="tooltip-row">
            <span class="tooltip-label">Target:</span>
            <span class="tooltip-value">${formatValue(dot.dataset.target, 'C0')}</span>
        </div>
    `;
    
    tooltip.style.display = 'block';
    tooltip.style.left = `${event.pageX + 10}px`;
    tooltip.style.top = `${event.pageY - 10}px`;
}

function handleChartDotLeave() {
    document.querySelector('.chart-tooltip').style.display = 'none';
}
```
