# Soft project-color transition

Active files: `dist/color-transition68.js`, `dist/color-transition68.css`.
The module uses the existing `PortfolioProjects.projectAppearance()` configuration;
colors remain exclusively in `dist/projects.js`. The homepage color comes from
`PortfolioTheme.home`. There are no new dependencies or color settings.

## Tuning
At the top of `color-transition68.js`:
- `DUUR = 1500`: full reveal duration.
- `ZACHT = 280`: soft gradient edge width.
- `CONTENT_FADE_MS = 450`: outgoing content fade, starting halfway through.

Radius is updated by requestAnimationFrame via `--r`; cubic ease-in-out controls
progress. No CSS variable interpolation, mask-image, or @property is used by this
module. Existing logo masks are unrelated and unchanged.

## Router integration
The existing hash router calls:
1. `PortfolioColorTransition.beforeRoute(project, initial, resume)` before rendering.
   If true, rendering is deferred. The module invokes `resume` after the reveal.
2. `PortfolioColorTransition.afterRoute(project)` after synchronous rendering.
   This resolves the handoff. Keep these calls paired in a future router adapter.

The module intercepts ordinary same-page links before hash navigation, so the
outgoing page remains visible until the animation ends. Native Back/Forward is
handled by the beforeRoute adapter. Modified clicks/new tabs remain native.
The overlay is appended outside both main pages and removed only after the new
background has painted. `project-background-ready` releases the existing gallery
reveal. Never unmount the overlay during the router handoff.

The app reads `getHomeScroll()` to initialize its existing overview restoration.
The sessionStorage key is `219:overview-scroll`; reads/writes are guarded so private
storage failures do not interrupt navigation. RESPECT_REDUCED_MOTION is false for this prototype, as requested. This forces the reveal even when the browser reports reduced motion. Set it to true for the live site; then reduced motion skips the reveal and gallery fade. The existing global CSS continues to disable unrelated motion. Uncolored projects navigate normally.

## Stacking and content
The fixed overlay has z-index 0. Main pages/footer have z-index 1; the original
absolute header and fixed logo/menu/copyright positions are retained. Only outgoing
page content fades; fixed navigation/logo/copyright remain usable and visible.

## Baseline
This change starts from the restored published version 65 (commit be196371...),
not the abandoned radial62 / fade63 / direct64 experiments. Old unreferenced
experimental files are retained in version history but are not loaded by index.html.

## Prototype correction (67)
The user's browser reports prefers-reduced-motion: reduce. Version 66 therefore correctly bypassed the reveal under the previous requirement, but made it impossible to evaluate the prototype visually. RESPECT_REDUCED_MOTION = false now explicitly allows this one reveal and its gallery fade. Other animations and the device preference remain unchanged. The supplied CSS is adapted to the existing absolute header and root --page-bg token so the header position and single color source are preserved.


## Return direction (68)
Opening still expands the color from the clicked photograph. Returning now uses a reversed radial gradient centered on the viewport: the transparent opening shrinks from the farthest corner plus softness to zero, so the homepage color advances from the screen edges inward. Timing, softness, scroll restoration, and the prototype reduced-motion override are unchanged.



Terug naar #werk: de projectinhoud vervaagt eerst. De router herstelt het archief en de vorige scrollpositie onder een volledig gekleurd vlak. Daarna krimpt de zachte projectkleur in 1500 ms naar de oorspronkelijke aangeklikte foto. Bij directe projectlinks of een ander project wordt de bijbehorende cover gebruikt en zo nodig in beeld gebracht. Terug naar info behoudt de bestaande rand-naar-midden-overgang.


Directe terugweg (79): de toekomstige fotopositie wordt vóór de animatie gemeten zonder tussentijdse paint. Het kleurvlak begint direct op het eerste frame te krimpen, terwijl de projectinhoud vervaagt. Na 450 ms herstelt de router het archief onder hetzelfde doorlopende kleurvlak. Totale duur: 1500 ms; geen herstart bij het wisselen van pagina.
