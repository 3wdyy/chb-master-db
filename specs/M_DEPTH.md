# M-Depth Mode Specification (P2)

> **PRIORITY**: P2 — Build AFTER C-Overview mode is complete and validated
> **PREREQUISITE**: P1 must pass all validation criteria before starting P2
> **DATA REQUIRED**: metrics_dimensional.csv, crossbrand_detail.csv (see DATA_SCHEMAS.md)

---

## Overview

M-Depth mode serves **Marketing Managers** who need:
- Deep analytical exploration (30-60 minute sessions)
- Multi-dimensional drill-down capability
- Cross-brand behavior analysis
- Member segmentation insights
- Brand-level performance views

---

## Tab Structure

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [Explorer]  [Cross-Brand]  [Segments]  [Brand Deep Dive]                 │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Tab 1: Dimension Explorer

### Purpose
Enable drill-down analysis across multiple dimensions: Market → Brand → Channel → Store Type

### Layout

```
┌──────────────────────────────────────────────────────────────────────────┐
│  BREADCRUMB: All Data > UAE > Level Shoes > [Clear]                      │
├──────────────────────────────────────────────────────────────────────────┤
│  FILTERS: [Dimension: Market ▼] [Value: -- Select -- ▼] [+ Add Filter]   │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  SUMMARY CARDS (filtered totals)                                         │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐         │
│  │ SALES      │  │ MEMBERS    │  │ FREQUENCY  │  │ AOV        │         │
│  │ $52.3M     │  │ 178.2K     │  │ 2.45       │  │ $312       │         │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘         │
│                                                                          │
│  BREAKDOWN TABLE                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ Brand          │ Sales    │ Share % │ Members │ vs LY    │ Drill │   │
│  │ ───────────────┼──────────┼─────────┼─────────┼──────────┼─────  │   │
│  │ Level Shoes    │ $18.2M   │ 34.8%   │ 52.3K   │ ▲ +12.3% │  →    │   │
│  │ Faces          │ $12.1M   │ 23.1%   │ 41.2K   │ ▲ +8.5%  │  →    │   │
│  │ Swarovski      │ $9.8M    │ 18.7%   │ 28.9K   │ ▼ -2.1%  │  →    │   │
│  │ ...            │ ...      │ ...     │ ...     │ ...      │  →    │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### Drill-Down Paths

| Level | Dimension | Next Level |
|-------|-----------|------------|
| 1 | Market | Brand |
| 2 | Brand | Channel |
| 3 | Channel | Store Type |
| 4 | Store Type | (Terminal) |

**Alternative paths** (user can choose starting dimension):
- Member Tier → Member Type → (Terminal)
- Brand → Market → Channel

### State Management

```javascript
// Extended state for M-Depth Explorer
const state = {
    // ... existing P1 state ...
    
    // Explorer state
    drillPath: [],              // [{dimension: 'Market', value: 'UAE'}, ...]
    explorerKPI: 'SLS_TTL'      // Which KPI to show in breakdown
};
```

### Component: Breadcrumb

```javascript
function renderBreadcrumb() {
    if (state.drillPath.length === 0) {
        return '<div class="breadcrumb"><span class="breadcrumb-item active">All Data</span></div>';
    }
    
    const items = state.drillPath.map((step, i) => `
        <span class="breadcrumb-item clickable" data-level="${i}">${step.value}</span>
        <span class="breadcrumb-separator">›</span>
    `).join('');
    
    return `
        <div class="breadcrumb">
            <span class="breadcrumb-item clickable" data-level="-1">All Data</span>
            <span class="breadcrumb-separator">›</span>
            ${items}
            <button class="breadcrumb-clear" onclick="handleClearDrillPath()">Clear</button>
        </div>
    `;
}
```

### Component: Breakdown Table

```javascript
function renderBreakdownTable(data, nextDimension) {
    // ✅ CRITICAL: Get values dynamically from data
    const values = getUniqueDimensionValues(data, nextDimension);
    
    const rows = values.map(value => {
        const filtered = filterByDimension(data, nextDimension, value);
        const totals = calculateTotals(filtered);
        
        return `
            <tr class="breakdown-row" data-dimension="${nextDimension}" data-value="${value}">
                <td class="breakdown-name">${value}</td>
                <td class="breakdown-value">${formatValue(totals.sales, 'C0')}</td>
                <td class="breakdown-share">${formatPct(totals.shareOfParent)}</td>
                <td class="breakdown-members">${formatValue(totals.members, 'V0')}</td>
                <td class="breakdown-variance ${getBadgeClass(totals.vsLY)}">${formatChange(totals.vsLY)}</td>
                <td class="breakdown-drill"><button class="drill-btn" onclick="handleDrill('${nextDimension}', '${value}')">→</button></td>
            </tr>
        `;
    }).join('');
    
    return `
        <table class="breakdown-table">
            <thead>
                <tr>
                    <th>${nextDimension}</th>
                    <th>Sales</th>
                    <th>Share %</th>
                    <th>Members</th>
                    <th>vs LY</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
    `;
}
```

### Dynamic Dimension Extraction (CRITICAL PATTERN)

```javascript
// ✅ CORRECT: Extract all dimension values from data at runtime
function getUniqueDimensionValues(data, dimension) {
    const values = [...new Set(data.map(row => row[dimension]))];
    return values
        .filter(v => v !== null && v !== undefined && v !== '')
        .sort();
}

// ✅ CORRECT: Detect which dimensions exist in the dataset
function getAvailableDimensions(data) {
    const possibleDimensions = ['Market', 'Brand', 'Channel', 'Store_Type', 'Member_Tier', 'Member_Type'];
    return possibleDimensions.filter(dim => 
        data.some(row => row[dim] !== null && row[dim] !== undefined)
    );
}

// ❌ WRONG: Never hardcode dimension values
// const BRANDS = ['Level Shoes', 'Faces', 'Swarovski', ...];
// const MARKETS = ['UAE', 'KSA', 'Kuwait', 'Bahrain'];
```

---

## Tab 2: Cross-Brand Analysis

### Purpose
Analyze cross-shopping behavior between brands

### Layout

```
┌──────────────────────────────────────────────────────────────────────────┐
│  FILTERS: [Market: All Markets ▼]                                        │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  CROSS-BRAND FUNNEL                                                      │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                                                                    │   │
│  │  Total Members    ████████████████████████████████  456.7K (100%) │   │
│  │                           │                                        │   │
│  │  2+ Brands (XBP)  ██████████████████              106.9K (23.4%)  │   │
│  │                           │                                        │   │
│  │  3+ Brands (XBA)  ████████                        41.2K  (9.0%)   │   │
│  │                           │                                        │   │
│  │  4+ Brands        ████                            12.8K  (2.8%)   │   │
│  │                                                                    │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  TOP BRAND PAIRS                          BRAND FLOW                     │
│  ┌─────────────────────────────┐         ┌──────────────────────────┐   │
│  │ Rank │ Brand Pair   │Members│         │                          │   │
│  │ ─────┼──────────────┼───────│         │  [Sankey Diagram]        │   │
│  │ 1    │ Level + Faces│ 28.3K │         │  Home Brand → 2nd Brand  │   │
│  │ 2    │ Faces + Swaro│ 19.1K │         │                          │   │
│  │ 3    │ Level + Swaro│ 15.7K │         │                          │   │
│  │ ...  │ ...          │ ...   │         │                          │   │
│  └─────────────────────────────┘         └──────────────────────────┘   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### Component: Cross-Brand Funnel

```javascript
function renderCrossBrandFunnel(data, market) {
    const filtered = market === 'All Markets' 
        ? data 
        : data.filter(r => r.Market === market);
    
    // Get funnel stages from data
    const stages = [
        { label: 'Total Members', type: 'TOTAL' },
        { label: '2+ Brands (XBP)', type: 'XBP_2PLUS' },
        { label: '3+ Brands (XBA)', type: 'XBA_3PLUS' },
        { label: '4+ Brands', type: 'XB_4PLUS' }
    ];
    
    const total = getFunnelStageCount(filtered, 'TOTAL');
    
    stages.forEach(stage => {
        stage.count = getFunnelStageCount(filtered, stage.type);
        stage.pct = safeDiv(stage.count, total, 0);
        stage.width = (stage.pct * 100) || (stage.type === 'TOTAL' ? 100 : 0);
    });
    
    return `
        <div class="funnel">
            ${stages.map(stage => `
                <div class="funnel-stage">
                    <div class="funnel-label">${stage.label}</div>
                    <div class="funnel-bar-container">
                        <div class="funnel-bar" style="width: ${stage.width}%"></div>
                    </div>
                    <div class="funnel-value">
                        ${formatValue(stage.count, 'V0')} (${formatPct(stage.pct)})
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}
```

### Component: Top Brand Pairs Table

```javascript
function renderTopBrandPairs(data, market, limit = 10) {
    const filtered = data.filter(r => 
        r.Crossbrand_Type === 'PAIR' && 
        (market === 'All Markets' || r.Market === market)
    );
    
    const sorted = filtered.sort((a, b) => b.Member_Count - a.Member_Count);
    const topPairs = sorted.slice(0, limit);
    
    const rows = topPairs.map((row, i) => `
        <tr>
            <td class="pair-rank">${i + 1}</td>
            <td class="pair-brands">${row.Home_Brand} + ${row.Second_Brand}</td>
            <td class="pair-count">${formatValue(row.Member_Count, 'V0')}</td>
            <td class="pair-variance ${getBadgeClass(row.vs_LYTD)}">${formatChange(row.vs_LYTD)}</td>
        </tr>
    `).join('');
    
    return `
        <table class="brand-pairs-table">
            <thead><tr><th>Rank</th><th>Brand Pair</th><th>Members</th><th>vs LY</th></tr></thead>
            <tbody>${rows}</tbody>
        </table>
    `;
}
```

### Component: Brand Flow Sankey (Simplified SVG)

```javascript
function renderBrandFlowSankey(data, market) {
    // ✅ Get brands dynamically from data
    const brands = getUniqueDimensionValues(data.filter(r => r.Crossbrand_Type === 'FLOW'), 'Home_Brand');
    
    // Calculate top flows
    const flows = data
        .filter(r => r.Crossbrand_Type === 'FLOW' && (market === 'All Markets' || r.Market === market))
        .map(r => ({ from: r.Home_Brand, to: r.Second_Brand, value: r.Member_Count }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);
    
    return renderSimpleSankey(brands, flows);
}
```

---

## Tab 3: Member Segmentation

### Purpose
Analyze member composition by various segments

### Layout

```
┌──────────────────────────────────────────────────────────────────────────┐
│  FILTERS: [Market: All Markets ▼]                                        │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────┐  ┌──────────────────────────────────────────┐ │
│  │  NEW vs RETURNING    │  │  ENGAGEMENT MATRIX                       │ │
│  │                      │  │                                          │ │
│  │    ┌─────────────┐   │  │      │ Redeeming │ Not Redeeming │       │ │
│  │    │    NEW      │   │  │  ────┼───────────┼───────────────│       │ │
│  │    │   32.0%     │   │  │  Eng │   12.3%   │     8.7%      │       │ │
│  │    │   (146.2K)  │   │  │      │  (56.1K)  │    (39.7K)    │       │ │
│  │    ├─────────────┤   │  │  ────┼───────────┼───────────────│       │ │
│  │    │  RETURNING  │   │  │  Not │   3.2%    │    75.8%      │       │ │
│  │    │   68.0%     │   │  │  Eng │  (14.6K)  │   (346.3K)    │       │ │
│  │    │   (310.6K)  │   │  │                                          │ │
│  │    └─────────────┘   │  └──────────────────────────────────────────┘ │
│  └──────────────────────┘                                                │
│                                                                          │
│  TIER DISTRIBUTION                                                       │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │    Bronze ████████████████████████████████████████   72.3% (330K) │   │
│  │    Silver ██████████████                             21.2%  (97K) │   │
│  │    Gold   ████                                        5.1%  (23K) │   │
│  │    Plat   █                                           1.4%   (6K) │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### Component: New vs Returning Donut

```javascript
function renderNewReturningDonut(data, market) {
    const filtered = filterByMarket(data, market);
    
    const newMembers = sumKPI(filtered, 'MBR_NEW');
    const returningMembers = sumKPI(filtered, 'MBR_RTN');
    const total = newMembers + returningMembers;
    
    const newPct = safeDiv(newMembers, total, 0);
    const retPct = safeDiv(returningMembers, total, 0);
    
    // SVG donut
    const circumference = 2 * Math.PI * 80;  // r=80
    
    return `
        <svg class="donut-chart" viewBox="0 0 200 200">
            <circle class="donut-bg" cx="100" cy="100" r="80" fill="none" stroke="var(--border-light)" stroke-width="24"/>
            <circle class="donut-new" cx="100" cy="100" r="80" fill="none" 
                    stroke="var(--steel-blue)" stroke-width="24"
                    stroke-dasharray="${newPct * circumference} ${circumference}"
                    transform="rotate(-90 100 100)"/>
            <circle class="donut-returning" cx="100" cy="100" r="80" fill="none" 
                    stroke="var(--navy)" stroke-width="24"
                    stroke-dasharray="${retPct * circumference} ${circumference}"
                    stroke-dashoffset="-${newPct * circumference}"
                    transform="rotate(-90 100 100)"/>
        </svg>
        <div class="donut-legend">
            <div class="legend-item"><span class="legend-dot" style="background:var(--steel-blue)"></span>New: ${formatValue(newMembers, 'V0')} (${formatPct(newPct)})</div>
            <div class="legend-item"><span class="legend-dot" style="background:var(--navy)"></span>Returning: ${formatValue(returningMembers, 'V0')} (${formatPct(retPct)})</div>
        </div>
    `;
}
```

### Component: Engagement 2×2 Matrix

```javascript
function renderEngagementMatrix(data, market) {
    const filtered = filterByMarket(data, market);
    
    // Get counts for each quadrant from dimensional data
    const quadrants = {
        engRdm: sumSegment(filtered, 'Engaged', 'Redeeming'),
        engNRdm: sumSegment(filtered, 'Engaged', 'Not_Redeeming'),
        nEngRdm: sumSegment(filtered, 'Not_Engaged', 'Redeeming'),
        nEngNRdm: sumSegment(filtered, 'Not_Engaged', 'Not_Redeeming')
    };
    
    const total = Object.values(quadrants).reduce((a, b) => a + b, 0);
    
    return `
        <table class="engagement-matrix">
            <thead>
                <tr><th></th><th>Redeeming</th><th>Not Redeeming</th></tr>
            </thead>
            <tbody>
                <tr>
                    <td class="matrix-label">Engaged</td>
                    <td class="matrix-cell matrix-best">${formatPct(safeDiv(quadrants.engRdm, total))}<br><small>(${formatValue(quadrants.engRdm, 'V0')})</small></td>
                    <td class="matrix-cell matrix-mid">${formatPct(safeDiv(quadrants.engNRdm, total))}<br><small>(${formatValue(quadrants.engNRdm, 'V0')})</small></td>
                </tr>
                <tr>
                    <td class="matrix-label">Not Engaged</td>
                    <td class="matrix-cell matrix-mid">${formatPct(safeDiv(quadrants.nEngRdm, total))}<br><small>(${formatValue(quadrants.nEngRdm, 'V0')})</small></td>
                    <td class="matrix-cell matrix-worst">${formatPct(safeDiv(quadrants.nEngNRdm, total))}<br><small>(${formatValue(quadrants.nEngNRdm, 'V0')})</small></td>
                </tr>
            </tbody>
        </table>
    `;
}
```

### Component: Tier Distribution

```javascript
function renderTierDistribution(data, market) {
    const filtered = filterByMarket(data, market);
    
    // ✅ Get tiers dynamically from data
    const tiers = getUniqueDimensionValues(filtered, 'Member_Tier');
    
    const tierCounts = tiers.map(tier => ({
        tier,
        count: sumByDimension(filtered, 'Member_Tier', tier)
    }));
    
    const total = tierCounts.reduce((sum, t) => sum + t.count, 0);
    const maxCount = Math.max(...tierCounts.map(t => t.count));
    
    return `
        <div class="tier-distribution">
            ${tierCounts.map(t => `
                <div class="tier-row">
                    <div class="tier-label">${t.tier}</div>
                    <div class="tier-bar-container">
                        <div class="tier-bar" style="width: ${safeDiv(t.count, maxCount) * 100}%"></div>
                    </div>
                    <div class="tier-value">${formatPct(safeDiv(t.count, total))} (${formatValue(t.count, 'V0')})</div>
                </div>
            `).join('')}
        </div>
    `;
}
```

---

## Tab 4: Brand Deep Dive

### Purpose
Detailed analysis for a single selected brand

### Layout

```
┌──────────────────────────────────────────────────────────────────────────┐
│  FILTERS: [Brand: Level Shoes ▼]                                         │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  BRAND SCORECARD                                                         │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐         │
│  │ SALES      │  │ MEMBERS    │  │ FREQUENCY  │  │ AOV        │         │
│  │ $18.2M     │  │ 52.3K      │  │ 2.78       │  │ $385       │         │
│  │ ▲ +15.2%   │  │ ▲ +8.9%    │  │ ▲ +4.5%    │  │ ▲ +1.8%    │         │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘         │
│                                                                          │
│  MARKET BREAKDOWN                         CHANNEL SPLIT                  │
│  ┌─────────────────────────────┐         ┌─────────────────────────────┐│
│  │ Market   │ Sales  │ vs LY   │         │                             ││
│  │ ─────────┼────────┼─────────│         │  INSTORE   ████████████     ││
│  │ UAE      │ $8.2M  │ ▲+18.1% │         │            72.3%  $13.2M    ││
│  │ KSA      │ $5.1M  │ ▼-3.2%  │         │                             ││
│  │ Kuwait   │ $3.2M  │ ▲+12.5% │         │  ECOMMERCE ██████           ││
│  │ Bahrain  │ $1.7M  │ ▲+45.2% │         │            27.7%  $5.0M     ││
│  └─────────────────────────────┘         │                             ││
│                                          └─────────────────────────────┘│
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### Component: Brand Selector

```javascript
function renderBrandSelector(data) {
    // ✅ Get brands dynamically
    const brands = getUniqueDimensionValues(data, 'Brand');
    
    const options = brands.map(brand => 
        `<option value="${brand}" ${state.selectedBrand === brand ? 'selected' : ''}>${brand}</option>`
    ).join('');
    
    return `
        <select id="brand-select" onchange="handleBrandChange(this.value)">
            <option value="">-- Select Brand --</option>
            ${options}
        </select>
    `;
}
```

### Component: Brand Scorecard

Same structure as C-Overview hero cards, filtered by selected brand.

### Component: Market Breakdown

```javascript
function renderBrandMarketBreakdown(data, brand) {
    const filtered = data.filter(r => r.Brand === brand);
    
    // ✅ Get markets dynamically
    const markets = getUniqueDimensionValues(filtered, 'Market').filter(m => m !== 'All Markets');
    
    const rows = markets.map(market => {
        const mData = filtered.find(r => r.Market === market && r.Key === 'SLS_TTL');
        if (!mData) return '';
        
        return `
            <tr>
                <td>${market}</td>
                <td>${formatValue(mData.Value, 'C0')}</td>
                <td class="${getBadgeClass(mData.vs_LYTD)}">${formatChange(mData.vs_LYTD)}</td>
            </tr>
        `;
    }).join('');
    
    return `
        <table class="brand-market-table">
            <thead><tr><th>Market</th><th>Sales</th><th>vs LY</th></tr></thead>
            <tbody>${rows}</tbody>
        </table>
    `;
}
```

### Component: Channel Split

```javascript
function renderChannelSplit(data, brand) {
    const filtered = data.filter(r => r.Brand === brand && r.Key === 'SLS_TTL');
    
    // ✅ Get channels dynamically
    const channels = getUniqueDimensionValues(filtered, 'Channel');
    
    const channelData = channels.map(ch => ({
        channel: ch,
        value: filtered.find(r => r.Channel === ch)?.Value || 0
    }));
    
    const total = channelData.reduce((sum, c) => sum + c.value, 0);
    const maxValue = Math.max(...channelData.map(c => c.value));
    
    return `
        <div class="channel-split">
            ${channelData.map(c => `
                <div class="channel-row">
                    <div class="channel-label">${c.channel}</div>
                    <div class="channel-bar-container">
                        <div class="channel-bar" style="width: ${safeDiv(c.value, maxValue) * 100}%"></div>
                    </div>
                    <div class="channel-value">${formatPct(safeDiv(c.value, total))} ${formatValue(c.value, 'C0')}</div>
                </div>
            `).join('')}
        </div>
    `;
}
```

---

## State Management Extensions for P2

```javascript
const state = {
    // === P1 STATE (keep all existing) ===
    dashboardMode: 'C-OVERVIEW',
    comparisonMode: 'LYTD',
    activeTab: 'scorecard',
    // ... etc
    
    // === P2 STATE (add these) ===
    
    // Explorer
    drillPath: [],
    explorerKPI: 'SLS_TTL',
    
    // Cross-Brand
    crossbrandMarket: 'All Markets',
    
    // Segments  
    segmentMarket: 'All Markets',
    
    // Brand Deep Dive
    selectedBrand: null,
    
    // P2 Data stores
    dimensionalData: null,      // metrics_dimensional.csv
    crossbrandData: null        // crossbrand_detail.csv
};
```

---

## P1 Extensibility Checklist

Before building P2, verify P1 architecture supports:

- [ ] State object can be extended without breaking existing functions
- [ ] Render functions are modular and composable
- [ ] Tab switching mechanism supports dynamic tab list per mode
- [ ] Filter components are reusable
- [ ] CSS classes follow consistent naming convention
- [ ] `getUniqueDimensionValues()` utility exists and works correctly
- [ ] All dimension values extracted from data, never hardcoded
- [ ] File upload can accept multiple files
- [ ] No MC mode code remains — MUSE only

---

## CSS Classes for M-Depth

```css
/* Breadcrumb */
.breadcrumb { display: flex; align-items: center; gap: var(--space-sm); }
.breadcrumb-item.clickable { cursor: pointer; color: var(--steel-blue); }
.breadcrumb-item.clickable:hover { text-decoration: underline; }
.breadcrumb-separator { color: var(--text-muted); }

/* Breakdown Table */
.breakdown-table { width: 100%; border-collapse: collapse; }
.breakdown-row:hover { background: var(--light-bg); }
.drill-btn { background: var(--steel-blue); color: white; border: none; border-radius: var(--radius-sm); cursor: pointer; }

/* Funnel */
.funnel { display: flex; flex-direction: column; gap: var(--space-md); }
.funnel-stage { display: grid; grid-template-columns: 150px 1fr 120px; align-items: center; gap: var(--space-md); }
.funnel-bar-container { background: var(--light-bg); border-radius: var(--radius-sm); height: 32px; }
.funnel-bar { background: var(--steel-blue); height: 100%; border-radius: var(--radius-sm); }

/* Engagement Matrix */
.engagement-matrix { border-collapse: collapse; }
.matrix-cell { padding: var(--space-md); text-align: center; }
.matrix-best { background: var(--positive-light); }
.matrix-mid { background: var(--warning-light); }
.matrix-worst { background: var(--negative-light); }

/* Tier Distribution */
.tier-distribution { display: flex; flex-direction: column; gap: var(--space-sm); }
.tier-row { display: grid; grid-template-columns: 80px 1fr 120px; align-items: center; gap: var(--space-md); }
.tier-bar-container { background: var(--light-bg); border-radius: var(--radius-sm); height: 24px; }
.tier-bar { background: var(--navy); height: 100%; border-radius: var(--radius-sm); }

/* Channel Split */
.channel-split { display: flex; flex-direction: column; gap: var(--space-sm); }
.channel-row { display: grid; grid-template-columns: 100px 1fr 120px; align-items: center; gap: var(--space-md); }
.channel-bar-container { background: var(--light-bg); border-radius: var(--radius-sm); height: 24px; }
.channel-bar { background: var(--steel-blue); height: 100%; border-radius: var(--radius-sm); }

/* Donut Chart */
.donut-chart { width: 180px; height: 180px; }
.donut-legend { margin-top: var(--space-md); }
.legend-dot { display: inline-block; width: 12px; height: 12px; border-radius: 50%; margin-right: var(--space-xs); }
```
