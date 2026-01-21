/* ============================================================================
   MUSE DASHBOARD — CODE PATTERNS
   
   Reference these patterns when implementing. Copy the structure exactly.
   These are extracted from the working Dashboard.html
   ============================================================================ */


// ============================================================================
// PATTERN 1: IIFE STRUCTURE (Use this for entire app)
// ============================================================================

(function() {
    'use strict';
    
    // All code goes here
    // No global variables leak out
    
})();


// ============================================================================
// PATTERN 2: CONSTANTS DEFINITION
// ============================================================================

const KPI_CONFIG = {
    'SLS_TTL': { name: 'Total Sales', format: 'C0', category: 'sales' },
    'SLS_PEN': { name: 'Sales Penetration', format: 'P4', category: 'sales' },
    'MBR_TTL': { name: 'Transacting Members', format: 'V0', category: 'members' },
    'MBR_NEW': { name: 'New Members', format: 'V0', category: 'members' },
    'MBR_RTN': { name: 'Returning Members', format: 'V0', category: 'members' },
    'AVG_ATF': { name: 'Average Frequency', format: 'V2', category: 'behavior' },
    'AVG_AOV': { name: 'Average Order Value', format: 'C0', category: 'behavior' },
    'PCT_RDM': { name: 'Redeeming Members %', format: 'P4', category: 'loyalty' },
    'PCT_XBP': { name: 'Cross Brand Plus %', format: 'P4', category: 'crossbrand' },
    'PCT_NBA': { name: 'New Brand Adopters %', format: 'P4', category: 'crossbrand' },
    'AVG_BRD': { name: 'Avg Brands Shopped', format: 'V2', category: 'crossbrand' },
    'PTS_BRN': { name: 'Points Burned Value', format: 'C0', category: 'loyalty' }
};

const HERO_KPIS = ['SLS_TTL', 'MBR_TTL', 'PCT_XBP', 'SLS_PEN'];

const SCORECARD_KPIS = [
    'SLS_TTL', 'SLS_PEN', 'MBR_TTL', 'MBR_NEW', 'MBR_RTN', 'AVG_ATF',
    'AVG_AOV', 'PCT_RDM', 'PCT_XBP', 'PCT_NBA', 'AVG_BRD', 'PTS_BRN'
];

const HEATMAP_KPIS = ['SLS_TTL', 'MBR_TTL', 'PCT_XBP', 'PCT_RDM'];

const MARKETS = [
    'All Markets',
    'United Arab Emirates',
    'Saudi Arabia',
    'Kuwait',
    'Bahrain'
];


// ============================================================================
// PATTERN 3: STATE OBJECT
// ============================================================================

const state = {
    // Dashboard mode
    dashboardMode: 'C-OVERVIEW',     // 'C-OVERVIEW' | 'M-DEPTH'
    comparisonMode: 'LYTD',          // 'LYTD' | 'Target' | 'LMR12M'
    activeTab: 'scorecard',          // 'scorecard' | 'markets' | 'trends'
    insightsPanelExpanded: true,
    
    // Data mode (existing)
    mode: 'MUSE',
    dataLoaded: false,
    
    // Data stores
    museData: null,
    museTrendData: null,
    
    // Filters
    selectedMonth: null,
    selectedMarket: 'All Markets',
    selectedKPI: 'SLS_TTL'
};


// ============================================================================
// PATTERN 4: UTILITY FUNCTIONS
// ============================================================================

function safeDiv(numerator, denominator, fallback = 0) {
    if (denominator === null || denominator === undefined || 
        denominator === 0 || Number.isNaN(denominator)) {
        return fallback;
    }
    return numerator / denominator;
}

function formatValue(value, format) {
    if (value === null || value === undefined || Number.isNaN(value)) {
        return '—';
    }
    
    const num = Number(value);
    
    switch (format) {
        case 'C0':
            if (Math.abs(num) >= 1000000) {
                return '$' + (num / 1000000).toFixed(1) + 'M';
            } else if (Math.abs(num) >= 1000) {
                return '$' + (num / 1000).toFixed(1) + 'K';
            }
            return '$' + num.toLocaleString('en-US', { maximumFractionDigits: 0 });
            
        case 'C2':
            return '$' + num.toFixed(2);
            
        case 'V0':
            if (Math.abs(num) >= 1000000) {
                return (num / 1000000).toFixed(1) + 'M';
            } else if (Math.abs(num) >= 1000) {
                return (num / 1000).toFixed(1) + 'K';
            }
            return num.toLocaleString('en-US', { maximumFractionDigits: 0 });
            
        case 'V2':
            return num.toFixed(2);
            
        case 'P4':
            return (num * 100).toFixed(1) + '%';
            
        default:
            return String(num);
    }
}

function formatChange(value, format) {
    if (value === null || value === undefined || Number.isNaN(value)) {
        return '—';
    }
    
    const num = Number(value);
    const sign = num >= 0 ? '+' : '';
    const arrow = num >= 0 ? '▲' : '▼';
    
    // Percentage point formats (P*)
    if (format && format.startsWith('P')) {
        return `${arrow} ${sign}${(num * 100).toFixed(1)}pp`;
    }
    
    // Regular percentage change
    return `${arrow} ${sign}${(num * 100).toFixed(1)}%`;
}

function getVariance(row, comparisonMode) {
    if (!row) return null;
    
    switch (comparisonMode) {
        case 'LYTD': return row.vs_LYTD;
        case 'Target': return row.vs_Target;
        case 'LMR12M': return row.vs_LMR12M;
        default: return null;
    }
}

function getComparisonLabel(comparisonMode) {
    switch (comparisonMode) {
        case 'LYTD': return 'vs LY';
        case 'Target': return 'vs Target';
        case 'LMR12M': return 'vs R12M';
        default: return '';
    }
}


// ============================================================================
// PATTERN 5: CSS CLASS DETERMINATION
// ============================================================================

function getBadgeClass(variance, format) {
    if (variance === null || variance === undefined) return 'neutral';
    
    // Percentage point metrics
    if (format && format.startsWith('P')) {
        if (variance > 0.005) return 'positive';
        if (variance < -0.005) return 'negative';
        return 'neutral';
    }
    
    // Percentage change metrics
    if (variance > 0.02) return 'positive';
    if (variance < -0.02) return 'negative';
    return 'neutral';
}

function getRowClass(variance) {
    if (variance === null || variance === undefined) return '';
    if (variance >= 0) return 'row-positive';
    if (variance >= -0.05) return 'row-warning';
    return 'row-negative';
}

function getHeatmapClass(vsTarget) {
    if (vsTarget === null || vsTarget === undefined) return 'heatmap-neutral';
    if (vsTarget >= 0) return 'heatmap-positive';
    if (vsTarget >= -0.05) return 'heatmap-warning';
    return 'heatmap-negative';
}


// ============================================================================
// PATTERN 6: DATA PARSING
// ============================================================================

function parseCSV(text) {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',');
    
    const numericColumns = [
        'YTD', 'LYTD', 'Target', 'R12M', 'LMR12M', 'LYR12M',
        'vs_Target', 'vs_LYTD', 'vs_LMR12M', 'vs_LYR12M'
    ];
    
    return lines.slice(1).map(line => {
        const values = line.split(',');
        const row = {};
        
        headers.forEach((header, i) => {
            let value = values[i];
            
            // Parse numeric columns
            if (numericColumns.includes(header) || header.match(/^M\d{2}_/)) {
                value = value === '' || value === 'null' ? null : parseFloat(value);
            }
            
            row[header] = value;
        });
        
        return row;
    });
}


// ============================================================================
// PATTERN 7: DATA FILTERING
// ============================================================================

function getLatestMonth(data) {
    const months = [...new Set(data.map(r => r.Month))];
    return months.sort().reverse()[0];
}

function filterData(data, { month, market, kpiKey }) {
    return data.filter(row => {
        if (month && row.Month !== month) return false;
        if (market && row.Market !== market) return false;
        if (kpiKey && row.Key !== kpiKey) return false;
        return true;
    });
}

function getKPIRow(data, kpiKey, market, month) {
    return data.find(r => 
        r.Key === kpiKey && 
        r.Market === market && 
        r.Month === month
    ) || null;
}


// ============================================================================
// PATTERN 8: RENDER FUNCTION STRUCTURE
// ============================================================================

function render() {
    const container = document.body;
    
    container.innerHTML = `
        ${renderHeader()}
        ${renderFilters()}
        ${renderContent()}
        ${renderFooter()}
    `;
    
    attachEventListeners();
}

function renderHeader() {
    return `
        <header class="header">
            <div class="header-left">
                <div class="logo">MUSE</div>
                <div class="title">Loyalty Analytics Dashboard</div>
            </div>
            <div class="header-right">
                ${renderModeToggle()}
            </div>
        </header>
    `;
}

function renderModeToggle() {
    return `
        <div class="mode-toggle">
            <button class="mode-toggle-btn ${state.dashboardMode === 'C-OVERVIEW' ? 'active' : ''}"
                    data-mode="C-OVERVIEW">
                C-Overview
            </button>
            <button class="mode-toggle-btn ${state.dashboardMode === 'M-DEPTH' ? 'active' : ''}"
                    data-mode="M-DEPTH">
                M-Depth
            </button>
        </div>
    `;
}

function renderContent() {
    if (!state.dataLoaded) {
        return renderUploadPrompt();
    }
    
    if (state.dashboardMode === 'C-OVERVIEW') {
        switch (state.activeTab) {
            case 'scorecard': return renderScorecard();
            case 'markets': return renderMarkets();
            case 'trends': return renderTrends();
            default: return renderScorecard();
        }
    } else {
        return renderMDepthPlaceholder();
    }
}


// ============================================================================
// PATTERN 9: COMPONENT RENDERING
// ============================================================================

function renderHeroCards(data, month, market) {
    const cards = HERO_KPIS.map(kpiKey => {
        const row = getKPIRow(data, kpiKey, market, month);
        const config = KPI_CONFIG[kpiKey];
        
        if (!row) {
            return `<div class="hero-card hero-card-empty">No data</div>`;
        }
        
        const variance = getVariance(row, state.comparisonMode);
        const badgeClass = getBadgeClass(variance, row.Format);
        
        return `
            <div class="hero-card">
                <div class="hero-card-label">${config.name.toUpperCase()}</div>
                <div class="hero-card-value">${formatValue(row.YTD, row.Format)}</div>
                <div class="hero-card-badge ${badgeClass}">
                    ${formatChange(variance, row.Format)} ${getComparisonLabel(state.comparisonMode)}
                </div>
                ${row.Target ? `
                    <div class="hero-card-secondary">
                        Target: ${formatValue(row.Target, row.Format)}
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
    
    return `<div class="hero-cards">${cards}</div>`;
}

function renderKPITable(data, month, market) {
    const rows = SCORECARD_KPIS.map(kpiKey => {
        const row = getKPIRow(data, kpiKey, market, month);
        const config = KPI_CONFIG[kpiKey];
        
        if (!row) return '';
        
        const vsTargetClass = getBadgeClass(row.vs_Target, row.Format);
        const vsLYClass = getBadgeClass(row.vs_LYTD, row.Format);
        const rowClass = getRowClass(row.vs_Target);
        
        return `
            <tr class="kpi-row ${rowClass}">
                <td class="kpi-name">${config.name}</td>
                <td class="kpi-value">${formatValue(row.YTD, row.Format)}</td>
                <td class="kpi-value">${formatValue(row.Target, row.Format)}</td>
                <td class="kpi-change ${vsTargetClass}">${formatChange(row.vs_Target, row.Format)}</td>
                <td class="kpi-value">${formatValue(row.LYTD, row.Format)}</td>
                <td class="kpi-change ${vsLYClass}">${formatChange(row.vs_LYTD, row.Format)}</td>
            </tr>
        `;
    }).join('');
    
    return `
        <table class="kpi-table">
            <thead>
                <tr>
                    <th>KPI</th>
                    <th>YTD</th>
                    <th>Target</th>
                    <th>vs Target</th>
                    <th>LYTD</th>
                    <th>vs LY</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
    `;
}


// ============================================================================
// PATTERN 10: EVENT HANDLING
// ============================================================================

function attachEventListeners() {
    // Mode toggle
    document.querySelectorAll('.mode-toggle-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            handleModeToggle(e.target.dataset.mode);
        });
    });
    
    // Tab clicks
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            handleTabClick(e.target.dataset.tab);
        });
    });
    
    // Filter changes
    const monthSelect = document.querySelector('#month-select');
    if (monthSelect) {
        monthSelect.addEventListener('change', (e) => {
            handleMonthChange(e.target.value);
        });
    }
    
    const comparisonSelect = document.querySelector('#comparison-select');
    if (comparisonSelect) {
        comparisonSelect.addEventListener('change', (e) => {
            handleComparisonChange(e.target.value);
        });
    }
    
    // File upload
    const fileInput = document.querySelector('#file-input');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileUpload);
    }
}

function handleModeToggle(mode) {
    state.dashboardMode = mode;
    state.activeTab = mode === 'C-OVERVIEW' ? 'scorecard' : 'explorer';
    render();
}

function handleTabClick(tab) {
    state.activeTab = tab;
    render();
}

function handleMonthChange(month) {
    state.selectedMonth = month;
    render();
}

function handleComparisonChange(mode) {
    state.comparisonMode = mode;
    render();
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const text = e.target.result;
        
        try {
            state.museData = parseCSV(text);
            state.selectedMonth = getLatestMonth(state.museData);
            state.dataLoaded = true;
            render();
        } catch (error) {
            console.error('Parse error:', error);
            alert('Failed to parse file. Please check the format.');
        }
    };
    
    reader.readAsText(file);
}


// ============================================================================
// PATTERN 11: INITIALIZATION
// ============================================================================

function init() {
    render();
}

document.addEventListener('DOMContentLoaded', init);
