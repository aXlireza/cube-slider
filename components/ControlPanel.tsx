import React from 'react';

interface Props {
  onNextSimple: () => void;
  onNextComplex: () => void;
  onBack: () => void;
  onUnfoldBottom: () => void;
  onUnfoldRight: () => void;
}

export default function ControlPanel({
  onNextSimple,
  onNextComplex,
  onBack,
  onUnfoldBottom,
  onUnfoldRight,
}: Props) {
  return (
    <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
      <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={onNextSimple}>
        Next Simple
      </button>
      <button className="px-4 py-2 bg-purple-600 text-white rounded" onClick={onNextComplex}>
        Next Complex
      </button>
      <button className="px-4 py-2 bg-gray-700 text-white rounded" onClick={onBack}>
        Back
      </button>
      <button className="px-4 py-2 bg-green-700 text-white rounded" onClick={onUnfoldBottom}>
        Unfold Bottom
      </button>
      <button className="px-4 py-2 bg-green-700 text-white rounded" onClick={onUnfoldRight}>
        Unfold Right
      </button>
    </div>
  );
}
