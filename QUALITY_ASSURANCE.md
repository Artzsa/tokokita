# Quality Assurance & Release Checklist

> Verification must be evidence-based. Run checks that exist in the repository; do not invent scripts or claim checks that were not performed.

## 1. Before testing

- [ ] Confirm acceptance criteria.
- [ ] Inspect the diff for unrelated changes.
- [ ] Identify available test, lint, type-check, and build commands.
- [ ] Confirm required environment variables and services without exposing secrets.
- [ ] Check whether migrations, fixtures, or generated files are involved.

## 2. Functional testing

- [ ] Primary user journey works end to end.
- [ ] Every visible button and link has the intended behavior.
- [ ] Forms validate required and invalid input.
- [ ] Success and failure feedback is clear.
- [ ] Loading states prevent confusing duplicate actions where needed.
- [ ] Empty states explain what the user can do next.
- [ ] Navigation, back behavior, and deep links work where relevant.
- [ ] Authentication and authorization are enforced at the correct boundary.
- [ ] Data persists and refreshes correctly where applicable.

## 3. Responsive and visual testing

Inspect actual rendered screens at relevant viewport sizes:
- [ ] Narrow mobile (320–375 CSS px)
- [ ] Typical mobile (390–430 CSS px)
- [ ] Tablet (768–1024 CSS px)
- [ ] Desktop (1280–1440 CSS px)

Check:
- [ ] No unintended horizontal overflow.
- [ ] No clipped text, controls, or images.
- [ ] Navigation works at each breakpoint.
- [ ] Typography and spacing remain readable.
- [ ] Content hierarchy is preserved.
- [ ] Forms and tables remain usable.
- [ ] Sticky elements and overlays do not obscure content.
- [ ] Images have appropriate crop and dimensions.
- [ ] Design remains coherent in long-content and empty states.

## 4. Accessibility

- [ ] Keyboard-only navigation is possible.
- [ ] Focus is visible and follows a logical order.
- [ ] Controls have accessible names and labels.
- [ ] Semantic landmarks and heading hierarchy are sensible.
- [ ] Images have appropriate alt treatment.
- [ ] Color contrast is adequate.
- [ ] Status is not communicated by color alone.
- [ ] Dialogs and menus manage focus appropriately.
- [ ] Reduced-motion preference is respected.
- [ ] Errors are associated with relevant form fields.

Use automated accessibility tooling if already available, but do not treat an automated score as proof of full accessibility.

## 5. Technical checks

Run applicable repository commands:
- [ ] Formatter check
- [ ] Linter
- [ ] Type checker
- [ ] Unit tests
- [ ] Integration or end-to-end tests
- [ ] Production build

Also inspect:
- [ ] Browser console errors
- [ ] Failed network requests
- [ ] Server/runtime logs relevant to the change
- [ ] Dependency and lockfile changes
- [ ] Unexpected bundle or asset growth when measurable

## 6. Security and data integrity

- [ ] No secrets or credentials committed.
- [ ] Untrusted input is validated.
- [ ] Authorization is not frontend-only.
- [ ] No unsafe HTML injection introduced.
- [ ] Sensitive data is not exposed in logs or client bundles.
- [ ] Existing data contracts and migrations are handled safely.

## 7. Regression and diff review

- [ ] Existing affected behavior still works.
- [ ] No unrelated files were modified.
- [ ] No debug code or temporary artifacts remain.
- [ ] No fake content, dead links, or inert controls remain.
- [ ] New dependencies are justified.
- [ ] Documentation is updated where needed.

## 8. Severity

Classify findings:
- **Blocker:** data loss, security exposure, core flow unusable, app cannot build/start.
- **High:** major feature broken, serious accessibility issue, major responsive failure.
- **Medium:** partial workflow defect, confusing UX, notable visual regression.
- **Low:** minor polish, non-critical copy or spacing issue.

Do not release with open Blocker or High issues unless the user explicitly accepts the risk.

## 9. Evidence-based completion report

Use this format:

### Implemented
- Brief list of completed changes.

### Verification
- `command` — PASS / FAIL / NOT RUN, with concise evidence.
- Browser/device/viewport checks actually performed.

### Known limitations
- Remaining defects, unavailable tooling, or untested areas.

### Follow-up
- Only concrete next steps, if any.

Never claim "fully tested", "bug-free", "production-ready", or "pixel-perfect" without evidence supporting that exact claim.
