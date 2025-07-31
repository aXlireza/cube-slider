# 🧊 Interactive 3D Cube

A minimal Next.js + Three.js setup that renders a responsive, animated cube. The cube is built with [`react-three-fiber`](https://github.com/pmndrs/react-three-fiber) and uses [`gsap`](https://greensock.com/gsap/) for buttery‑smooth animations.

## Features
- Six independent faces ready for custom HTML or canvas textures
- Buttons to rotate the cube to any face
- Ability to unfold the right or bottom face like a drawer
- Reset control to return the cube to its closed, front‑facing state
- Responsive sizing – the cube scales to the viewport and stays centered

## Getting started
```bash
npm install
npm run dev
```
Open http://localhost:3000 in your browser.

## Adding content to faces
`components/Cube.tsx` contains a helper `face()` function. Replace the placeholder `<div>` inside the `<Html>` block with your own markup or swap the `meshStandardMaterial` for a texture:
```tsx
<Html center>
  <div className="p-2 text-xs">Your content</div>
</Html>
```

## Manual controls
The overlay buttons show how to drive the cube programmatically. Each button calls one of the methods exposed by the cube:
- Rotate to front/back/left/right/top/bottom
- Unfold right or bottom face
- Reset

These controls can be replaced with your own UI or tied into routing/state logic.

## Build for production
```bash
npm run build
```

The cube component is self‑contained and can be dropped into other pages or apps.
