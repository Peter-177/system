Production Web Interface Design Rules

You are building a production web interface. The rules below are constraints, not suggestions.

When a rule conflicts with what you were about to generate, the rule wins.

The goal is not simply to "avoid a list of things." It is to make a deliberate choice in each place where the default would be decoration. If you remove a banned element and put nothing considered in its place, the result is worse, not better.

1. Colour

Choose ONE accent colour.

Everything else is neutral, using a single family of greys with a consistent temperature. Use all warm or all cool greys, never mixed.

A second colour is allowed only when it carries meaning: destructive, success, or warning.

Never use colour merely for variety.

Banned

Blue-to-purple and indigo-to-violet gradients, anywhere.

Gradient text using background-clip: text.

Giving each feature, category, or section its own hue.

A feature grid must use the same colour for every card.

Do not ship a framework's default palette untouched. Define your own tokens.

Accent usage

Keep accent usage under 10% of the visible surface. If the page looks colourful, the accent has been overused.

2. Depth and separation

Do not use a drop shadow on anything that is not genuinely floating above the page.

Cards, sections, images, inputs, badges, and static buttons get no shadow.

Shadows are permitted only on true overlays such as dropdowns, popovers, modals, and toasts.

Keep overlay shadows tight and low-opacity.

Separate blocks using, in order of preference:

A 1px border

A background step

Whitespace

Do not stack multiple shadows.

Pick one border-radius value and use it everywhere.

Pick one border colour and use it everywhere.

3. Icons and emoji

Banned

Never use sparkle or AI-shimmer glyphs such as ✨, ✦, ✧, or 🪄.

Do not use emoji as UI in headings, buttons, feature lists, badges, navigation, or empty states.

Icon rules

Use one real icon set: Lucide, Heroicons, or Phosphor.

Use one stroke weight.

Icons are monochrome and inherit currentColor.

Inline icons: 16–20px.

Standalone icons: 24px.

No decorative icons at 48px+.

No icon containers

Never place an icon inside a tinted rounded square, circle, border, coloured chip, or other decorative container.

The icon sits directly on the background at text size.

If a feature is clear from its label, it does not need an icon.

4. Typography and copy

Banned words

Do not use these words in copy or headings:

unleash

supercharge

elevate

transform

revolutionise

empower

seamless

effortless

effortlessly

cutting-edge

game-changing

next-level

unlock

harness

robust

leverage

powerful

delve

paradigm

synergy

If a sentence survives after deleting an adjective, delete it.

Punctuation

The em dash — is banned in UI copy. Write two sentences or use a comma instead.

Copy principles

Use concrete nouns and real numbers.

Prefer "Export to CSV in one click" over "Seamlessly unlock your data's potential."

Typography system

Use one type family, or at most two: UI and mono.

Use a scale approximately:

12 / 14 / 16 / 20 / 24 / 32 / 48

Do not introduce arbitrary intermediate sizes.

Alignment and case

Body text is left-aligned.

Centre only short headings.

Never centre a paragraph longer than three lines.

Cap text measure at about 70 characters.

Use sentence case for headings and buttons.

Do not use Title Case Everywhere or ALL-CAPS except tiny labels with tracking.

5. Motion

Banned

Sliding arrows inside buttons.

Self-animating arrows or bouncing chevrons.

Looping idle motion.

Hover glow.

Box-shadow bloom.

scale() above 1.02.

Lift-on-hover for cards or buttons.

Scroll-triggered fade-ins on every section.

Parallax.

Typewriter effects.

Ticking counters.

Logo marquees.

Allowed motion

Hover states should change background or border colour only, using 120–160ms ease-out.

Animate opacity and transform only.

UI feedback: 120–200ms

Entering elements: up to 300ms

Nothing should ease for half a second.

Always honour prefers-reduced-motion: reduce and disable non-essential motion.

6. Scale and proportion

Nothing should be oversized. Everything should be sized to its content and fit neatly.

Hero headline

Desktop: 40–56px

Mobile: 28–34px

Never 72px+

Body text

Body: 15–16px

Secondary: 13–14px

Nothing below 12px

Buttons

Height: 36–44px

Padding should fit the label.

Never full-width on desktop.

Use one primary and one secondary button when appropriate.

Section padding

Desktop: 64–96px vertical

Mobile: 40–56px vertical

Never 160px+

Content width

Maximum content width: 1100–1280px

Text columns: about 65–70 characters

Do not let text run across a full 1920px monitor.

Icons

Inline: 16–20px

Standalone: 24px

No decorative icons 48px+

Viewport usage

No section should be a full viewport tall just for visual impact. The hero should show that content continues below.

Cards

Size cards according to their content. Force equal heights only when the content is genuinely equal.

Spacing

Every spacing value must be a multiple of 4.

Elements in a row should share top and bottom edges. Related items should align to the same left edge.

Neatness comes from alignment and consistent spacing, not decoration.

7. Layout and structure

Banned: eyebrow badges

Do not place a meaningless pill above the hero such as "Introducing v2.0", "AI-Powered", "New", or "Trusted by developers".

If the information is important, put it in the headline.

Avoid generic templates

Do not reproduce the default:

Hero → Logo strip → Three features → Testimonial → Three pricing tiers → FAQ → Repeated CTA

Build only the sections the product actually needs, in the order a real user needs them.

Feature grids

Feature grids do not need to be three equal columns. Let real content determine the shape.

Uneven layouts are acceptable when they improve hierarchy.

Composition

Not everything should be centred.

Not everything should be a card.

Not every corner should be fully rounded.

Spacing system

Use one spacing scale based on a 4px base. Vertical rhythm should be visibly consistent.

8. Placeholder content

Mockup content is acceptable, but avoid generic placeholders.

Prefer:

Named companies

Testimonials referencing actual features

Specific, oddly precise numbers

Placeholder copy must still follow all copy rules.

Required states

Every relevant production interface should include real:

Empty states

Error states

Loading states

Their absence makes a build feel unfinished.

9. Code craft

Semantic HTML

Use semantic elements such as:

<header>

<nav>

<main>

<section>

<button>

<a>

A clickable <div> is a bug.

Accessibility

Use visible :focus-visible styles.

Keyboard order must match visual order.

Every image needs meaningful alt text.

Decorative images should use alt="".

Maintain contrast of at least 4.5:1 for body text and 3:1 for large text.

Do not rely on colour alone to communicate state.

Components

Reuse components instead of pasting repeated markup. If the same markup appears three times, extract it.

Design tokens

Use design tokens or theme values instead of scattered one-off values.

Code cleanliness

Delivered code must contain no dead code, commented-out blocks, unused imports, or placeholder TODOs.

Pre-Delivery Review

Before declaring the interface finished, go through every line and fix anything that violates these rules.

Any blue-to-purple or indigo-to-violet gradient left anywhere?

Any gradient text?

Does anything that is not floating still have a shadow?

Any sparkle glyph anywhere?

Any emoji used as interface UI?

Does any icon sit inside a tinted square, circle, or box?

Any em dash in the copy?

Any banned word from the copy list?

Does each feature or category have its own colour?

Does any button contain a moving arrow?

Does anything glow, lift, or scale on hover?

Is there a meaningless badge above the hero?

Is the hero headline above 56px?

Does any section exceed 96px of vertical padding?

Does any element look oversized next to the text beside it?

Final quality check

If a reviewer could tell this was generated in under five seconds, identify the specific detail that gave it away and fix it.

The final result should feel deliberately designed, restrained, coherent, and production-ready.