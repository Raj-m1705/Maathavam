# Maathavam Consulting — repaired website

## Replace the old version

Copy this folder's contents into your website repository root, preserving your repository's own `.git` folder. The original presentation decks are not needed for hosting.

Delete these obsolete animation files from your repo:
- `cinematic.css` and `cinematic.js`
- `interactive.css` and `interactive.js`
- `feather-experience.css` and `feather-experience.js`
- `opening.css` and `opening.js`

The supplied `index.html` already references ONLY:
- `style.css`: responsive layout and component appearance
- `motion.css`: feather, opening and hover appearance
- `script.js`: tabs, single-open services, navigation, EmailJS enquiry sending
- `motion.js`: one coordinated opening/scroll/hover controller

Do not append the previous chat patches to these replacement files.

## Run locally

From this folder run:

```sh
python -m http.server 8000
```

Then open http://localhost:8000 in your browser. No npm installation or build step is needed.

## Hosting

Use a static site preset with this folder as the publish directory. No build command or server backend is required. Keep `assets/` alongside `index.html`. All imagery and scripts are local, with no third-party CDN dependency.

## Behaviour retained

- Three-second black-and-gold opening, Skip intro and fail-safe dismissal.
- Reload starts at the top; incoming hash anchors are intentionally cleared to match the requested opening experience.
- Founder portrait in Leadership, prominent peacock feather in the hero.
- Feather moves behind content on scroll, with lower opacity after the hero.
- Exactly one service expands at a time, including business-priority selection.
- Accessible service and delivery tabs with arrow-key navigation.
- Stable hover lift and pointer tilt on cards; mobile gets lighter effects.
- Slower entrances trigger at approximately 77% of viewport height.
- Progress line, Back to top and motion preference control.
- Enquiry form sends directly through EmailJS using the configured Zoho mail service.
- EmailJS public keys are intended for browser use. Restrict allowed origins in EmailJS to the production site and any local test origin.

## Fixes

Removed overlapping observers, repeated DOM wrapping and conflicting transform/scale overrides. Scroll measurements now use stable outer shells. Entrance movement is applied to a dedicated child; hover movement is applied to a separate child. The feather's stacking order no longer places it beneath opaque section backgrounds. It uses your supplied transparent PNG unchanged. The original cinematic feather lift and gold-edged curtain are restored within the single motion controller.

## Validation

JavaScript syntax checks passed for both scripts. Checked all local assets, fragment links, unique IDs, 11 service entries and SVG XML validity. Live visual/browser verification was unavailable because the browser could not connect to the local preview. Before production, check desktop and phone layouts, the intro, keyboard tabs, accordion, hover transitions and reduced-motion preferences in your browser.

## Section and hover refinement
Restored open section headings with an eyebrow rule, two-column introduction and gold scroll line. Service summaries have consistent padding in both states, rounded borders, and flexible text columns. Experience cards have padded rounded surfaces. Text cards lift without scaling or 3D rotation; portrait cards retain restrained tilt. Contact form and copy have transparent backgrounds. Entrances also cover delivery panels, section introductions, fact cards and contact content. The referenced GitHub Pages HTML was retrieved and matches the originally supplied ZIP. Styling was reconciled against that source.