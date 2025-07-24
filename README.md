# 🧊 3D Cube Navigation UI with Face Unfolding – Three.js + React

A modular, interactive 3D navigation interface built using **Three.js** and **React**. Each face of the cube represents a content window (like a page), and users can:

- 🔁 Navigate "Back" and "Forward" through face rotations  
- 🔍 Zoom out → rotate → zoom in for smooth transitions  
- 🔽 Dynamically unfold bottom or right adjacent faces from the current face  
- ✨ Easily extendable with content overlays or dynamic routing

---

## 📦 Features

- ⚙️ **Three.js** rendering with custom camera control
- 🚀 Smooth animations using [`@tweenjs/tween.js`](https://github.com/tweenjs/tween.js)
- 🧭 Rotation history tracking (`Back` / `Forward` navigation)
- 🔽 Fold and unfold transitions with configurable pivots and axes
- 🔧 Easy to customize: color, geometry, face labels, textures, or even HTML overlays

---

## 🛠 Usage

Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

`SmoothCube` accepts an array of six face configurations:

```tsx
import SmoothCube, { defaultFaces } from "@/components/SmoothCube";

const faces = defaultFaces.map((f, i) => ({
  ...f,
  content: <div className="p-4">Face {i + 1}</div>,
}));

export default function Page() {
  return <SmoothCube faces={faces} />;
}
```

Each face can render any React node and will rotate smoothly using simple or
complex navigation buttons.
