# Paper World — 3D Portfolio

A single-page, hand-drawn "paper world" portfolio. Scroll moves a camera down a
3D corridor (Three.js) through five scenes — Home, About, Works, Skills, Contact —
while an HTML layer provides text, forms, navigation, and accessibility.

No build step. No frameworks. Just:

```
index.html
style.css
script.js
```

## Run it

Any of these work:

- Double-click `index.html` (most browsers allow `file://` + ES module imports;
  if yours blocks it, use a local server instead).
- `npx serve .`
- `python3 -m http.server 8080` then open `http://localhost:8080`

Three.js and GSAP load from CDN (jsDelivr), so you need an internet connection
the first time each script is cached.

## Customize your content

Everything content-related lives at the top of `script.js` — no HTML editing
required:

```js
const profile = { name: "...", role: "...", tagline: "...", about: "..." };
const projects = [ { title, category, year, description, technologies, url }, ... ];
const skillGroups = [ { category: "FRONTEND", items: [...] }, ... ];
const ropeSkills = [["JavaScript", "js"], ...]; // [label, file in assets/images/skills]: one drawing each in the sky room (second door)
```

Add or remove a project and its poster board is generated automatically and
placed along the corridor wall. The same goes for skills.

## Structure

- `index.html` — semantic markup, loading screen, modal, map menu (About / Skill / Project), cursor, contact form.
- `style.css` — paper/ink design tokens, layout, responsive rules, reduced-motion rules.
- `script.js` — Three.js scene, scroll → camera mapping, hover/click interactions,
  custom cursor, mouse parallax, and the contact-form "message in a bottle" animation.
- `assets/` — empty on purpose. Everything visual (posters, textures, borders) is
  generated procedurally on `<canvas>` at runtime, so there's nothing to break if
  you don't add real images. Drop your own into `assets/images` and swap them into
  `paperCanvas()`-based textures whenever you're ready.

## Notes on behavior

- **No WebGL?** The site falls back to a plain, scrollable paper-styled page with
  the same content (see `body.no-webgl` rules in `style.css`).
- **`prefers-reduced-motion: reduce`** turns off camera parallax, floating
  object animation, and hover tweens; camera movement still follows scroll,
  just without easing/damping.
- **Keyboard**: every button and form field is focusable; the project modal
  closes on `Escape` and returns focus to whatever opened it.
