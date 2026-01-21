# MUSE Dashboard Project

## CRITICAL CONSTRAINTS (Read First, Apply Always)

```
╔══════════════════════════════════════════════════════════════════════════════╗
║  1. PLAN BEFORE CODE: Output implementation plan before writing ANY code     ║
║  2. EXTEND NOT REBUILD: Modify reference/Dashboard.html, don't start fresh   ║
║  3. MATCH PATTERNS: Use ONLY patterns from patterns/ folder                  ║
║  4. PHASE GATES: Complete each phase fully before starting the next          ║
║  5. NO SHORTCUTS: Implement all specified features completely                ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

## Mission

Build a dual-mode analytics dashboard:
- **C-Overview Mode (P1)**: Executive scorecards, auto-insights, trends — BUILD THIS
- **M-Depth Mode (P2)**: Marketing deep-dives — PLACEHOLDER ONLY

## File Structure

```
├── CLAUDE.md                 ← You are here (read first)
├── specs/
│   ├── ARCHITECTURE.md       ← Tech decisions, state management
│   ├── C_OVERVIEW.md         ← P1 components specification
│   └── DATA_SCHEMAS.md       ← Data format documentation
├── patterns/
│   ├── DESIGN_TOKENS.css     ← CSS variables (copy exactly)
│   ├── CODE_PATTERNS.js      ← Working code to reference
│   └── INSIGHTS_ENGINE.js    ← Insight rules (copy exactly)
├── data/
│   ├── metrics_main.csv      ← Test data (primary)
│   └── metrics_trend.csv     ← Test data (trends)
├── reference/
│   └── Dashboard.html        ← Existing code to extend
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
| What colors to use | patterns/DESIGN_TOKENS.css |
| How to format values | patterns/CODE_PATTERNS.js |
| Insight rule logic | patterns/INSIGHTS_ENGINE.js |
| Component specs | specs/C_OVERVIEW.md |
| Data structure | specs/DATA_SCHEMAS.md |
| What NOT to do | checklists/ANTI_PATTERNS.md |
| Acceptance criteria | checklists/VALIDATION.md |

## Session Start Prompt

User should begin with:
```
Read CLAUDE.md and the specs/ folder for the MUSE dashboard project.
Then output your implementation plan for Phase 1 before writing any code.
```

---

**REMEMBER**: Plan first. Extend existing code. Match patterns exactly. No shortcuts.
