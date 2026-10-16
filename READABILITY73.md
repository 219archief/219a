# Readability — audit item 2

- theme73.js picks the higher contrast of existing dark ink #161616 and white,
  sets --page-ink before paint and updates it with the existing theme/router hook.
- On #846C5B this selects white, raising normal text contrast from 3.69:1 to about
  4.90:1. The home and blue project keep their original dark ink/background colors.
- Text, navigation, project metadata, fullscreen text and focus outlines follow ink.
  Logo image-only inversion and the independently adaptive footer masks are retained.
- Captions: 12px; years/metadata: 11px; copyright: 11px; project intro: 16px desktop /
  15px mobile; description: 14px; mobile menu: 12px. All font families are retained.
- No changes to project image order, free canvas, hover parameters, page transitions,
  direct fullscreen switching, prototype motion setting, copy or contact address.
- This changes only audit item 2. The separate mobile #werk entry issue is not changed.

The contrast statement applies to solid page backgrounds, not every inverted glyph
above a photograph. Physical-device readability and a full accessibility audit are
separate checks.

Validated in Firefox and Chromium at 320, 390 and 1440px: all three solid project palettes reach at least 4.5:1 for normal text; captions, years and footer use the intended sizes; mobile footer columns do not collide; fullscreen and returning to the overview retain the correct ink and direct image change. No console errors or horizontal overflow in these checks.

## Follow-up 74 — user preference
Normal text is restored to the original dark #161616 on all solid project backgrounds, including brown and fullscreen. The footer's base ink follows this choice while its grayscale image-only inversion is retained. Larger type sizes from 73 remain. This overrides the earlier automatic white text selection at the owner's request.
