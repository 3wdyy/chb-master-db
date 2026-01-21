# Data Schemas

## Overview

Two CSV files power the C-Overview mode:

| File | Purpose | Rows (typical) |
|------|---------|----------------|
| metrics_main.csv | KPI values by month/market | ~60 rows |
| metrics_trend.csv | Monthly time series for charts | ~20 rows |

---

## Schema: metrics_main.csv

**Primary data source** for scorecards, tables, insights, and heatmap.

### Columns

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| Refresh_Date | DATE | When data was generated | 2026-01-20 |
| Month | STRING | Period in "MM - Mon" format | "12 - Dec" |
| Market | STRING | Market name or aggregate | "United Arab Emirates" |
| Key | STRING | KPI identifier | "SLS_TTL" |
| KPI | STRING | Human-readable KPI name | "Total Sales" |
| Format | STRING | Display format code | "C0" |
| Mode | STRING | KPI mode flags | "CPBWSC" |
| Category | STRING | KPI category | "sales" |
| YTD | FLOAT | Year-to-date value | 125456789.00 |
| Target | FLOAT | Target value (nullable) | 130000000.00 |
| vs_Target | FLOAT | Variance vs target | -0.0349 |
| LYTD | FLOAT | Last year to date | 111723456.00 |
| vs_LYTD | FLOAT | Variance vs last year | 0.1229 |
| R12M | FLOAT | Rolling 12 months | 198765432.00 |
| LMR12M | FLOAT | Last month R12M | 196543210.00 |
| vs_LMR12M | FLOAT | Variance vs last R12M | 0.0113 |
| LYR12M | FLOAT | Last year R12M | 178234567.00 |
| vs_LYR12M | FLOAT | Variance vs LY R12M | 0.1152 |

### Format Codes

| Code | Meaning | Example Input | Display Output |
|------|---------|---------------|----------------|
| C0 | Currency, 0 decimals | 125456789 | $125.5M |
| C2 | Currency, 2 decimals | 287.45 | $287.45 |
| V0 | Value, 0 decimals | 456789 | 456.8K |
| V2 | Value, 2 decimals | 2.34 | 2.34 |
| P4 | Percent, 4 decimals stored | 0.2340 | 23.40% |

### Market Values

```javascript
// ✅ CORRECT: Extract markets dynamically from data
function getMarkets(data) {
    return [...new Set(data.map(r => r.Market))]
        .filter(Boolean)
        .sort();
}

// Usage:
const markets = getMarkets(state.museData);
// Returns whatever markets exist in the uploaded data

// ❌ WRONG: Never hardcode markets
// const MARKETS = ['All Markets', 'United Arab Emirates', ...];
```

### KPI Keys

```javascript
const KPI_KEYS = [
    // Sales
    'SLS_TTL',   // Total Sales
    'SLS_PEN',   // Sales Penetration
    
    // Members
    'MBR_TTL',   // Transacting Members
    'MBR_NEW',   // New Members
    'MBR_RTN',   // Returning Members
    
    // Behavior
    'AVG_ATF',   // Average Frequency
    'AVG_AOV',   // Average Order Value
    
    // Loyalty
    'PCT_RDM',   // Redeeming Members %
    'PTS_BRN',   // Points Burned Value
    
    // Cross-Brand
    'PCT_XBP',   // Cross Brand Plus %
    'PCT_NBA',   // New Brand Adopters %
    'AVG_BRD'    // Avg Brands Shopped
];
```

### Sample Rows

```csv
Refresh_Date,Month,Market,Key,KPI,Format,YTD,Target,vs_Target,LYTD,vs_LYTD
2026-01-20,12 - Dec,All Markets,SLS_TTL,Total Sales,C0,125456789,130000000,-0.0349,111723456,0.1229
2026-01-20,12 - Dec,All Markets,MBR_TTL,Transacting Members,V0,456789,500000,-0.0864,422567,0.0810
2026-01-20,12 - Dec,United Arab Emirates,SLS_TTL,Total Sales,C0,52345678,55000000,-0.0483,45234567,0.1572
```

---

## Schema: metrics_trend.csv

**Time series data** for trend charts. One row per KPI per market.

### Columns

| Column | Type | Description |
|--------|------|-------------|
| Market | STRING | Market name |
| Key | STRING | KPI identifier |
| KPI | STRING | Human-readable name |
| Format | STRING | Display format |
| Category | STRING | KPI category |
| M01_YTD | FLOAT | January YTD value |
| M01_LYTD | FLOAT | January LYTD value |
| M01_Target | FLOAT | January target |
| M02_YTD | FLOAT | February YTD value |
| M02_LYTD | FLOAT | February LYTD value |
| M02_Target | FLOAT | February target |
| ... | ... | ... |
| M12_YTD | FLOAT | December YTD value |
| M12_LYTD | FLOAT | December LYTD value |
| M12_Target | FLOAT | December target |

### Column Pattern

```
M{01-12}_{YTD|LYTD|Target}
```

- M01 = January, M12 = December
- YTD = Current year value
- LYTD = Last year value  
- Target = Target value

### Sample Row

```csv
Market,Key,KPI,Format,Category,M01_YTD,M01_LYTD,M01_Target,M02_YTD,M02_LYTD,M02_Target,...
All Markets,SLS_TTL,Total Sales,C0,sales,8500000,7800000,9000000,18200000,16500000,19000000,...
```

---

## Data Access Patterns

### Get Latest Month Data
```javascript
function getLatestMonthData(data) {
    // Find the most recent month
    const months = [...new Set(data.map(r => r.Month))];
    const latestMonth = months.sort().reverse()[0];
    
    return data.filter(r => r.Month === latestMonth);
}
```

### Get KPI for Market
```javascript
function getKPIData(data, kpiKey, market, month) {
    return data.find(r => 
        r.Key === kpiKey && 
        r.Market === market && 
        r.Month === month
    );
}
```

### Get All Markets for KPI
```javascript
function getMarketsForKPI(data, kpiKey, month) {
    return data.filter(r => 
        r.Key === kpiKey && 
        r.Month === month &&
        r.Market !== 'All Markets'
    );
}
```

### Get Trend Data for Chart
```javascript
function getTrendData(trendData, kpiKey, market) {
    return trendData.find(r => 
        r.Key === kpiKey && 
        r.Market === market
    );
}

// Extract monthly values
function extractMonthlyValues(row) {
    const months = [];
    for (let i = 1; i <= 12; i++) {
        const m = String(i).padStart(2, '0');
        months.push({
            month: i,
            label: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i-1],
            ytd: row[`M${m}_YTD`],
            lytd: row[`M${m}_LYTD`],
            target: row[`M${m}_Target`]
        });
    }
    return months;
}
```

---

## Parsing Functions

### CSV Parser
```javascript
function parseCSV(text) {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',');
    
    return lines.slice(1).map(line => {
        const values = line.split(',');
        const row = {};
        
        headers.forEach((header, i) => {
            let value = values[i];
            
            // Parse numbers
            if (['YTD', 'LYTD', 'Target', 'R12M', 'LMR12M', 'LYR12M',
                 'vs_Target', 'vs_LYTD', 'vs_LMR12M', 'vs_LYR12M'].includes(header) ||
                header.match(/^M\d{2}_/)) {
                value = value === '' ? null : parseFloat(value);
            }
            
            row[header] = value;
        });
        
        return row;
    });
}
```

### Value Formatting
```javascript
function formatValue(value, format) {
    if (value === null || value === undefined || Number.isNaN(value)) {
        return '—';
    }
    
    switch (format) {
        case 'C0':  // Currency, millions
            if (Math.abs(value) >= 1000000) {
                return '$' + (value / 1000000).toFixed(1) + 'M';
            }
            return '$' + value.toLocaleString('en-US', { maximumFractionDigits: 0 });
            
        case 'C2':  // Currency, dollars
            return '$' + value.toFixed(2);
            
        case 'V0':  // Value, thousands
            if (Math.abs(value) >= 1000) {
                return (value / 1000).toFixed(1) + 'K';
            }
            return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
            
        case 'V2':  // Value, 2 decimals
            return value.toFixed(2);
            
        case 'P4':  // Percentage
            return (value * 100).toFixed(1) + '%';
            
        default:
            return String(value);
    }
}
```

### Variance Formatting
```javascript
function formatChange(value, format) {
    if (value === null || value === undefined || Number.isNaN(value)) {
        return '—';
    }
    
    const sign = value >= 0 ? '+' : '';
    const arrow = value >= 0 ? '▲' : '▼';
    
    // Percentage point formats (P*)
    if (format && format.startsWith('P')) {
        // Show as percentage points
        return `${arrow} ${sign}${(value * 100).toFixed(1)}pp`;
    }
    
    // Regular percentage change
    return `${arrow} ${sign}${(value * 100).toFixed(1)}%`;
}
```

---

---

## P2 Schemas (M-Depth Mode)

These schemas are required for M-Depth mode implementation. Not needed for P1 placeholder.

### Schema: metrics_dimensional

**Purpose**: Enable multi-dimensional drill-down analysis.

**Columns:**
| Column | Type | Description | Example |
|--------|------|-------------|---------|
| Refresh_Date | DATE | When data was generated | 2026-01-20 |
| Month | STRING | Period | "12 - Dec" |
| Market | STRING | Market name | "Saudi Arabia" |
| Brand | STRING | Brand name | "Level Shoes" |
| Channel | STRING | Sales channel | "INSTORE" |
| Store_Type | STRING | Store classification | "Flagship" |
| Member_Tier | STRING | Loyalty tier | "Gold" |
| Member_Type | STRING | New or returning | "Returning" |
| Key | STRING | KPI identifier | "SLS_TTL" |
| Value | FLOAT | Metric value | 12456789.00 |
| vs_LYTD | FLOAT | Variance vs last year | 0.0821 |
| Share_of_Parent | FLOAT | % of parent dimension | 0.325 |

**Granularity**: One row per unique combination of dimensions.

**Sample Rows:**
```csv
Refresh_Date,Month,Market,Brand,Channel,Store_Type,Member_Tier,Member_Type,Key,Value,vs_LYTD,Share_of_Parent
2026-01-20,12 - Dec,Saudi Arabia,Level Shoes,INSTORE,Flagship,Gold,Returning,SLS_TTL,4567890,0.0523,0.182
2026-01-20,12 - Dec,Saudi Arabia,Level Shoes,INSTORE,Flagship,Gold,Returning,MBR_TTL,12345,0.0891,0.156
2026-01-20,12 - Dec,Saudi Arabia,Level Shoes,ECOMMERCE,Online,Silver,New,SLS_TTL,2345678,-0.0234,0.094
```

**Query Pattern** (for drill-down):
```javascript
function getDimensionalData(data, filters, groupBy) {
    return data
        .filter(row => {
            for (const [dim, val] of Object.entries(filters)) {
                if (row[dim] !== val) return false;
            }
            return true;
        })
        .reduce((acc, row) => {
            const key = row[groupBy];
            if (!acc[key]) acc[key] = { ...row, Value: 0 };
            acc[key].Value += row.Value;
            return acc;
        }, {});
}
```

---

### Schema: crossbrand_detail

**Purpose**: Cross-brand flow analysis and brand pair rankings.

**Columns:**
| Column | Type | Description | Example |
|--------|------|-------------|---------|
| Refresh_Date | DATE | When data was generated | 2026-01-20 |
| Month | STRING | Period | "12 - Dec" |
| Market | STRING | Market name | "All Markets" |
| Crossbrand_Type | STRING | Funnel stage | "XBP" |
| Home_Brand | STRING | Primary brand | "Level Shoes" |
| Second_Brand | STRING | Cross-shopped brand (nullable) | "Faces" |
| Member_Count | INT | Number of members | 24100 |
| vs_LYTD | FLOAT | Variance vs last year | 0.0512 |

**Crossbrand_Type Values:**
| Type | Definition |
|------|------------|
| TOTAL | All transacting members |
| XBP | Cross Brand Plus (2+ brands) |
| XBA | Cross Brand Active (3+ brands) |
| XB4 | 4+ brands |

**Data Patterns:**

1. **Funnel totals** (Second_Brand = NULL):
```csv
...,XBP,NULL,NULL,234567,0.0823
...,XBA,NULL,NULL,156234,0.0567
```

2. **Brand pairs** (both brands specified):
```csv
...,XBP,Level Shoes,Faces,24100,0.0512
...,XBP,Faces,Swarovski,28400,0.0789
```

**Sample Rows:**
```csv
Refresh_Date,Month,Market,Crossbrand_Type,Home_Brand,Second_Brand,Member_Count,vs_LYTD
2026-01-20,12 - Dec,All Markets,TOTAL,,,456789,0.0810
2026-01-20,12 - Dec,All Markets,XBP,,,234567,0.0823
2026-01-20,12 - Dec,All Markets,XBA,,,156234,0.0567
2026-01-20,12 - Dec,All Markets,XBP,Level Shoes,Faces,24100,0.0512
2026-01-20,12 - Dec,All Markets,XBP,Faces,Swarovski,28400,0.0789
2026-01-20,12 - Dec,All Markets,XBP,Level Shoes,Swarovski,19800,0.0321
```

**Query Pattern** (for funnel):
```javascript
function getCrossbrandFunnel(data, market) {
    return data
        .filter(row => 
            row.Market === market && 
            row.Home_Brand === '' &&
            row.Second_Brand === ''
        )
        .map(row => ({
            stage: row.Crossbrand_Type,
            count: row.Member_Count,
            vsLY: row.vs_LYTD
        }));
}
```

**Query Pattern** (for brand pairs):
```javascript
function getTopBrandPairs(data, market, limit = 10) {
    return data
        .filter(row => 
            row.Market === market && 
            row.Home_Brand !== '' &&
            row.Second_Brand !== ''
        )
        .sort((a, b) => b.Member_Count - a.Member_Count)
        .slice(0, limit);
}
```

---

## Null Handling

**Critical**: Always handle null/undefined values.

```javascript
// ❌ WRONG: Will crash on null
const display = data.YTD.toFixed(2);

// ✅ CORRECT: Null-safe
const display = data.YTD !== null ? data.YTD.toFixed(2) : '—';

// ✅ BETTER: Use formatting function
const display = formatValue(data.YTD, data.Format);
```

**Null scenarios to handle**:
- Missing target values (some KPIs have no target)
- Zero denominators in variance calculations
- Missing months in trend data
- New markets with no prior year data
