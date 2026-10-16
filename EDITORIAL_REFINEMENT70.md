# Editorial refinement — 70

## Typographic hierarchy
`dist/typography70.css` defines shared title/body/navigation/label/metadata/footnote
sizes, line heights and spacing tokens. Navigation remains SUSE Mono with the existing
Instrument Serif hover. Captions and years share 10px sizing and tabular numerals;
project introduction, expandable description and secondary links use distinct levels.
Title and intro reserve consistent line space so the opening image starts at the
same vertical position between projects at a given viewport. Expanded descriptions
can naturally push the gallery down.

## Curated opening images
`dist/projects70.js` adds `openingPhotoId` independently of the existing background
cover and photoIds. `photosForProject(project, photos)` promotes that opening to the
front and preserves the remaining order, with a safe fallback to the original first.
- binnen en buiten: foto-02, exterior architecture, then the interior detail.
- ontmoetingen: foto-07, people at the table, then street scene and portrait.
- langs de kust: foto-05, broad coastline, then the closer beach scene.

`renderProject` renders the opening in its own full-width row, preserves natural
aspect ratios and retains the traditional gallery below. Homepage sorting and
composition still use the original photoIds and are unchanged. Fullscreen browsing
follows the curated project order.

## Fullscreen handoff
`dist/viewer-transition70.js` preloads and decodes the requested image before touching
the displayed image. The current photograph and its caption/count remain visible
while loading. Once ready, a pointer-transparent outgoing snapshot and the actual
viewer image crossfade for `FADE_MS = 220`. Bounds match the outgoing photo's exact
rendered rectangle. The existing image node and gesture listeners are retained.
Request generations guard rapid input; close removes snapshots/effects and prevents
pending requests from appearing after closure. The existing 1 / n counter, keyboard,
wheel, image-half clicks, outside-click dismissal and focus restoration are preserved.

The existing prototype RESPECT_REDUCED_MOTION=false switch also enables this short
crossfade so it is visible in the owner's browser. With that switch true and reduced
motion enabled, image handoff is immediate after decoding.

## Files
Added projects70.js, typography70.css and viewer-transition70.js. Updated index.html
and the app renderer to use them. No colors, source image files, hover parameters,
logo behavior or soft page transitions were changed.

## Validation
Firefox and Chromium: all three projects use the configured opening photo and consistent first-image position. Decoded 220ms crossfade was verified at its midpoint with both images at 50% opacity; delayed loading retains the old photo. Rapid next input, counter, Escape/focus, original homepage order/sorting and return transition passed. Small-screen title alignment also checked at 320px; no console errors or horizontal overflow.

## Follow-up 71
viewer-transition71.js replaces the loaded viewer module. Subsequent fullscreen photo changes now cut directly once decoded, without a fade. Initial opening retains its short reveal. Counter, loading feedback, gestures, layout and request guards are unchanged.
