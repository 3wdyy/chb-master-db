# MUSE Dashboard Project

## CRITICAL CONSTRAINTS (Read First, Apply Always)

```
╔══════════════════════════════════════════════════════════════════════════════╗
║  1. PLAN BEFORE CODE: Output implementation plan before writing ANY code     ║
║  2. EXTEND NOT REBUILD: Modify reference/Dashboard.html, don't start fresh   ║
║  3. MATCH PATTERNS: Use ONLY patterns from patterns/ folder                  ║
║  4. PHASE GATES: Complete each phase fully before starting the next          ║
║  5. NO SHORTCUTS: Implement all specified features completely                ║
║  6. DYNAMIC DIMENSIONS: Extract brands/markets/channels from data at runtime ║
║  7. MUSE ONLY: Remove all MC mode references from existing dashboard         ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

## Mission

Build a dual-mode analytics dashboard for the **MUSE loyalty program** (MUSE only, no MC):
- **C-Overview Mode (P1)**: Executive scorecards, auto-insights, trends — BUILD THIS
- **M-Depth Mode (P2)**: Marketing deep-dives, drill-downs — PLACEHOLDER FOR NOW (see specs/M_DEPTH.md)

---

## ⚠️ CRITICAL: First Actions (Do These Before Anything Else)

### 1. Read These Files First (In Order)
```
1. checklists/ANTI_PATTERNS.md    ← Learn what NOT to do
2. specs/ARCHITECTURE.md          ← Understand tech constraints
3. specs/C_OVERVIEW.md            ← P1 component specs
4. specs/DATA_SCHEMAS.md          ← Data format
5. patterns/CODE_PATTERNS.js      ← Code to copy/reference
```

### 2. Understand MC Mode Removal
The existing `reference/Dashboard.html` has ~47 lines of MC mode code scattered across multiple functions. **You must remove ALL of it:**
- Delete `mode: 'MUSE'` and `mcData: null` from state
- Delete `MC_KPI_CONFIG` object
- Delete `renderModeSelector()` function
- Delete all `if (state.mode === 'MC')` conditionals
- See `checklists/ANTI_PATTERNS.md` for specific patterns

### 3. Output Your Plan Before Any Code
Do NOT start coding until you have:
- [ ] Listed all functions you will add/modify
- [ ] Identified MC code to remove
- [ ] Asked any clarifying questions
- [ ] Received approval to proceed

---

## File Structure

```
├── CLAUDE.md                 ← You are here (read first)
├── specs/
│   ├── ARCHITECTURE.md       ← Tech decisions, state management
│   ├── C_OVERVIEW.md         ← P1 components specification
│   ├── M_DEPTH.md            ← P2 components specification (for later)
│   └── DATA_SCHEMAS.md       ← Data format documentation (P1 + P2)
├── patterns/
│   ├── DESIGN_TOKENS.css     ← CSS variables (copy exactly)
│   ├── CODE_PATTERNS.js      ← Working code to reference
│   └── INSIGHTS_ENGINE.js    ← Insight rules (copy exactly)
├── data/
│   ├── metrics_main.csv      ← Test data (primary)
│   └── metrics_trend.csv     ← Test data (trends)
├── reference/
│   └── Dashboard.html        ← Existing code to extend (remove MC mode)
└── checklists/
    ├── VALIDATION.md         ← Acceptance criteria (check at end)
    └── ANTI_PATTERNS.md      ← What NOT to do
```

## Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 1: UNDERSTAND                                                          │
│ • Read specs/ARCHITECTURE.md (tech stack, state)                            │
│ • Read specs/C_OVERVIEW.md (component specs)                                │
│ • Read specs/DATA_SCHEMAS.md (data format)                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 2: PLAN (Required before any code)                                     │
│ • Output your implementation plan for Phase 1                               │
│ • List specific functions to add/modify                                     │
│ • Identify any questions or uncertainties                                   │
│ • Wait for approval before proceeding                                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 3: BUILD (Phase by phase)                                              │
│ • Phase 1: Mode toggle + tab restructure                                    │
│ • Phase 2: Executive Scorecard tab (cards, insights, table)                 │
│ • Phase 3: Market Performance tab (bars, heatmap)                           │
│ • Phase 4: Trends tab (line charts)                                         │
│ • Reference patterns/ files while building                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 4: VALIDATE                                                            │
│ • Read checklists/VALIDATION.md                                             │
│ • Verify ALL criteria pass                                                  │
│ • Fix failures before declaring complete                                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Quick Reference

| Need | File |
|------|------|
| Tech stack, state management | specs/ARCHITECTURE.md |
| P1 component specs | specs/C_OVERVIEW.md |
| P2 component specs | specs/M_DEPTH.md |
| Data schemas (P1 + P2) | specs/DATA_SCHEMAS.md |
| CSS variables, colors | patterns/DESIGN_TOKENS.css |
| Working code patterns | patterns/CODE_PATTERNS.js |
| Insight rules (copy exactly) | patterns/INSIGHTS_ENGINE.js |
| What NOT to do | checklists/ANTI_PATTERNS.md |
| Acceptance criteria | checklists/VALIDATION.md |

## Key Technical Decisions

| Decision | Choice | Notes |
|----------|--------|-------|
| Data mode | MUSE only | Remove all MC mode code from existing dashboard |
| Dimensions | Dynamic | Extract brands/markets/channels from data, never hardcode |
| KPI scope | 12 KPIs | See KPI_CONFIG in patterns/CODE_PATTERNS.js |
| View modes | C-Overview / M-Depth | Only dashboard view toggle, not data mode toggle |

## Session Start Prompt

User should begin with:
```
I'm handing over a dashboard project. Please:

1. Read checklists/ANTI_PATTERNS.md first (critical mistakes to avoid)
2. Read specs/ARCHITECTURE.md (tech stack and state management)
3. Read specs/C_OVERVIEW.md (P1 component specifications)
4. Review patterns/CODE_PATTERNS.js (code to copy)
5. Examine reference/Dashboard.html briefly to understand existing structure

Then output your implementation plan for Phase 1:
- List functions to add
- List MC mode code to remove
- List any questions

Do NOT write any code until I approve the plan.
```

---

**REMEMBER**: Plan first. Remove MC mode. Extract dimensions from data. Match patterns exactly. No shortcuts.
