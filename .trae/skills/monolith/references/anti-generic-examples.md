# Anti-Generic Examples — DO / DON'T component reference

> **Read-only reference.** Concrete replacement patterns for components that weak LLMs reliably default to AI-generic shapes on. Every agent that designs or implements these components reads this file first.
>
> **Context.** Snippets use Tailwind-style utility classes for clarity, but substitute DS tokens and DS components per `ds-knowledge/tokens.json` and `component-index.json` in practice. The semantic values (OKLCH ranges, hairline opacities, motion timings) are what to carry over — not the literal Tailwind class names.
>
> **See also:** [rules/premium-aesthetic-standard.md](../rules/premium-aesthetic-standard.md), [rules/ai-generic-anti-patterns.md](../rules/ai-generic-anti-patterns.md), [references/premium-design-playbook.md](premium-design-playbook.md).

---

## § 1 — Error States

### ❌ DON'T — the canonical AI error state

```tsx
<div className="min-h-screen bg-gray-50 flex items-center justify-center">
  <div className="bg-white rounded-2xl shadow-md p-12 max-w-xl w-full text-center">
    <div className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center mx-auto mb-6">
      <XIcon className="w-10 h-10 text-white" />
    </div>
    <h1 className="text-2xl font-bold mb-2">Strategies could not be loaded</h1>
    <p className="text-gray-500 mb-6">Refresh the page. If this continues, contact support.</p>
    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold">
      Retry
    </button>
  </div>
</div>
```

This exhibits AI-01, AI-04, AI-08, AI-11, AI-18, AI-22, AI-25 — **compound fail**.

### ✓ DO — in-shell, specific, disciplined

```tsx
<div className="py-10 px-8">
  <div className="flex items-start gap-3 max-w-2xl">
    <AlertTriangle className="w-4 h-4 mt-0.5 text-accent-600 shrink-0" strokeWidth={1.75} />
    <div className="space-y-3">
      <div>
        <h2 className="text-[15px] font-medium tracking-[-0.01em] text-fg">
          We couldn't load your strategies
        </h2>
        <p className="text-sm text-fg-muted mt-1 tabular-nums">
          Request timed out after 30s. This usually resolves within a minute.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={retry}>Retry</Button>
        <Button size="sm" variant="ghost" onClick={openStatus}>
          Open status page
        </Button>
      </div>
      {errorCode && (
        <code className="inline-block font-mono text-xs text-fg-subtle bg-surface-raised px-2 py-1 rounded border border-black/5">
          {errorCode}
        </code>
      )}
    </div>
  </div>
</div>
```

Key moves:
- Left-aligned, inside the page shell (nav still visible).
- Small 16px icon in the accent color (not red); destructive red only for destructive state.
- Specific sentence naming what, why, next step.
- Two low-weight actions, not a giant blue pill.
- Mono code chip for support reference.

---

## § 2 — Empty States

### ❌ DON'T

```tsx
<div className="flex flex-col items-center justify-center py-24">
  <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mb-6">
    <Sparkles className="w-12 h-12 text-blue-600" />
  </div>
  <h2 className="text-2xl font-bold mb-2">No strategies yet!</h2>
  <p className="text-gray-500 mb-6 text-center">Get started by creating your first strategy.</p>
  <button className="bg-blue-600 text-white rounded-full px-8 py-3 font-semibold">
    Create your first strategy
  </button>
</div>
```

### ✓ DO — ghost scaffold + inline guidance

```tsx
<div className="relative">
  {/* Ghost skeleton of realistic sample rows */}
  <div className="space-y-0 opacity-[0.18] pointer-events-none">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="grid grid-cols-[1fr_120px_100px_60px] gap-4 px-4 h-10 items-center border-b border-black/[0.06]">
        <div className="h-3 bg-fg rounded-sm w-2/3" />
        <div className="h-3 bg-fg rounded-sm w-16" />
        <div className="h-3 bg-fg rounded-sm w-20" />
        <div className="h-3 bg-fg rounded-sm w-8" />
      </div>
    ))}
  </div>
  {/* Overlay guidance */}
  <div className="absolute inset-0 flex items-start justify-start pt-16 px-8">
    <div className="flex items-center gap-3">
      <p className="text-sm text-fg-muted">
        Create a strategy to see it here.
      </p>
      <Button size="sm" variant="ghost" onClick={create}>
        New strategy
      </Button>
      <kbd className="text-[11px] font-mono text-fg-subtle bg-surface-raised border border-black/[0.06] px-1.5 py-0.5 rounded">
        N
      </kbd>
    </div>
  </div>
</div>
```

Key moves: ghost shell of realistic data, sentence + ghost button + keyboard hint. No illustration, no pastel circle, no primary CTA.

---

## § 3 — Buttons (primary / secondary / ghost / destructive)

### ❌ DON'T

```tsx
<button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 py-3 shadow-md font-semibold">
  Save changes
</button>
```

AI-01, AI-09, AI-13.

### ✓ DO — near-black primary, tiered radii, tactile highlight

```tsx
// Primary — near-black on light mode, accent only when this is THE primary action
<button className="
  inline-flex items-center gap-1.5 h-9 px-3.5
  bg-fg text-bg
  rounded-[6px]
  text-[13px] font-medium
  shadow-[inset_0_1px_0_rgb(255_255_255_/_0.12)]
  transition-[background-color,opacity] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]
  hover:bg-fg/90
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg
  disabled:opacity-50
">
  Save changes
</button>

// Secondary — hairline-border ghost
<button className="
  inline-flex items-center gap-1.5 h-9 px-3.5
  bg-transparent text-fg
  rounded-[6px] border border-black/[0.08]
  text-[13px] font-medium
  transition-colors duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]
  hover:bg-fg/[0.04]
">
  Cancel
</button>

// Destructive — muted red, not Tailwind red-500
<button className="
  inline-flex items-center gap-1.5 h-9 px-3.5
  bg-[oklch(0.50_0.14_25)] text-white
  rounded-[6px]
  text-[13px] font-medium
  shadow-[inset_0_1px_0_rgb(255_255_255_/_0.10)]
  transition-colors duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]
  hover:bg-[oklch(0.47_0.14_25)]
">
  Delete strategy
</button>
```

Key moves: 6px radius (not full), near-black primary, subtle inset highlight, accent-ring focus, cubic-bezier easing.

---

## § 4 — Inputs

### ❌ DON'T

```tsx
<input
  type="text"
  placeholder="Enter your email"
  className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-blue-500"
/>
```

### ✓ DO — label above, hairline border, accent ring

```tsx
<label className="block">
  <span className="block text-[13px] font-medium text-fg mb-1.5">Email</span>
  <input
    type="email"
    className="
      w-full h-9 px-2.5
      bg-bg text-fg placeholder:text-fg-subtle
      rounded-[6px] border border-black/[0.08]
      text-[14px] tabular-nums
      transition-[border-color,box-shadow] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]
      focus:border-accent/60 focus:outline-none focus:ring-[3px] focus:ring-accent/15
    "
  />
  <span className="block text-xs text-fg-muted mt-1">
    We'll send a confirmation link to this address.
  </span>
</label>
```

---

## § 5 — Cards / Panels (the KPI tile)

### ❌ DON'T

```tsx
<div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
  <div className="flex items-center justify-between mb-4">
    <span className="text-gray-500 text-sm">Total Revenue</span>
    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
      <DollarSign className="w-5 h-5 text-blue-600" />
    </div>
  </div>
  <div className="text-3xl font-bold">$128,492</div>
  <div className="text-green-500 text-sm mt-2">↑ 12% from last month</div>
</div>
```

AI-04, AI-08, AI-11, AI-22.

### ✓ DO — naked block, tracking-wide label, serif-or-tabular display, tiny glyph delta

```tsx
<div className="py-4 pr-8 border-r border-black/[0.06] last:border-r-0">
  <div className="text-[11px] font-medium tracking-[0.08em] uppercase text-fg-muted">
    Total revenue
  </div>
  <div className="mt-1.5 text-[28px] font-medium tabular-nums tracking-[-0.02em] text-fg leading-none">
    $128,492
  </div>
  <div className="mt-2 flex items-center gap-1 text-[12px] tabular-nums text-fg-muted">
    <ArrowUpRight className="w-3 h-3 text-[oklch(0.55_0.12_150)]" strokeWidth={2} />
    <span className="text-[oklch(0.55_0.12_150)]">12.0%</span>
    <span>vs last month</span>
  </div>
  <Sparkline data={last30Days} className="mt-3 h-6 w-full text-fg-subtle" />
</div>
```

Key moves: no card shell, hairline divider instead, tracking-wide small-caps label, tabular numerics, tiny glyph arrow, neutral sparkline.

---

## § 6 — Tables

### ❌ DON'T

```tsx
<table className="w-full bg-white rounded-2xl shadow-md">
  <thead className="bg-gray-100">
    <tr>
      <th className="text-left px-4 py-3">Strategy</th>
      <th className="text-left px-4 py-3">Status</th>
    </tr>
  </thead>
  <tbody>
    <tr className="odd:bg-white even:bg-gray-50">
      <td className="px-4 py-3">...</td>
    </tr>
  </tbody>
</table>
```

Alternating rows, card-shell table, `bg-gray-100` header = AI-generic.

### ✓ DO — hairline dividers, sticky blurred header, tabular columns

```tsx
<div className="overflow-auto">
  <table className="w-full text-[13px]">
    <thead className="sticky top-0 bg-bg/80 backdrop-blur-md border-b border-black/[0.08]">
      <tr className="text-left text-[11px] font-medium tracking-[0.06em] uppercase text-fg-muted">
        <th className="px-4 h-9">Strategy</th>
        <th className="px-4 h-9">Owner</th>
        <th className="px-4 h-9 text-right tabular-nums">Patients</th>
        <th className="px-4 h-9 text-right tabular-nums">Updated</th>
        <th className="px-4 h-9">Status</th>
      </tr>
    </thead>
    <tbody>
      {rows.map((r) => (
        <tr
          key={r.id}
          className="
            h-10 border-b border-black/[0.05]
            transition-colors duration-100 ease-out
            hover:bg-fg/[0.03]
          "
        >
          <td className="px-4 text-fg font-medium">{r.name}</td>
          <td className="px-4 text-fg-muted">{r.owner}</td>
          <td className="px-4 text-right tabular-nums">{r.patients.toLocaleString()}</td>
          <td className="px-4 text-right tabular-nums text-fg-muted">{formatRelative(r.updated)}</td>
          <td className="px-4">
            <StatusDot tone={r.status} /> {r.status}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

Key moves: no card shell, no vertical gridlines, hairline horizontal dividers at 5–8% opacity, sticky-blur header, tabular numerics, right-aligned numerics, hover at 3% lightness shift, status-dot + text (color alone is not accessible).

---

## § 7 — Nav / Top Bar

### ❌ DON'T

```tsx
<nav className="bg-white shadow-md px-8 py-4 flex items-center justify-between">
  <div className="flex items-center gap-8">
    <Logo className="w-10 h-10" />
    <a className="text-gray-700">Strategies</a>
    <a className="text-gray-700">Audit log</a>
  </div>
  <button className="bg-blue-600 text-white rounded-full px-6 py-2">Sign up</button>
</nav>
```

### ✓ DO — hairline bottom, logo at product scale, nav inline, primary at same weight

```tsx
<header className="sticky top-0 z-40 h-12 bg-bg/80 backdrop-blur-md border-b border-black/[0.08]">
  <div className="h-full px-5 flex items-center justify-between">
    <div className="flex items-center gap-6">
      <Logo className="w-5 h-5 text-fg" />
      <span className="text-[13px] font-medium text-fg">InCare Strategy</span>
      <nav className="flex items-center gap-4">
        <NavLink end to="/" className={({ isActive }) =>
          `text-[13px] ${isActive ? 'text-fg' : 'text-fg-muted hover:text-fg'} transition-colors`
        }>
          Strategies
        </NavLink>
        <NavLink to="/audit" className={({ isActive }) =>
          `text-[13px] ${isActive ? 'text-fg' : 'text-fg-muted hover:text-fg'} transition-colors`
        }>
          Audit log
        </NavLink>
      </nav>
    </div>
    <div className="flex items-center gap-2">
      <button className="
        inline-flex items-center gap-1.5 h-7 px-2
        text-[12px] text-fg-muted
        rounded border border-black/[0.06]
        hover:bg-fg/[0.03]
      ">
        <SearchIcon className="w-3 h-3" strokeWidth={2} />
        Search
        <kbd className="ml-2 font-mono text-[10px] text-fg-subtle">⌘K</kbd>
      </button>
      <RoleSelect />
    </div>
  </div>
</header>
```

Key moves: 48px height (not 64+), logo at 20px, 13px nav links, active state = color shift (not a pill), `⌘K` affordance as a premium signal, hairline bottom + backdrop blur (not shadow).

---

## § 8 — Modals

### ❌ DON'T

```tsx
<Dialog>
  <DialogContent className="bg-white rounded-2xl shadow-2xl p-8">
    <div className="flex justify-between">
      <h2 className="text-2xl font-bold">Confirm action</h2>
      <button><X className="w-6 h-6" /></button>
    </div>
    <p className="text-gray-500 mt-4">Are you sure?</p>
    <div className="flex gap-4 mt-6">
      <button className="flex-1 border rounded-lg py-3">Cancel</button>
      <button className="flex-1 bg-blue-600 text-white rounded-lg py-3">Confirm</button>
    </div>
  </DialogContent>
</Dialog>
```

### ✓ DO — tiered radius, inner-top highlight, specific copy, accent ring focus

```tsx
<Dialog>
  <DialogOverlay className="
    fixed inset-0 z-50 bg-black/40 backdrop-blur-[6px]
    data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:duration-[180ms]
    data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:duration-[120ms]
  " />
  <DialogContent className="
    fixed left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 z-50
    w-full max-w-md p-6
    bg-bg rounded-[12px]
    border border-black/[0.06]
    shadow-[0_24px_48px_rgb(0_0_0_/_0.12),0_8px_16px_rgb(0_0_0_/_0.08),inset_0_1px_0_rgb(255_255_255_/_0.06)]
    data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:duration-[220ms]
  ">
    <h2 className="text-[16px] font-medium tracking-[-0.01em] text-fg">
      Reassign 847 patients?
    </h2>
    <p className="mt-2 text-[13px] text-fg-muted">
      All patients currently under Chris Martinez will be moved to the new owner.
      Prior audit entries remain attached to Chris.
    </p>
    <div className="mt-6 flex items-center justify-end gap-2">
      <Button variant="ghost" size="sm" onClick={close}>
        Cancel <kbd className="ml-2 font-mono text-[10px] text-fg-subtle">Esc</kbd>
      </Button>
      <Button size="sm" onClick={confirm}>
        Reassign <kbd className="ml-2 font-mono text-[10px] text-white/60">↵</kbd>
      </Button>
    </div>
  </DialogContent>
</Dialog>
```

Key moves: 12px radius (tiered), hairline border + layered shadow + inner-top highlight (light from above), specific copy ("Reassign 847 patients?" not "Are you sure?"), keyboard hints, named duration + ease.

---

## § 9 — Toasts / Notifications

### ❌ DON'T

```tsx
<div className="fixed top-4 right-4 bg-green-500 text-white rounded-xl shadow-lg p-4">
  <CheckCircle className="inline w-6 h-6 mr-2" />
  Success! Your strategy has been saved.
</div>
```

### ✓ DO — neutral surface with accent border-left, tight copy, 200/150 enter/exit

```tsx
<div
  role="status"
  className="
    fixed bottom-5 right-5 z-50
    flex items-start gap-3
    bg-surface-raised text-fg
    border border-black/[0.08] border-l-2 border-l-[oklch(0.55_0.12_150)]
    rounded-[8px] px-3.5 py-3 pr-6
    max-w-sm text-[13px]
    shadow-[0_8px_24px_rgb(0_0_0_/_0.12)]
    data-[state=open]:animate-in data-[state=open]:slide-in-from-right-2 data-[state=open]:duration-[200ms]
  "
>
  <Check className="w-4 h-4 mt-px text-[oklch(0.55_0.12_150)] shrink-0" strokeWidth={2} />
  <div>
    <div className="font-medium">Strategy saved.</div>
    <div className="text-fg-muted mt-0.5">Auto-activated for 12 cohorts.</div>
  </div>
</div>
```

---

## § 10 — Loading / Skeleton

### ❌ DON'T

```tsx
<div className="flex items-center justify-center py-32">
  <Spinner className="w-12 h-12 text-blue-600 animate-spin" />
  <span className="ml-4 text-gray-500">Loading...</span>
</div>
```

### ✓ DO — skeleton matches final shape

```tsx
<div className="divide-y divide-black/[0.05]">
  {Array.from({ length: 8 }).map((_, i) => (
    <div key={i} className="grid grid-cols-[1fr_140px_100px_80px] gap-4 px-4 h-10 items-center">
      <div className="h-3 rounded-sm bg-fg/[0.06] animate-[shimmer_1.4s_linear_infinite] w-[68%]" />
      <div className="h-3 rounded-sm bg-fg/[0.06] animate-[shimmer_1.4s_linear_infinite] w-[80%]" />
      <div className="h-3 rounded-sm bg-fg/[0.06] animate-[shimmer_1.4s_linear_infinite] w-[60%]" />
      <div className="h-3 rounded-sm bg-fg/[0.06] animate-[shimmer_1.4s_linear_infinite] w-[40%]" />
    </div>
  ))}
</div>
```

For >3s operations, show a labeled progress: `Processing 2,450 patients…`, not a spinner.

---

## § 11 — Focus ring (make every element premium with one rule)

Apply to every interactive element. This alone separates AI-generic from premium:

```css
/* On the :focus-visible state */
outline: none;
box-shadow: 0 0 0 2px oklch(var(--bg)), 0 0 0 4px oklch(0.55 0.12 var(--accent-h) / 0.55);
```

Or in Tailwind:

```tsx
focus-visible:outline-none
focus-visible:ring-2
focus-visible:ring-accent/55
focus-visible:ring-offset-2
focus-visible:ring-offset-bg
```

The default browser blue ring or no ring at all = AI-tell. A themed 2-offset ring = premium.

---

## § 12 — Theme tokens (suggested base for a premium default)

```css
:root {
  /* Accent hue — tune H per brand */
  --accent-h: 255;                       /* cobalt */
  --accent: oklch(0.55 0.14 var(--accent-h));

  /* Neutrals tinted toward accent at C: 0.005–0.02 */
  --bg:             oklch(0.99 0.005 var(--accent-h));
  --surface-raised: oklch(0.97 0.007 var(--accent-h));
  --fg:             oklch(0.18 0.01  var(--accent-h));
  --fg-muted:       oklch(0.45 0.015 var(--accent-h));
  --fg-subtle:      oklch(0.62 0.012 var(--accent-h));

  --border-hairline: oklch(0 0 0 / 0.06);

  /* Semantic */
  --success: oklch(0.55 0.12 150);
  --warning: oklch(0.70 0.14 80);
  --danger:  oklch(0.52 0.15 25);

  /* Radii — tiered */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 10px;
  --radius-xl: 14px;

  /* Shadow tiers */
  --shadow-1: 0 1px 0 rgb(0 0 0 / 0.04);
  --shadow-2: 0 4px 12px rgb(0 0 0 / 0.08);
  --shadow-3: 0 24px 48px rgb(0 0 0 / 0.12), 0 8px 16px rgb(0 0 0 / 0.08);

  /* Motion */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in:  cubic-bezier(0.7, 0, 0.84, 0);
}

[data-theme="dark"] {
  --bg:             oklch(0.14 0.01 var(--accent-h));
  --surface-raised: oklch(0.17 0.012 var(--accent-h));
  --fg:             oklch(0.96 0.005 var(--accent-h));
  --fg-muted:       oklch(0.68 0.012 var(--accent-h));
  --fg-subtle:      oklch(0.48 0.01  var(--accent-h));
  --border-hairline: oklch(1 0 0 / 0.08);
}
```

This is a **default** when brand.md does not prescribe tokens. If brand.md does prescribe tokens and they fall in the banned range (e.g., `#2563eb`), the aesthetic-director files an extension request.

---

## How to use this file

| Role | When to read | What to apply |
|---|---|---|
| lead-designer | Before writing `design_decisions.md § Per-section component table` | Cite the § here next to each component decision |
| aesthetic-director | During audit | Match proposed decisions to the DO pattern, flag deviations |
| developer | Before generating each component file | Copy the structural approach (NOT the Tailwind literals — use DS tokens) |
| design-qa | During runtime audit | Compare rendered output to the DO pattern |

---

## Related

- [rules/premium-aesthetic-standard.md](../rules/premium-aesthetic-standard.md) — prescriptive values backing these patterns.
- [rules/ai-generic-anti-patterns.md](../rules/ai-generic-anti-patterns.md) — the blacklist being avoided.
- [references/premium-design-playbook.md](premium-design-playbook.md) — knowledge base.
- [agents/aesthetic-director.md](../agents/aesthetic-director.md) — the gate.
