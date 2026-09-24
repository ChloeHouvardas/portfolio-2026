# AGENTS.md

## Design and Interaction Standards

- Treat every visual or interaction change as mobile-first. Start with small screens, then scale up for tablets, laptops, and larger displays.
- Preserve visual cohesiveness across the site. New sections, cards, controls, motion, spacing, typography, and color choices should feel consistent with the existing portfolio design.
- Make all interactions work across input modes: touch, mouse, keyboard, and trackpad where relevant.
- Test swipe, click, drag, hover, focus, and card-manipulation behaviors on narrow and wide viewports. Do not rely on hover-only behavior for essential actions.
- Keep layouts responsive and stable. Text, cards, buttons, media, and interactive elements should not overlap, clip unexpectedly, or become difficult to use at common mobile and laptop widths.
- Account for multi-browser compatibility when planning and implementing UI work. Avoid browser-specific behavior unless there is a fallback or the project already uses it safely.
- Prefer accessible interaction patterns: visible focus states, sufficient hit targets on touch screens, semantic controls, and keyboard-operable actions.
- When adding animations or gesture interactions, keep motion purposeful and performant on mobile devices.
- Before considering UI work complete, verify the affected experience at mobile and laptop sizes and check for obvious issues in modern Chromium, Safari/WebKit, and Firefox when practical.
