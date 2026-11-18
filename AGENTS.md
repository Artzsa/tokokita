# Project Engineering & Anti-AI-Slop Standard

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

> Project-scoped instructions for OpenCode. Adapt these rules to the repository; do not assume a framework before inspecting it.

## 1. Mission

Build reliable, accessible, maintainable software with a deliberate product and visual identity. The goal is not to hide AI involvement. The goal is to avoid generic, careless, unverified output.

Priorities, in order:
1. Correctness and user needs
2. Usability and accessibility
3. Maintainability and clarity
4. Performance and security
5. Visual polish

## 2. Mandatory first pass: understand before editing

Before changing files:
- Inspect the repository tree, README, package/build manifests, existing routes, components, styles, tests, and relevant configuration.
- Identify the framework, language, package manager, styling system, component library, routing, data layer, and test tooling from evidence in the repo.
- Read relevant local instructions, including nested `AGENTS.md` files.
- Identify existing conventions and reuse them where sound.
- Find the actual commands for development, linting, type-checking, tests, and production build. Do not invent commands.
- Summarize the current architecture and proposed changes briefly.

Do not replace an existing architecture or introduce a new framework, UI library, state manager, or dependency without a clear need and explicit approval when the change is substantial.

If a requirement is ambiguous and materially affects architecture, data, security, or user experience, ask one focused question. Otherwise state a reasonable assumption and proceed.

## 3. Plan before implementation

For non-trivial work:
1. Restate the user outcome and acceptance criteria.
2. Identify affected pages, components, data flows, and states.
3. Propose a small implementation plan.
4. Identify risks, dependencies, and verification steps.
5. Wait for approval when the task explicitly requests planning/design approval; otherwise proceed in small, reviewable steps.

Do not start by generating an entire application in one pass.

## 4. Engineering rules

- Follow the conventions already present in the repository unless they are demonstrably harmful.
- Prefer simple, readable, cohesive modules over clever abstractions.
- Keep components focused; extract shared components only when repetition or domain meaning justifies it.
- Keep business logic out of presentation components where practical.
- Use semantic HTML and native platform behavior before custom solutions.
- Use the existing type system; avoid `any`, unsafe casts, and suppressed errors unless justified and documented.
- Validate untrusted input at system boundaries.
- Handle loading, empty, success, error, and disabled states where relevant.
- Avoid dead code, duplicate styles, unused dependencies, placeholder handlers, fake data presented as real, and TODOs that conceal unfinished requirements.
- Do not silently change APIs, schemas, routes, or persisted data contracts.
- Never edit generated or vendor files directly unless the task specifically requires it.
- Do not expose secrets, tokens, private user data, or environment values in code, logs, screenshots, or commits.

## 5. Anti-AI-slop design rules

- Do not default to the familiar AI landing-page formula: oversized centered headline, decorative gradient glow, three identical feature cards, floating blobs, and generic CTA.
- Do not add gradients, glassmorphism, excessive rounded cards, shadows, badges, or animation without a specific design reason.
- Do not use arbitrary icon sets, emoji as interface icons, or decorative elements that compete with content.
- Avoid repetitive card grids when editorial layouts, lists, tables, timelines, or direct typography would communicate better.
- Do not invent testimonials, customer logos, user counts, impact metrics, awards, certifications, or claims.
- Use content that reflects the product, audience, language, and actual functionality. No lorem ipsum in finished UI.
- Establish hierarchy through typography, spacing, alignment, contrast, and composition before decoration.
- Design mobile layouts intentionally; do not merely shrink desktop layouts.
- Every visible control must have a real, understandable action and appropriate feedback.
- Visual originality must come from the product's purpose and content, not random decoration.

## 6. Frontend and responsive requirements

Follow `FRONTEND_RULES.md` and `DESIGN_SYSTEM.md` when relevant. Use the repository's existing framework and styling conventions.

At minimum:
- Support the actual target viewport range, including narrow mobile screens.
- Prevent horizontal overflow and clipped content.
- Provide visible focus states and keyboard access.
- Respect reduced-motion preferences.
- Use appropriate labels, alt text, heading order, landmarks, and color contrast.
- Use responsive images and avoid layout shifts where possible.
- Check real rendered output, not only source code.

## 7. Workflow references

For interface or product work, follow `UI_UX_WORKFLOW.md`.
For verification, follow `QUALITY_ASSURANCE.md`.

Load those documents when the task touches their subject. Do not claim they were followed if they were not.

## 8. Change discipline

- Make the smallest complete change that solves the task.
- Do not rewrite unrelated files or reformat the entire repository.
- Preserve existing behavior unless a change is requested.
- Explain notable trade-offs.
- If a task expands beyond the agreed scope, pause and clarify.
- Keep dependencies minimal; explain why each new dependency is necessary.
- Do not overwrite user work. Inspect diffs and preserve unrelated modifications.

## 9. Completion report

Before reporting completion:
- Run the relevant checks that are available.
- Inspect the final diff.
- State what changed and where.
- List exact verification commands and their outcomes.
- Explicitly disclose checks not run and known limitations.
- Never say "all tests pass", "production-ready", or "fully responsive" without evidence.
