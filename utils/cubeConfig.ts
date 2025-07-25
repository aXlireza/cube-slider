export const adjacencies = {
  0: [2, 3, 5, 4],
  1: [2, 3, 4, 5],
  2: [4, 5, 1, 0],
  3: [4, 5, 1, 0],
  4: [2, 3, 1, 0],
  5: [2, 3, 0, 1],
};

export const unfoldConfigs = (size:number) => ({
  '0-2': { pivot: [size / 2, size / 2, 0], axis: [0, 0, 1] },
  '0-3': { pivot: [size / 2, -size / 2, 0], axis: [0, 0, 1] },
  '0-5': { pivot: [size / 2, 0, -size / 2], axis: [0, 1, 0] },
  '0-4': { pivot: [size / 2, 0, size / 2], axis: [0, 1, 0] },
  '1-2': { pivot: [-size / 2, size / 2, 0], axis: [0, 0, 1] },
  '1-3': { pivot: [-size / 2, -size / 2, 0], axis: [0, 0, 1] },
  '1-4': { pivot: [-size / 2, 0, size / 2], axis: [0, 1, 0] },
  '1-5': { pivot: [-size / 2, 0, -size / 2], axis: [0, 1, 0] },
  '2-4': { pivot: [0, size / 2, size / 2], axis: [1, 0, 0] },
  '2-5': { pivot: [0, size / 2, -size / 2], axis: [1, 0, 0] },
  '2-1': { pivot: [-size / 2, size / 2, 0], axis: [0, 0, 1] },
  '2-0': { pivot: [size / 2, size / 2, 0], axis: [0, 0, 1] },
  '3-4': { pivot: [0, -size / 2, size / 2], axis: [1, 0, 0] },
  '3-5': { pivot: [0, -size / 2, -size / 2], axis: [1, 0, 0] },
  '3-1': { pivot: [-size / 2, -size / 2, 0], axis: [0, 0, 1] },
  '3-0': { pivot: [size / 2, -size / 2, 0], axis: [0, 0, 1] },
  '4-2': { pivot: [0, size / 2, size / 2], axis: [1, 0, 0] },
  '4-3': { pivot: [0, -size / 2, size / 2], axis: [1, 0, 0] },
  '4-1': { pivot: [-size / 2, 0, size / 2], axis: [0, 1, 0] },
  '4-0': { pivot: [size / 2, 0, size / 2], axis: [0, 1, 0] },
  '5-2': { pivot: [0, size / 2, -size / 2], axis: [1, 0, 0] },
  '5-3': { pivot: [0, -size / 2, -size / 2], axis: [1, 0, 0] },
  '5-0': { pivot: [size / 2, 0, -size / 2], axis: [0, 1, 0] },
  '5-1': { pivot: [-size / 2, 0, -size / 2], axis: [0, 1, 0] },
});