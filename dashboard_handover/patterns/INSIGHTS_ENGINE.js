/* ============================================================================
   MUSE DASHBOARD — INSIGHTS ENGINE
   
   Copy this entire file into your implementation.
   Do not modify the rules unless instructed.
   ============================================================================ */


// ============================================================================
// INSIGHT RULES
// ============================================================================

const INSIGHT_RULES = [
    
    // ========================================
    // CRITICAL (Red) - Show first, priority 1
    // ========================================
    
    {
        id: 'sales_below_target_critical',
        severity: 'critical',
        priority: 1,
        icon: '🔴',
        condition: function(row) {
            return row.Key === 'SLS_TTL' && 
                   row.Market !== 'All Markets' && 
                   row.vs_Target !== null &&
                   row.vs_Target < -0.05;
        },
        message: function(row) {
            return `${row.Market} sales ${formatPct(Math.abs(row.vs_Target))} below target — requires attention`;
        }
    },
    
    {
        id: 'members_declining_critical',
        severity: 'critical',
        priority: 1,
        icon: '🔴',
        condition: function(row) {
            return row.Key === 'MBR_TTL' && 
                   row.Market !== 'All Markets' && 
                   row.vs_LYTD !== null &&
                   row.vs_LYTD < -0.10;
        },
        message: function(row) {
            return `${row.Market} members down ${formatPct(Math.abs(row.vs_LYTD))} vs last year — investigate churn`;
        }
    },
    
    {
        id: 'penetration_drop_critical',
        severity: 'critical',
        priority: 1,
        icon: '🔴',
        condition: function(row) {
            return row.Key === 'SLS_PEN' && 
                   row.Market !== 'All Markets' && 
                   row.vs_LYTD !== null &&
                   row.vs_LYTD < -0.02;
        },
        message: function(row) {
            return `${row.Market} penetration dropped ${formatPP(Math.abs(row.vs_LYTD))} — losing market share`;
        }
    },
    
    // ========================================
    // WARNING (Yellow) - Priority 2
    // ========================================
    
    {
        id: 'crossbrand_declining',
        severity: 'warning',
        priority: 2,
        icon: '🟡',
        condition: function(row) {
            return row.Key === 'PCT_XBP' && 
                   row.Market !== 'All Markets' && 
                   row.vs_LYTD !== null &&
                   row.vs_LYTD < -0.01;
        },
        message: function(row) {
            return `${row.Market} cross-brand rate declining (${formatPP(row.vs_LYTD)} vs LY) — review program engagement`;
        }
    },
    
    {
        id: 'redemption_declining',
        severity: 'warning',
        priority: 2,
        icon: '🟡',
        condition: function(row) {
            return row.Key === 'PCT_RDM' && 
                   row.Market !== 'All Markets' && 
                   row.vs_LYTD !== null &&
                   row.vs_LYTD < -0.01;
        },
        message: function(row) {
            return `${row.Market} redemption rate down (${formatPP(row.vs_LYTD)} vs LY) — check reward relevance`;
        }
    },
    
    {
        id: 'aov_declining',
        severity: 'warning',
        priority: 2,
        icon: '🟡',
        condition: function(row) {
            return row.Key === 'AVG_AOV' && 
                   row.Market !== 'All Markets' && 
                   row.vs_LYTD !== null &&
                   row.vs_LYTD < -0.05;
        },
        message: function(row) {
            return `${row.Market} average order value down ${formatPct(Math.abs(row.vs_LYTD))} — review pricing/mix`;
        }
    },
    
    {
        id: 'frequency_declining',
        severity: 'warning',
        priority: 2,
        icon: '🟡',
        condition: function(row) {
            return row.Key === 'AVG_ATF' && 
                   row.Market !== 'All Markets' && 
                   row.vs_LYTD !== null &&
                   row.vs_LYTD < -0.05;
        },
        message: function(row) {
            return `${row.Market} visit frequency down ${formatPct(Math.abs(row.vs_LYTD))} — engagement opportunity`;
        }
    },
    
    {
        id: 'sales_slightly_below_target',
        severity: 'warning',
        priority: 2,
        icon: '🟡',
        condition: function(row) {
            return row.Key === 'SLS_TTL' && 
                   row.Market !== 'All Markets' && 
                   row.vs_Target !== null &&
                   row.vs_Target >= -0.05 &&
                   row.vs_Target < 0;
        },
        message: function(row) {
            return `${row.Market} sales ${formatPct(Math.abs(row.vs_Target))} below target — monitor closely`;
        }
    },
    
    // ========================================
    // POSITIVE (Green) - Priority 3
    // ========================================
    
    {
        id: 'sales_beating_target',
        severity: 'positive',
        priority: 3,
        icon: '🟢',
        condition: function(row) {
            return row.Key === 'SLS_TTL' && 
                   row.Market !== 'All Markets' && 
                   row.vs_Target !== null &&
                   row.vs_Target > 0.05;
        },
        message: function(row) {
            return `${row.Market} sales ${formatPct(row.vs_Target)} above target — strong performance`;
        }
    },
    
    {
        id: 'crossbrand_high',
        severity: 'positive',
        priority: 3,
        icon: '🟢',
        condition: function(row) {
            return row.Key === 'PCT_XBP' && 
                   row.Market !== 'All Markets' && 
                   row.YTD > 0.25 && 
                   row.vs_LYTD !== null &&
                   row.vs_LYTD > 0.01;
        },
        message: function(row) {
            return `${row.Market} cross-brand rate at ${formatPct(row.YTD)} (+${formatPP(row.vs_LYTD)} vs LY) — program success`;
        }
    },
    
    {
        id: 'new_members_surge',
        severity: 'positive',
        priority: 3,
        icon: '🟢',
        condition: function(row) {
            return row.Key === 'MBR_NEW' && 
                   row.Market !== 'All Markets' && 
                   row.vs_LYTD !== null &&
                   row.vs_LYTD > 0.15;
        },
        message: function(row) {
            return `${row.Market} new member acquisition up ${formatPct(row.vs_LYTD)} — growth momentum`;
        }
    },
    
    {
        id: 'sales_strong_growth',
        severity: 'positive',
        priority: 3,
        icon: '🟢',
        condition: function(row) {
            return row.Key === 'SLS_TTL' && 
                   row.Market !== 'All Markets' && 
                   row.vs_LYTD !== null &&
                   row.vs_LYTD > 0.15;
        },
        message: function(row) {
            return `${row.Market} sales up ${formatPct(row.vs_LYTD)} vs last year — excellent growth`;
        }
    },
    
    {
        id: 'redemption_improving',
        severity: 'positive',
        priority: 3,
        icon: '🟢',
        condition: function(row) {
            return row.Key === 'PCT_RDM' && 
                   row.Market !== 'All Markets' && 
                   row.vs_LYTD !== null &&
                   row.vs_LYTD > 0.02;
        },
        message: function(row) {
            return `${row.Market} redemption rate up ${formatPP(row.vs_LYTD)} — members engaging with rewards`;
        }
    },
    
    // ========================================
    // INFORMATIONAL (Blue) - Priority 4
    // ========================================
    
    {
        id: 'engagement_flat',
        severity: 'info',
        priority: 4,
        icon: '📊',
        condition: function(row) {
            return row.Key === 'PCT_XBP' && 
                   row.Market === 'All Markets' && 
                   row.vs_LYTD !== null &&
                   Math.abs(row.vs_LYTD) < 0.005;
        },
        message: function(row) {
            return `Overall cross-brand rate stable at ${formatPct(row.YTD)}`;
        }
    }
];


// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatPct(value) {
    if (value === null || value === undefined) return '—';
    return (value * 100).toFixed(1) + '%';
}

function formatPP(value) {
    if (value === null || value === undefined) return '—';
    const sign = value >= 0 ? '+' : '';
    return sign + (value * 100).toFixed(1) + 'pp';
}


// ============================================================================
// INSIGHT GENERATION FUNCTION
// ============================================================================

function generateInsights(data, month) {
    const insights = [];
    const seen = new Set();  // For deduplication
    
    // Filter to specified month
    const monthData = data.filter(row => row.Month === month);
    
    // Run each rule against each row
    for (const row of monthData) {
        for (const rule of INSIGHT_RULES) {
            try {
                if (rule.condition(row)) {
                    // Deduplicate by rule + market
                    const key = `${rule.id}_${row.Market}`;
                    if (seen.has(key)) continue;
                    seen.add(key);
                    
                    insights.push({
                        id: rule.id,
                        severity: rule.severity,
                        priority: rule.priority,
                        icon: rule.icon,
                        message: rule.message(row),
                        market: row.Market,
                        kpi: row.Key
                    });
                }
            } catch (e) {
                // Skip rules that error (defensive)
                console.warn(`Insight rule ${rule.id} error:`, e);
            }
        }
    }
    
    // Sort by priority (lower = more important), then severity
    const severityOrder = { critical: 1, warning: 2, positive: 3, info: 4 };
    
    insights.sort((a, b) => {
        if (a.priority !== b.priority) return a.priority - b.priority;
        return severityOrder[a.severity] - severityOrder[b.severity];
    });
    
    // Return top 5
    return insights.slice(0, 5);
}


// ============================================================================
// RENDER FUNCTION
// ============================================================================

function renderInsightsPanel(insights, expanded) {
    if (insights.length === 0) {
        return `
            <div class="insights-panel">
                <div class="insights-header">
                    <span class="insights-title">📊 KEY INSIGHTS</span>
                </div>
                <div class="insights-body">
                    <div class="insights-empty">No notable insights for this period.</div>
                </div>
            </div>
        `;
    }
    
    const insightRows = insights.map(insight => `
        <div class="insight-row insight-${insight.severity}">
            <span class="insight-icon">${insight.icon}</span>
            <span class="insight-text">${insight.message}</span>
        </div>
    `).join('');
    
    return `
        <div class="insights-panel ${expanded ? 'expanded' : 'collapsed'}">
            <div class="insights-header">
                <span class="insights-title">📊 KEY INSIGHTS</span>
                <button class="insights-toggle" onclick="handleInsightsToggle()">
                    ${expanded ? 'Hide' : 'Show'}
                </button>
            </div>
            <div class="insights-body" style="display: ${expanded ? 'block' : 'none'}">
                ${insightRows}
            </div>
        </div>
    `;
}


// ============================================================================
// CSS FOR INSIGHTS
// ============================================================================

/*
.insights-panel {
    background: var(--light-bg);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-lg);
    margin-bottom: var(--space-lg);
}

.insights-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-md) var(--space-lg);
    border-bottom: 1px solid var(--border-light);
}

.insights-title {
    font-weight: var(--weight-semibold);
    color: var(--text-dark);
}

.insights-toggle {
    background: none;
    border: none;
    color: var(--steel-blue);
    cursor: pointer;
    font-size: var(--font-small);
}

.insights-body {
    padding: var(--space-md) var(--space-lg);
}

.insight-row {
    display: flex;
    align-items: flex-start;
    gap: var(--space-sm);
    padding: var(--space-sm) 0;
}

.insight-row:not(:last-child) {
    border-bottom: 1px solid var(--border-light);
}

.insight-icon {
    flex-shrink: 0;
    font-size: var(--font-body);
}

.insight-text {
    color: var(--text-primary);
    font-size: var(--font-body);
    line-height: var(--line-height-normal);
}

.insight-critical { }
.insight-warning { }
.insight-positive { }
.insight-info { }

.insights-empty {
    color: var(--text-muted);
    font-style: italic;
    text-align: center;
    padding: var(--space-md);
}
*/
