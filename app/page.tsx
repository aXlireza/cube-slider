"use client";

import { useCubeNavigation } from "@/components/useCubeNavigation";

export default function CubePage() {
  const navigate = useCubeNavigation();

  return (
    <main className="p-4">
      <button
        className="px-4 py-2 bg-gray-800 text-white rounded"
        onClick={() =>
          navigate(async () => {
            await new Promise((r) => setTimeout(r, 1500));
            return (
              <div>Next page loaded at {new Date().toLocaleTimeString()}</div>
            );
          })
        }
      >
        Load Next Page
      </button>
    </main>
  );
}
