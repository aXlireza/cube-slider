"use client";
import CubeScene from '@/components/CubeScene';

import { useCubeNavigation } from "@/components/useCubeNavigation";

export default function Home() {
  const navigate = useCubeNavigation();

  return (
    <main className="p-4">
      <button
        className="px-4 py-2 bg-gray-800 text-white rounded"
        onClick={() =>
          navigate(async () => {
            // await new Promise((r) => setTimeout(r, 1000));
            // const mod = await import("@/components/test-pages/PageOne");
            // return <mod.default />;
            return <>sasho</>
          })
        }
      >
        Go to Page One
      </button>
    </main>
  );
