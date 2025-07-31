'use client';

interface Props {
  onRotate: (face: number) => void;
  onUnfold: (dir: 'right' | 'bottom') => void;
  onReset: () => void;
}

const labels = ['Front', 'Right', 'Back', 'Left', 'Top', 'Bottom'];

export default function ControlPanel({ onRotate, onUnfold, onReset }: Props) {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-sm">
      <div className="flex flex-wrap justify-center gap-2">
        {labels.map((label, idx) => (
          <button
            key={label}
            className="px-3 py-1 rounded bg-black text-white hover:bg-gray-700"
            onClick={() => onRotate(idx)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="flex gap-2 mt-2">
        <button
          className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
          onClick={() => onUnfold('right')}
        >
          Unfold Right
        </button>
        <button
          className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
          onClick={() => onUnfold('bottom')}
        >
          Unfold Bottom
        </button>
        <button
          className="px-3 py-1 rounded bg-gray-500 text-white hover:bg-gray-600"
          onClick={onReset}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
