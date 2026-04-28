# Accessibility checklists

Quick-reference a11y checklists consulted by designer, developer, and QAs.

## WCAG 2.2 AA — developer checklist

Use for every screen:

- [ ] All interactive elements reachable by keyboard (Tab / Shift-Tab).
- [ ] Visible focus indicator on every focusable element (DS default unless overridden).
- [ ] Skip-to-main-content link in the banner landmark.
- [ ] Every form input has a `<label>` OR `aria-label`.
- [ ] Every icon-only button has `aria-label`.
- [ ] Heading hierarchy is monotonic (no h3 without h2).
- [ ] Text color has ≥4.5:1 contrast against its background (3:1 for large text ≥24px or bold ≥19px).
- [ ] No info conveyed by color alone (add icon or text).
- [ ] Form errors announced via `role="alert"` or `aria-live`.
- [ ] Dynamic content changes announced via live regions.
- [ ] No keyboard traps.
- [ ] Focus returns to trigger when a dialog closes.
- [ ] Images have meaningful `alt` OR `alt=""` if decorative.
- [ ] Dark mode (if enabled) maintains contrast.

## WCAG 2.2 AA — designer checklist

- [ ] Touch targets ≥ 24×24 CSS px (44×44 for primary mobile CTAs).
- [ ] Text can scale to 200% without clipping.
- [ ] Meaningful heading hierarchy planned.
- [ ] Contrast tokens explicitly picked, not assumed.
- [ ] Loading / error / empty states designed.
- [ ] Motion respects `prefers-reduced-motion` (if motion tokens declare a reduced variant).

## Landmark plan (every page)

Required landmarks:
- `banner` — top bar / header
- `main` — primary content
- `navigation` — primary nav
- `contentinfo` — footer (if any)

Optional:
- `complementary` — sidebars, aside panels
- `search` — if a search box is present

## Announcement plan

- Toasts / notifications → `role="status"` (polite) or `role="alert"` (assertive).
- Route changes → announce title via live region.
- Form submission → announce success/failure.

## Color contrast quick math

- Body text: **4.5:1** minimum against its background.
- Large text (24px+ or 19px+ bold): **3:1**.
- UI components (buttons, focus rings, input borders): **3:1** against adjacent colors.

## References

- WCAG 2.2: https://www.w3.org/TR/WCAG22/
- WAI-ARIA 1.2: https://www.w3.org/TR/wai-aria-1.2/
- Inclusive Components (Heydon Pickering): https://inclusive-components.design/

## How these are used

Dev-qa runs axe-core which covers most of these programmatically. The checklists exist for the parts axe can't check (does the copy make sense, is the landmark semantically right).
