'use client';

import CubePage from '@/components/CubePage';
import Link from 'next/link';

export default function Home() {
  const faceContent = (
    <div className="p-4 text-center">
      <h1 className="text-2xl mb-4">Home</h1>
      <p>Content rendered on the cube face.</p>
    </div>
  );

  return (
    <>
      <CubePage>{faceContent}</CubePage>
      <div className="p-4">
        <Link
          href="/test1"
          className="px-4 py-2 bg-gray-800 text-white rounded"
        >
          Go to Test Page One
        </Link>
      </div>
    </>
  );
}
