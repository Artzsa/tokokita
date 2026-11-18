# Design System & Visual Direction

> Project-level visual guidance. This is a decision framework, not a preselected aesthetic or a license to redesign everything.

## 1. Design intent

Before styling, define:
- Product purpose: what the interface helps people accomplish.
- Primary audience: who uses it, in what context, and with what constraints.
- Main user task: the most important action or information.
- Brand character: 3–5 concrete adjectives, supported by rationale.
- Content character: formal, friendly, technical, editorial, community-oriented, etc.
- Accessibility and device constraints.

Do not invent brand attributes. If no brand direction exists, propose a restrained direction and label assumptions.

## 2. Visual hierarchy

Establish hierarchy in this order:
1. Information architecture and content priority
2. Typography
3. Layout, grid, and spacing
4. Color and contrast
5. Borders, surfaces, and elevation
6. Illustration, iconography, and motion

Use visual emphasis sparingly. If every element is prominent, nothing is prominent.

## 3. Tokens

Create or reuse design tokens rather than scattering arbitrary values. Define tokens appropriate to the existing styling system:

- Color: page/background, surface, text, muted text, border, primary, secondary, accent, success, warning, danger, focus.
- Typography: font family, display, heading, body, small text, line heights, weights, letter spacing.
- Spacing: a coherent scale; use it consistently.
- Radius: a small purposeful set, not rounded-everything.
- Elevation: none / subtle / raised only where layering needs to be communicated.
- Motion: duration, easing, and reduced-motion behavior.
- Layout: content max-width, breakpoints, grid/gutter, navigation dimensions.

Prefer semantic token names (`--color-text-muted`) over names tied to a specific component (`--blue-for-card`).

Do not blindly introduce a new token system if the repository already has a coherent one. Document the existing source of truth.

## 4. Color

- Use color to communicate hierarchy, brand, and state.
- Maintain readable contrast for text and controls.
- Avoid using color alone to communicate status.
- Avoid large saturated backgrounds unless they are part of a deliberate brand direction.
- Do not add gradient backgrounds by default.
- Keep neutral surfaces and text relationships consistent.

## 5. Typography

- Use a clear type scale with a limited number of sizes and weights.
- Choose fonts based on language support, readability, licensing, performance, and brand fit.
- Avoid excessive all-caps, tiny low-contrast labels, and long lines of text.
- Use comfortable line-height and readable measure for paragraphs.
- Headings should describe content, not merely decorate the page.

## 6. Layout and composition

- Use a consistent grid and alignment logic.
- Give content room to breathe without wasting viewport space.
- Align related elements and group information by meaning.
- Use cards only when grouping or separation improves comprehension.
- Vary composition when content roles differ; do not force every section into identical grids.
- Keep primary actions obvious and secondary actions quiet.
- Design empty, loading, error, and long-content states.

## 7. Components

For each reusable component, define:
- Purpose and when to use it
- Variants and sizes
- Interactive states: default, hover, focus-visible, active, disabled, loading, error
- Responsive behavior
- Accessibility semantics

Reuse established components before creating new ones. Avoid premature abstraction and one-off component libraries.

## 8. Iconography and imagery

- Use one consistent icon family already present in the project.
- Icons must have a clear meaning; provide accessible names or hide decorative icons from assistive technology.
- Do not use emoji as a substitute for product iconography.
- Use genuine, licensed, relevant imagery. Do not fabricate logos, endorsements, or documentary evidence.
- Specify image crop, aspect ratio, and responsive behavior.
- Provide useful alt text for informative images; empty alt text for decorative images.

## 9. Motion

- Motion must clarify state change, hierarchy, or spatial relationships.
- Keep transitions short and restrained.
- Avoid autoplay, parallax, constant movement, and decorative animation without user value.
- Support `prefers-reduced-motion`.
- Never make essential information available only through animation.

## 10. Anti-template review

Before accepting a screen, ask:
- Could this screen belong to almost any unrelated SaaS product? If yes, make the content and composition more specific.
- Is the page relying on gradients, cards, and shadows instead of hierarchy?
- Are repeated sections visually repetitive without a reason?
- Does the design reflect the actual audience, brand, and content?
- Is the primary action clear?
- Does the mobile composition feel intentional?
- Is every decorative element earning its place?

## 11. Design decisions record

For significant UI work, record a short rationale:
- Audience and primary task
- Visual direction and why it fits
- Token choices or existing system reused
- Key responsive decisions
- Accessibility considerations
- Known compromises
