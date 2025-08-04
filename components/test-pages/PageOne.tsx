"use client";

import CubePage from '@/components/CubePage';
import CubeLink from '@/components/CubeLink';

function PageOneContent() {
  return (
    <div className="p-4 text-center">
      <h1 className="text-2xl mb-4">Test Page One</h1>
      <CubeLink
        href="/test2"
        className="px-4 py-2 bg-gray-800 text-white rounded"
      >
        Go to Page Two
      </CubeLink>
    </div>
  );
}

export default function PageOne() {
  return (
    <>
      <CubePage>
        <PageOneContent />
      </CubePage>
      <PageOneContent />
    </>
  );
}
