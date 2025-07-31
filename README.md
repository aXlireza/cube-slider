# 🧊 Interactive 3D Cube – Next.js + React Three Fiber

This project showcases a modular 3D cube component built with **Next.js**, **react-three-fiber** and **drei**. The cube acts as a futuristic navigation UI – each face can host custom content and the cube animates smoothly between faces.

## ✨ Features
- Six visible faces rendered with Three.js
- GPU‑accelerated rotations with easing
- Optional unfolding of the right or bottom face
- Responsive scaling based on viewport size
- Control panel to rotate to any face, unfold panels, or reset

## 🚀 Getting Started
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) and play with the buttons in the top toolbar.

## 🧱 Adding Content
Each face is rendered by `CubeFace.tsx` using a `<Html>` overlay. Replace the `content` string in `faceData` inside `CubeScene.tsx` with any React component or texture to map custom visuals onto that face.

## 🕹 Manual Controls
The `ControlPanel` component exposes buttons for:
- Rotating to a specific face (`Front`, `Back`, `Left`, `Right`, `Top`, `Bottom`)
- Unfolding the panel to the **right** or **bottom** (direction adapts to available screen space)
- Resetting the cube to its initial state

You can also trigger these programmatically by calling `rotateTo(faceIndex)` or `toggleUnfold('right' | 'bottom')` inside `CubeScene.tsx`.

## 📄 License
MIT
