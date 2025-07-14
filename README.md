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

<!-- ## 🖼 Demo

https://user-your-demo-url-if-applicable.com

--- -->

## 🛠 Installation

```bash
git clone https://github.com/your-username/3d-cube-navigator.git
cd 3d-cube-navigator
pnpm install # or npm install
pnpm dev     # or npm run dev
