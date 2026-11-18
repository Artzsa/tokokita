# Frontend Implementation Rules

> Framework-agnostic baseline. The detected project stack and established repository conventions take precedence.

## 1. Stack discovery

Identify before implementation:
- Framework and version
- Language and type-checking setup
- Package manager and lockfile
- Router and rendering model
- Styling approach and design tokens
- Component library and icon system
- Data fetching and state management
- Form validation
- Test, lint, formatting, and build tools

Do not assume React, Next.js, Tailwind, or any specific stack. Do not add a framework or library just because it is familiar.

## 2. Component design

- Components should have one clear responsibility.
- Keep state as close as practical to where it is used.
- Separate domain/business logic from visual rendering when it improves clarity.
- Prefer composition over deeply nested conditionals and giant components.
- Extract shared components when there is real reuse or a stable domain concept.
- Avoid both extremes: copy-paste duplication and abstraction for a single trivial use.
- Keep props explicit and meaningful.
- Avoid hidden side effects during rendering.

## 3. State and data

- Distinguish server state, URL state, form state, and local UI state.
- Use the existing state/data libraries where appropriate.
- Handle loading, empty, error, stale, and success states.
- Avoid duplicate sources of truth.
- Validate and normalize external data at boundaries.
- Never hardcode fake production data or pretend an action succeeded.
- Provide optimistic updates only when rollback/error handling is designed.

## 4. HTML, accessibility, and interaction

- Use semantic elements (`button`, `a`, `nav`, `main`, `form`, headings, lists) correctly.
- Use buttons for actions and links for navigation.
- Every form control needs a programmatic label and useful validation feedback.
- Ensure keyboard operation and visible `:focus-visible` treatment.
- Maintain logical heading order and landmark structure.
- Provide accessible names for icon-only controls.
- Manage focus for dialogs, menus, and route transitions where needed.
- Do not use clickable `div` elements when native controls are appropriate.
- Do not communicate errors or status through color alone.

## 5. CSS and styling

- Follow the project's current styling strategy.
- Use design tokens for repeated values.
- Avoid `!important`, deeply nested selectors, magic numbers, and global overrides unless justified.
- Avoid styling that depends on fragile DOM structure.
- Keep responsive rules understandable and content-driven.
- Avoid fixed heights for content-heavy sections.
- Prevent overflow, layout shift, and text clipping.
- Do not create a second competing design system.

## 6. Responsive behavior

Check at minimum:
- Narrow mobile: approximately 320–375 CSS px
- Typical mobile: approximately 390–430 CSS px
- Tablet: approximately 768–1024 CSS px
- Desktop: approximately 1280–1440 CSS px

These are test ranges, not mandatory breakpoints. Choose breakpoints based on content.

Verify:
- Navigation and menus
- Multi-column layouts
- Tables and long labels
- Forms and validation messages
- Images and media
- Modals, drawers, and sticky elements
- Touch target size and spacing
- No unintended horizontal scrolling

## 7. Performance

- Avoid unnecessary client-side JavaScript.
- Lazy-load non-critical media and code where appropriate.
- Use framework-native image optimization when available.
- Avoid expensive effects and layout-thrashing patterns.
- Prevent unnecessary re-renders when they are measurable or structurally obvious.
- Reserve media dimensions to reduce layout shift.
- Do not optimize blindly; use available profiling or build evidence.

## 8. Security and privacy

- Do not render untrusted HTML without appropriate sanitization.
- Never put secrets in client-side bundles.
- Avoid logging personal or sensitive data.
- Use safe URL handling and validate external destinations.
- Follow the framework's protections for CSRF, XSS, authentication, and authorization.
- Do not rely on frontend checks as the only authorization boundary.

## 9. Content quality

- Use the product's real language and terminology.
- Write concise, specific interface copy.
- Button labels should describe outcomes (`Simpan perubahan`, not `Submit` when Indonesian is the product language).
- Provide useful empty and error messages with next steps.
- Do not invent social proof, metrics, reviews, or claims.
- Keep localization and date/number formats consistent with the audience.

## 10. Dependencies and generated code

- Prefer native platform features and existing dependencies.
- Before adding a dependency, explain the capability gap it solves.
- Check project license and maintenance context when practical.
- Do not hand-edit generated files unless required.
- Remove unused imports and newly introduced dead code.

## 11. Definition of done

Frontend work is not complete until:
- The intended behavior works.
- The rendered UI has been inspected at relevant viewports.
- Keyboard and focus behavior are checked.
- Loading, empty, and error states are addressed where relevant.
- Console/build errors introduced by the change are resolved.
- Relevant tests and checks are run or explicitly marked unavailable.
