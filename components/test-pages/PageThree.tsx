"use client";

import CubePage from '@/components/CubePage';
import CubeLink from '@/components/CubeLink';

function PageThreeContent() {
  return (
    <div className="p-4 text-center">
      <h1 className="text-2xl mb-4">Test Page Three</h1>
      <CubeLink
        href="/test1"
        className="px-4 py-2 bg-gray-800 text-white rounded"
      >
        Back to Page One
      </CubeLink>
    </div>
  );
}

export default function PageThree() {
  return (
    <>
      <CubePage>
        <PageThreeContent />
      </CubePage>
      <PageThreeContent />
    </>
  );
}
