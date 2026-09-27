@AGENTS.md

Motion on this site is CSS-only: `[data-inview]` with `InViewObserver`, `.reveal`, the `.pen-*` classes and the scroll-driven timelines in `src/app/globals.css`. The `motion` library was removed for page speed (home Lighthouse 80 → 94), so skill advice that reaches for Motion or GSAP does not apply here: build new motion in CSS.
