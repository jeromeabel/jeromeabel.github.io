## Self-review notes

- **Spec coverage:** every design.md mapping row has a task — Cover (T1), colors redundancy (T2), Elements dissolution + grouping + Sections (T3), token-usage/cross-ref/focus-ring (T4), spacing + motion FINDINGs (T5), readability §2 (T6), visual bugs (T7), dual-theme + closure (T8). Out-of-scope items (Pages responsive, SVG usage, hero visibility) deliberately absent.
- **Row-4 re-verify:** the design's "Colour already leads with role" claim is checked live in Task 4 Step 1, per the analysis note.
- **Icon dual-home:** sizing rules in Foundations (T4 S3), asset set in Components · Buttons (T3 S3 + dedupe rule in T4 S3) — neither dropped.
- **Names used consistently:** `DOCS / Design System — Light`, `CHAPTER / NN <Title>`, `GROUP / <Name>`, `ColorTokenTable`, `SpacingLadder`, `MotionSpecs`, `SECTION / Icons`, `CoverNav` — each defined where created and referenced by the same string later.
- **Known softness:** hex text labels in Task 2 are baked at build time — if a theme token changes later, re-run Task 2 Step 1+2 label update; the swatches themselves stay live-bound.
