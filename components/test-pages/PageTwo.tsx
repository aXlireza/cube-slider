"use client";

import CubePage from '@/components/CubePage';
import { useCubeNavigation } from "@/components/useCubeNavigation";

export default function PageTwo() {
  const navigate = useCubeNavigation();

  const content = (
    <div className="p-4 text-center">
      <h1 className="text-2xl mb-4">Test Page Two</h1>
      <button
        className="px-4 py-2 bg-gray-800 text-white rounded"
        onClick={() =>
          navigate(async () => {
            await new Promise((r) => setTimeout(r, 1000));
            const mod = await import("./PageThree");
            return <mod.default />;
          })
        }
      >
        Go to Page Three
      </button>
    </div>
  );

  return (
    <>
      <CubePage>{content}</CubePage>
      {content}
    </>
  );
}
