"use client";

import CubePage from '@/components/CubePage';
import CubeLink from '@/components/CubeLink';

export default function PageTwo() {
  const content = (
    <div className="p-4 text-center">
      <h1 className="text-2xl mb-4">Test Page Two</h1>
      <CubeLink
        href="/test3"
        className="px-4 py-2 bg-gray-800 text-white rounded"
      >
        Go to Page Three
      </CubeLink>
    </div>
  );

  return (
    <>
      <CubePage>{content}</CubePage>
      {content}
    </>
  );
}
