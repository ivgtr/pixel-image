// Generate RGB values
const crateRGB = () => {
  const rgb: number[] = [0, 0, 0];
  rgb[0] = Math.floor(Math.random() * 256);
  rgb[1] = Math.floor(Math.random() * 256);
  rgb[2] = Math.floor(Math.random() * 256);

  return rgb;
};
// Generate an array of RGB values
const createRGBArray = (num: number) => {
  const arr: number[][] = [];
  for (let i = 0; i < num; i++) {
    arr.push(crateRGB());
  }
  return arr;
};

// Calculate the distance between two points in three dimensions
const getDistance = (point1: number[], point2: number[]) => {
  const x = point1[0] - point2[0];
  const y = point1[1] - point2[1];
  const z = point1[2] - point2[2];

  return x * x + y * y + z * z;
};

const MAX_ITER = 1000;

// Process the received data based on the k-means method
export const cluster = (data: number[][], k: number) => {
  const mat = createRGBArray(k);
  const clusters = [...Array(data.length)].map(() => 0);
  let prevClusters: number[] = [];
  let changed: boolean = true;
  let iter: number = 0;

  while (changed && iter < MAX_ITER) {
    changed = false;
    prevClusters = [...clusters];
    for (let i = 0; i < data.length; i++) {
      let min = Infinity;
      let minIndex = 0;

      for (let j = 0; j < mat.length; j++) {
        const tmp = getDistance(data[i], mat[j]);
        if (tmp < min) {
          min = tmp;
          minIndex = j;
        }
      }
      clusters[i] = minIndex;
    }

    for (let i = 0; i < mat.length; i++) {
      const points = data.filter((_, index) => clusters[index] === i);
      const [r, g, b] = points.reduce((point, acc) => {
        acc[0] = ((acc[0] + point[0]) / 2) | 0;
        acc[1] = ((acc[1] + point[1]) / 2) | 0;
        acc[2] = ((acc[2] + point[2]) / 2) | 0;
        return acc;
      }, mat[i]);
      mat[i] = [r, g, b];
    }

    if (prevClusters.join("") !== clusters.join("")) {
      changed = true;
    }

    iter++;
  }

  return { clusters, mat };
};
