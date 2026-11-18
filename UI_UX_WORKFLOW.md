# UI/UX Workflow: Discovery to Delivery

> Use this workflow for new pages, features, redesigns, and significant interaction changes. Scale the depth to the size of the task.

## Phase 1 — Discovery

1. Read the request and identify the user outcome.
2. Inspect the existing product, routes, components, content, and constraints.
3. Identify primary users, context of use, and accessibility needs.
4. List known facts, assumptions, and unanswered questions.
5. Review existing analytics, research, or design references if supplied.

Deliverable:
- Problem statement
- Target user and context
- Primary task
- Constraints and assumptions
- Success criteria

Do not invent research findings or claim to have interviewed users.

## Phase 2 — Information architecture

1. Identify content and actions users need.
2. Group information by user intent, not by implementation convenience.
3. Define navigation, page hierarchy, and key paths.
4. Remove redundant steps and competing calls to action.

Deliverable:
- Sitemap or page outline
- Key user flow
- Content hierarchy

## Phase 3 — UX specification

For each important flow, define:
- Entry point
- User action
- System response
- Validation and feedback
- Loading, empty, success, and error states
- Recovery path
- Accessibility and keyboard behavior

Deliverable:
- Interaction specification
- State inventory
- Acceptance criteria

## Phase 4 — Visual direction

1. Review brand assets and existing visual language.
2. Define visual attributes with rationale.
3. Reuse or propose tokens for color, type, spacing, radius, and motion.
4. Choose composition based on content and user task.
5. Select imagery and iconography that are relevant and permitted.

Deliverable:
- Short visual direction
- Token plan
- Component inventory
- Responsive approach

Avoid generic template patterns. Do not use decoration to compensate for weak information architecture.

## Phase 5 — Wireframe and review

Create low-fidelity structure before polishing when the task is substantial:
- Page sections and hierarchy
- Navigation and primary actions
- Content density
- Responsive stacking behavior
- Important states

Review against the success criteria. If the user requested approval before coding, stop and wait.

## Phase 6 — Implementation

1. Confirm the relevant existing components and conventions.
2. Implement the smallest complete vertical slice.
3. Keep behavior, content, and styling aligned with the specification.
4. Test each interaction as it is built.
5. Avoid unrelated refactors.

For larger work, implement in reviewable increments:
- Shell/navigation
- Main content and primary flow
- Secondary states
- Responsive and accessibility refinement

## Phase 7 — Visual and usability review

Inspect the actual rendered interface, not just source code.

Review:
- Visual hierarchy and consistency
- Content clarity and scannability
- Alignment, spacing, and typography
- Responsive composition
- Interaction feedback
- Keyboard and focus behavior
- Empty, loading, error, and success states
- Unnecessary decoration or repetitive layouts

Capture screenshots when browser tooling is available and useful. Compare against the approved direction, not an imagined reference.

## Phase 8 — Iterate and hand off

Fix the highest-impact issues first:
1. Broken behavior
2. Confusing flow or unclear content
3. Accessibility failures
4. Responsive defects
5. Visual inconsistencies
6. Minor polish

Handoff must include:
- What was implemented
- Important design/UX decisions
- Files or routes affected
- Checks performed and results
- Known gaps and follow-up work

## Lightweight task mode

For a small change (copy edit, isolated bug, tiny component adjustment), do not force a full design process. Inspect the relevant context, make the focused change, and run proportionate checks.
