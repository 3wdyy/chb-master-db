# How to Use This Handover Package

## Quick Start (Copy-Paste Ready)

### Step 1: Start a New Claude Session

Open a new conversation with Claude (claude.ai or API).

### Step 2: Upload All Files

Upload the entire `dashboard_handover` folder, or upload these files individually:
- CLAUDE.md
- specs/ARCHITECTURE.md
- specs/C_OVERVIEW.md
- specs/DATA_SCHEMAS.md
- patterns/DESIGN_TOKENS.css
- patterns/CODE_PATTERNS.js
- patterns/INSIGHTS_ENGINE.js
- data/metrics_main.csv
- data/metrics_trend.csv
- reference/Dashboard.html
- checklists/VALIDATION.md
- checklists/ANTI_PATTERNS.md

### Step 3: Send This First Message

Copy and paste this exactly:

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

### Step 4: Let Claude Plan

Claude should respond with an implementation plan. Review it. If it looks good, say:

```
Plan looks good. Proceed with Phase 1 implementation.
```

### Step 5: Iterate Through Phases

After each phase, Claude should:
- Present the completed code
- Explain what was built
- Show how to test it

You can then:
- Test in your browser
- Request modifications
- Approve and move to next phase

---

## What to Expect

### Phase 1 Output (~30 min)
- Mode toggle added to header
- Tab structure updated for C-Overview
- Basic navigation working

### Phase 2 Output (~45 min)
- Hero KPI cards
- Insights panel with auto-generated insights
- Full KPI table

### Phase 3 Output (~30 min)
- Market comparison bars
- Performance heatmap

### Phase 4 Output (~45 min)
- Monthly trend SVG chart
- YTD cumulative chart

---

## If Something Goes Wrong

### Claude skips planning
Say: "Stop. Please output your implementation plan before writing any code. Read CLAUDE.md — specifically the 'First Actions' section."

### Claude rebuilds from scratch
Say: "Don't rebuild. Extend the existing Dashboard.html in reference/. Read the ANTI_PATTERNS.md file."

### Claude uses external libraries
Say: "No external libraries. Use vanilla JavaScript only. Check ANTI_PATTERNS.md."

### Claude hardcodes markets or brands
Say: "Don't hardcode dimensions. Use `getUniqueDimensionValues()` to extract from data. Read ANTI_PATTERNS.md — this is the #1 mistake."

### Claude keeps MC mode code
Say: "Remove all MC mode code. This is MUSE only. The only mode toggle is C-Overview / M-Depth, not MUSE/MC."

### Claude outputs incomplete code
Say: "Complete this fully. No TODOs or placeholders. Implement all functionality."

### Claude forgets the design system
Say: "Use CSS variables from DESIGN_TOKENS.css. No hardcoded colors."

---

## Testing Your Dashboard

1. Save Claude's output as a `.html` file
2. Open in Chrome/Firefox/Safari
3. Upload `data/metrics_main.csv` via the file upload
4. Verify:
   - Mode toggle works
   - Tabs switch correctly
   - Data displays properly
   - No console errors

---

## Package Contents Summary

| File | Purpose | When to Read |
|------|---------|--------------|
| CLAUDE.md | Entry point, constraints | Always first |
| specs/ARCHITECTURE.md | Tech stack, state | Phase 1 |
| specs/C_OVERVIEW.md | Component specs | All phases |
| specs/DATA_SCHEMAS.md | Data format | When parsing data |
| patterns/DESIGN_TOKENS.css | CSS variables | When styling |
| patterns/CODE_PATTERNS.js | Code examples | When implementing |
| patterns/INSIGHTS_ENGINE.js | Insight rules | Phase 2 |
| data/*.csv | Test data | Testing |
| reference/Dashboard.html | Existing code | Always |
| checklists/VALIDATION.md | Acceptance criteria | End of each phase |
| checklists/ANTI_PATTERNS.md | What not to do | When stuck |

---

## Expected Total Time

- **First complete build**: 2-3 hours of interaction
- **Iterations/fixes**: 30-60 minutes additional
- **Polish and refinement**: As needed

---

## Questions?

If the dashboard session Claude has questions about:
- **Data schemas**: Reference specs/DATA_SCHEMAS.md
- **Business logic**: Ask the user (you)
- **Pipeline output**: Return to the pipeline session (this session)

Good luck!
