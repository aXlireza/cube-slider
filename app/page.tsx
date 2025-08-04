'use client';

import CubePage from '@/components/CubePage';
import CubeLink from '@/components/CubeLink';

function HomeContent() {
  return (
    <div className="p-4 text-center">
      <h1 className="text-2xl mb-4">Home</h1>
      <p className="mb-4">Content rendered on the cube face.</p>
      <CubeLink
        href="/test1"
        className="px-4 py-2 bg-gray-800 text-white rounded"
      >
        Go to Test Page One
      </CubeLink>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <CubePage>
        <HomeContent />
      </CubePage>
      <HomeContent />
    </>
  );
}
