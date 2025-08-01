"use client";

import { useCubeNavigation } from "@/components/useCubeNavigation";

export default function TestPageTwo() {
  const navigate = useCubeNavigation();

  return (
    <div className="p-4 text-center">
      <h1 className="text-2xl mb-4">Test Page Two</h1>
      <button
        className="px-4 py-2 bg-gray-800 text-white rounded"
        onClick={() =>
          navigate(async () => {
            await new Promise((r) => setTimeout(r, 1000));
            const mod = await import("../test3/page");
            return <mod.default />;
          })
        }
      >
        Go to Page Three
      </button>
    </div>
  );
}
